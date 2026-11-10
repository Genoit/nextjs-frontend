'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, Loader2 } from 'lucide-react';
import { adsApi, adsErrorCode } from '../../../lib/api/ads';
import { adsErrorText } from '../../../lib/ads-rules.mjs';
import { joinBase64 } from '../../../lib/capture-chunks.mjs';
import {
  AD_CAPTURE_EVENT,
  deleteAdCapture,
  readAdChunks,
  readAdManifest,
  type AdCaptureManifest,
} from '../../../lib/extension-capture';
import { focusRing } from '../../../components/dashboard/DashShell';

const WAIT_MS = 60_000;

type State = { s: 'waiting' } | { s: 'uploading' } | { s: 'done' } | { s: 'error'; text: string };

async function upload(m: AdCaptureManifest) {
  const chunks = await readAdChunks(m);
  const files = m.files.map(
    (f, i) => new File([joinBase64(chunks[i]) as BlobPart], f.name, { type: f.type }),
  );
  await adsApi.uploadCapture(m.adId, m.pageId, files);
}

export default function AdCapturePage() {
  const [state, setState] = useState<State>({ s: 'waiting' });

  useEffect(() => {
    let alive = true;
    let started = false;
    // The extension tags each hand-off; records of any other (older) hand-off are never uploaded.
    const nonce = new URLSearchParams(window.location.search).get('h') ?? '';
    const set = (v: State) => alive && setState(v);

    // Not a fixed deadline: every event from the extension (one per chunk) is progress and
    // restarts the wait, so a slow 100 MB hand-off is not cut off. An event reads only the small
    // manifest; chunk data is read once, after the manifest is complete.
    let timer: ReturnType<typeof setTimeout>;
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (started) return;
        started = true;
        if (nonce) deleteAdCapture(nonce).catch(() => {});
        set({
          s: 'error',
          text: "We didn't receive the ad from the extension. Open the ad in Meta's Ad Library and click the extension again.",
        });
      }, WAIT_MS);
    };

    const attempt = async () => {
      if (started) return;
      arm();
      if (!nonce) return; // opened without a hand-off: wait, then time out
      let manifest: AdCaptureManifest | null = null;
      try {
        manifest = await readAdManifest(nonce);
      } catch {
        return;
      }
      if (!manifest || started) return;
      started = true;
      clearTimeout(timer);
      set({ s: 'uploading' });
      try {
        await upload(manifest);
        set({ s: 'done' });
      } catch (e) {
        set({ s: 'error', text: adsErrorText(adsErrorCode(e)) });
      } finally {
        deleteAdCapture(nonce).catch(() => {});
      }
    };

    window.addEventListener(AD_CAPTURE_EVENT, attempt);
    void attempt();
    return () => {
      alive = false;
      window.removeEventListener(AD_CAPTURE_EVENT, attempt);
      clearTimeout(timer);
    };
  }, []);

  return (
    <main className="min-w-0 px-4 py-10 sm:px-5 lg:pr-8 lg:pl-9">
      <div className="max-w-[520px] rounded-[14px] border border-dash-line bg-dash-panel px-6 py-8 sm:px-8">
        {state.s === 'done' ? (
          <>
            <h1 className="flex items-center gap-2 text-[17px] font-semibold text-white">
              <Check className="size-5 text-success" aria-hidden /> Ad captured
            </h1>
            <p className="mt-2 text-[13.5px] leading-[1.55] text-studio-muted">
              The ad&apos;s media is saved in your private captures.
            </p>
            <Link
              href="/ads/captures"
              className={`mt-5 inline-flex h-[38px] items-center rounded-[10px] bg-trend-orange px-5 text-[13px] font-semibold text-on-accent hover:bg-trend-orange-strong ${focusRing}`}
            >
              See my captures
            </Link>
          </>
        ) : state.s === 'error' ? (
          <>
            <h1 className="text-[17px] font-semibold text-white">Capture failed</h1>
            <p role="alert" className="mt-2 text-[13.5px] leading-[1.55] text-studio-muted">
              {state.text}
            </p>
            <Link
              href="/ads/captures"
              className={`mt-5 inline-flex h-[38px] items-center rounded-[10px] border border-dash-edge px-5 text-[13px] font-medium text-dash-soft hover:text-white ${focusRing}`}
            >
              My captures
            </Link>
          </>
        ) : (
          <>
            <h1 className="flex items-center gap-2 text-[17px] font-semibold text-white">
              <Loader2 className="size-5 animate-spin" aria-hidden />
              {state.s === 'uploading' ? 'Saving your capture' : 'Waiting for the extension'}
            </h1>
            <p role="status" className="mt-2 text-[13.5px] leading-[1.55] text-studio-muted">
              Keep this tab open until the ad is saved.
            </p>
          </>
        )}
      </div>
    </main>
  );
}

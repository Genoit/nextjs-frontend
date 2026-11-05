'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Film, Loader2, Plus } from 'lucide-react';
import {
  DashShell,
  focusRing,
  loadEntries,
  productImage,
  Thumb,
  type Load,
} from '../../components/dashboard/DashShell';
import { FinalVideoPanel } from '../../components/creative/FinalVideoPanel';
import { creativeApi } from '../../lib/api/creative';
import { useAuthedBlobUrl } from '../../hooks/use-assets';
import { isMock, shotsOf } from '../../lib/render-rules.mjs';
import { timeAgo } from '../../lib/dashboard-rules.mjs';
import type { VideoGenerationJob } from '../../lib/types/creative';
import type { Product } from '../../lib/types/product';

type Finished = { product: Product; job: VideoGenerationJob };

/** Completed jobs, newest first: the videos the finishing editor can open. */
function finishedVideos(load: Load): Finished[] {
  if (load.state !== 'ready') return [];
  return load.entries
    .flatMap(({ product, jobs }) => (jobs ?? []).map((job) => ({ product, job })))
    .filter(({ job }) => job.status === 'completed')
    .sort((a, b) => Date.parse(b.job.created_at) - Date.parse(a.job.created_at));
}

/** The FFmpeg finishing editor (formats, exports, download) for one finished video. */
function Editor({ job }: { job: VideoGenerationJob }) {
  const finalAsset = (job.assets ?? []).find((a) => a.asset_type === 'final_video');
  const video = useAuthedBlobUrl(finalAsset ? creativeApi.assetDownloadPath(finalAsset.id) : null);
  if (!finalAsset) {
    return <p className="text-[15px] text-dash-soft">This video has no final file to edit yet.</p>;
  }
  const shots = shotsOf(job);
  const simulated = shots.some((s) => isMock(s));
  // Same rule as the ad flow: a job without per-shot data cannot prove a real render.
  const notReal = simulated || shots.length === 0;
  return (
    <FinalVideoPanel
      job={job}
      finalAsset={finalAsset}
      videoUrl={video.url}
      videoFailed={video.failed}
      notRealLabel={notReal ? (simulated ? 'Simulation' : 'Non vérifié') : null}
    />
  );
}

export default function StudioPage() {
  const [load, setLoad] = useState<Load>({ state: 'loading' });
  const [open, setOpen] = useState<VideoGenerationJob | null>(null);
  const [opening, setOpening] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    loadEntries(100).then((next) => alive && setLoad(next));
    return () => {
      alive = false;
    };
  }, []);

  const videos = finishedVideos(load);
  const now = new Date();

  const pick = async (id: string) => {
    setOpening(id);
    setError(null);
    try {
      setOpen(await creativeApi.getVideoJob(id)); // full job: assets and exports
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'This video could not be opened.');
    } finally {
      setOpening(null);
    }
  };

  return (
    <DashShell>
      <main className="px-5 pb-16 md:pr-12 md:pl-[46px]">
        {error && (
          <p role="alert" className="mb-6 text-[14.5px] text-danger">
            {error}
          </p>
        )}
        {open ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-[28px] font-bold tracking-[-0.02em] text-white">Studio</h1>
              <button
                type="button"
                onClick={() => setOpen(null)}
                className={`rounded-full border border-white/15 px-4 py-2 text-[14px] text-white hover:bg-white/[0.07] ${focusRing}`}
              >
                Choose another video
              </button>
            </div>
            <div className="mt-6">
              <Editor job={open} />
            </div>
          </>
        ) : (
          <section className="flex flex-col items-center pt-[8vh] text-center">
            <span className="flex size-20 items-center justify-center rounded-[22px] bg-white/[0.06] text-dash-soft">
              <Film className="size-9" strokeWidth={1.4} aria-hidden />
            </span>
            <h1 className="mt-8 text-[44px] leading-[1.05] font-extrabold tracking-[-0.03em] text-white sm:text-[64px]">
              {videos.length ? 'No video selected' : 'No videos yet'}
            </h1>
            <p className="mt-4 max-w-[46ch] text-[17px] text-dash-soft">
              {load.state === 'loading'
                ? 'Looking for your finished videos…'
                : videos.length
                  ? 'Pick a video you already generated to finish it: formats, exports and download.'
                  : 'Generate your first ad, then finish it here: formats, exports and download.'}
            </p>
            <Link
              href="/product-input"
              className={`mt-8 inline-flex h-12 items-center gap-2 rounded-[12px] bg-gradient-to-b from-cta-top to-cta-bottom px-7 text-[16px] font-semibold text-on-ember ${focusRing}`}
            >
              <Plus className="size-5" aria-hidden />
              New ad
            </Link>
            {load.state === 'error' && (
              <p className="mt-6 text-[14.5px] text-danger">Your videos could not be loaded.</p>
            )}
            {videos.length > 0 && (
              <ul className="mt-12 flex w-full max-w-[1100px] flex-wrap justify-center gap-3 text-left">
                {videos.map(({ product, job }) => (
                  <li key={job.id} className="w-full sm:w-[340px]">
                    <button
                      type="button"
                      onClick={() => pick(job.id)}
                      disabled={opening !== null}
                      className={`flex w-full items-center gap-4 rounded-[14px] border border-white/10 p-2.5 text-left transition hover:bg-white/[0.05] disabled:cursor-wait ${focusRing}`}
                    >
                      <Thumb
                        src={job.thumbnail_url || productImage(product)}
                        className="h-[60px] w-[96px] rounded-[10px] bg-white"
                        iconSize="size-5"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15.5px] font-medium text-white">
                          {product.title}
                        </span>
                        <span className="mt-0.5 block text-[13.5px] text-dash-soft">
                          {timeAgo(job.completed_at || job.created_at, now)}
                        </span>
                      </span>
                      {opening === job.id && (
                        <Loader2
                          className="size-4 shrink-0 animate-spin text-dash-soft"
                          aria-hidden
                        />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>
    </DashShell>
  );
}

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Music, Trash2, Upload } from 'lucide-react';
import { MusicTrack } from '../../lib/types/creative';
import { creativeApi } from '../../lib/api/creative';
import {
  MUSIC_AUTO,
  MUSIC_MAX_MB,
  MUSIC_NONE,
  musicFileError,
  parseMoods,
  trackDuration,
} from '../../lib/finishing-rules.mjs';

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange';
const secondaryClass = `inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-semibold text-ink hover:bg-zinc-50 disabled:opacity-60 ${focusRing}`;
const dangerClass = `inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-red-700 px-4 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60 ${focusRing}`;
const inputClass =
  'w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 bg-white focus:outline-none focus:border-[#BA3807]';

interface Props {
  /** MUSIC_AUTO, MUSIC_NONE or a track id. */
  value: string;
  onChange: (choice: string) => void;
}

/**
 * Music bed of the setup: automatic (mood match in the library), none, or a chosen track
 * (library or the user's own upload). Sits inside the setup <form>: no nested form here.
 */
export function MusicPicker({ value, onChange }: Props) {
  const [tracks, setTracks] = useState<MusicTrack[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [moods, setMoods] = useState('');
  const [rights, setRights] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const deleteTriggers = useRef<Record<string, HTMLButtonElement | null>>({});
  const listRef = useRef<HTMLFieldSetElement>(null);

  useEffect(() => {
    let cancelled = false;
    creativeApi
      .listMusicTracks()
      .then((list) => {
        if (!cancelled) setTracks(list);
      })
      .catch(() => {
        if (!cancelled) setLoadError('Impossible de charger les musiques.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Focus follows the inline delete confirmation in and back out.
  const wasConfirming = useRef<string | null>(null);
  useEffect(() => {
    if (confirmDelete) cancelRef.current?.focus();
    else if (wasConfirming.current) {
      (deleteTriggers.current[wasConfirming.current] ?? listRef.current)?.focus();
    }
    wasConfirming.current = confirmDelete;
  }, [confirmDelete]);

  const fileError = file ? musicFileError(file) : null;
  const canUpload = !!file && !fileError && !!title.trim() && rights && !uploading;

  const upload = async () => {
    const err = musicFileError(file);
    if (err || !file) return setUploadError(err);
    if (!title.trim()) return setUploadError('Donnez un titre au morceau.');
    if (!rights) return setUploadError("Confirmez que vous détenez les droits d'utilisation.");
    setUploading(true);
    setUploadError(null);
    try {
      const track = await creativeApi.uploadMusicTrack(file, title.trim(), parseMoods(moods));
      setTracks((prev) => [...(prev ?? []), track]);
      onChange(track.id);
      setFile(null);
      setTitle('');
      setMoods('');
      setRights(false);
      if (fileRef.current) fileRef.current.value = '';
      setStatus(`Morceau « ${track.title} » ajouté et sélectionné.`);
    } catch (e: unknown) {
      const detail = e instanceof Error && e.message ? ` ${e.message}` : '';
      setUploadError(`Le morceau n'a pas pu être envoyé.${detail}`);
    } finally {
      setUploading(false);
    }
  };

  const remove = async (track: MusicTrack) => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await creativeApi.deleteMusicTrack(track.id);
      setTracks((prev) => (prev ?? []).filter((t) => t.id !== track.id));
      if (value === track.id) onChange(MUSIC_AUTO);
      delete deleteTriggers.current[track.id];
      setStatus(`Morceau « ${track.title} » supprimé.`);
      setConfirmDelete(null);
    } catch (e: unknown) {
      const detail = e instanceof Error && e.message ? ` ${e.message}` : '';
      setDeleteError(`Suppression impossible.${detail}`);
    } finally {
      setDeleting(false);
    }
  };

  // A stored track id the list no longer has (deleted elsewhere) must not look selected.
  const missing =
    tracks !== null &&
    value !== MUSIC_AUTO &&
    value !== MUSIC_NONE &&
    !tracks.some((t) => t.id === value);

  const option = (id: string, label: React.ReactNode, extra?: React.ReactNode) => (
    <li key={id} className="flex flex-wrap items-start justify-between gap-2 py-2">
      <label className="flex min-h-11 cursor-pointer items-start gap-2 text-sm text-ink">
        <input
          type="radio"
          name="music-choice"
          value={id}
          checked={value === id}
          onChange={() => onChange(id)}
          className="mt-1 accent-[#BA3807]"
        />
        <span>{label}</span>
      </label>
      {extra}
    </li>
  );

  return (
    <div className="space-y-4 sm:col-span-3">
      <fieldset ref={listRef} tabIndex={-1} className={`space-y-1 ${focusRing}`}>
        <legend className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 mb-1">
          <Music className="size-3.5" aria-hidden />
          Musique de fond
        </legend>
        {loadError && (
          <p role="alert" className="text-sm text-red-800">
            {loadError}
          </p>
        )}
        {tracks === null && !loadError && (
          <p className="text-sm text-ink-muted" role="status">
            Chargement des musiques…
          </p>
        )}
        <ul className="divide-y divide-line">
          {option(MUSIC_AUTO, "Automatique : un morceau de la bibliothèque selon l'ambiance")}
          {option(MUSIC_NONE, 'Sans musique')}
          {(tracks ?? []).map((t) =>
            option(
              t.id,
              <>
                <span className="font-semibold">{t.title}</span>
                <span className="block text-xs text-ink-muted">
                  {t.is_library ? 'Bibliothèque' : 'Votre morceau'} · {trackDuration(t.duration_s)}
                  {t.mood.length > 0 && ` · ${t.mood.join(', ')}`} · licence {t.licence}
                </span>
              </>,
              !t.is_library &&
                (confirmDelete === t.id ? (
                  <span role="group" aria-labelledby={`del-${t.id}`} className="space-y-2">
                    <span id={`del-${t.id}`} className="block text-sm font-semibold text-ink">
                      Supprimer « {t.title} » ?
                    </span>
                    <span className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void remove(t)}
                        disabled={deleting}
                        aria-busy={deleting}
                        className={dangerClass}
                      >
                        Supprimer
                      </button>
                      <button
                        ref={cancelRef}
                        type="button"
                        onClick={() => setConfirmDelete(null)}
                        disabled={deleting}
                        className={secondaryClass}
                      >
                        Annuler
                      </button>
                    </span>
                    {deleteError && (
                      <span role="alert" className="block text-sm text-red-800">
                        {deleteError}
                      </span>
                    )}
                  </span>
                ) : (
                  <button
                    ref={(el) => {
                      deleteTriggers.current[t.id] = el;
                    }}
                    type="button"
                    onClick={() => {
                      setDeleteError(null);
                      setConfirmDelete(t.id);
                    }}
                    aria-label={`Supprimer le morceau ${t.title}`}
                    className={secondaryClass}
                  >
                    <Trash2 className="size-4" aria-hidden />
                    Supprimer…
                  </button>
                )),
            ),
          )}
        </ul>
        {missing && (
          <p className="flex items-start gap-1.5 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            Le morceau choisi n&apos;existe plus : choisissez-en un autre.
          </p>
        )}
      </fieldset>

      <details className="rounded-xl border border-line p-3">
        <summary
          className={`inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold text-ink ${focusRing}`}
        >
          <Upload className="size-4" aria-hidden />
          Ajouter votre morceau
        </summary>
        <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="music-file" className="block text-xs font-bold text-zinc-700 mb-1">
              Fichier (MP3, WAV ou M4A, {MUSIC_MAX_MB} Mo max.)
            </label>
            <input
              ref={fileRef}
              id="music-file"
              type="file"
              accept=".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/x-wav,audio/mp4,audio/x-m4a"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setUploadError(null);
              }}
              aria-describedby={fileError ? 'music-file-error' : undefined}
              aria-invalid={!!fileError}
              className="block w-full text-sm text-ink file:mr-3 file:min-h-11 file:rounded-lg file:border file:border-line file:bg-white file:px-4 file:text-sm file:font-semibold"
            />
            {fileError && (
              <p id="music-file-error" className="mt-1 text-sm text-red-800">
                {fileError}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="music-title" className="block text-xs font-bold text-zinc-700 mb-1">
              Titre
            </label>
            <input
              id="music-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="music-moods" className="block text-xs font-bold text-zinc-700 mb-1">
              Ambiances (séparées par des virgules)
            </label>
            <input
              id="music-moods"
              type="text"
              value={moods}
              onChange={(e) => setMoods(e.target.value)}
              placeholder="Ex : upbeat, calm"
              className={inputClass}
            />
          </div>
          <label className="flex min-h-11 items-start gap-2 text-sm text-ink sm:col-span-2">
            <input
              type="checkbox"
              checked={rights}
              onChange={(e) => setRights(e.target.checked)}
              className="mt-1 accent-[#BA3807]"
            />
            <span>Je détiens les droits d&apos;utilisation de ce morceau</span>
          </label>
          <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void upload()}
              disabled={!canUpload}
              aria-busy={uploading}
              className={secondaryClass}
            >
              <Upload className="size-4" aria-hidden />
              {uploading ? 'Envoi…' : 'Envoyer le morceau'}
            </button>
            {uploadError && (
              <p role="alert" className="text-sm text-red-800">
                {uploadError}
              </p>
            )}
          </div>
        </div>
      </details>
      <p className="sr-only" role="status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}

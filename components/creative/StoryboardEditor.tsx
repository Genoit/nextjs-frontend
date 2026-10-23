'use client';

import React, { useState } from 'react';
import { Clock, Video, Camera, Mic, Type, Music, CheckCircle2, Play, Save } from 'lucide-react';
import {
  Storyboard,
  StoryboardScene,
  StoryboardSceneCreatePayload,
} from '../../lib/types/creative';

interface Props {
  storyboard: Storyboard;
  onUpdate: (scenes: StoryboardSceneCreatePayload[], title?: string) => Promise<void>;
  onLaunchVideo: () => Promise<void>;
  isUpdating?: boolean;
  isLaunching?: boolean;
}

export function StoryboardEditor({
  storyboard,
  onUpdate,
  onLaunchVideo,
  isUpdating = false,
  isLaunching = false,
}: Props) {
  const [editedScenes, setEditedScenes] = useState<StoryboardScene[]>(storyboard.scenes);
  const [title, setTitle] = useState(storyboard.title);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Compute total duration
  const totalDuration = editedScenes.reduce((acc, sc) => acc + Number(sc.duration_seconds || 0), 0);
  const isDurationMatching = Math.abs(totalDuration - storyboard.target_duration) <= 1.5;

  const handleSceneChange = <K extends keyof StoryboardScene>(
    index: number,
    field: K,
    val: StoryboardScene[K],
  ) => {
    setEditedScenes((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleSave = async () => {
    const payloads: StoryboardSceneCreatePayload[] = editedScenes.map((s) => ({
      scene_order: s.scene_order,
      duration_seconds: Number(s.duration_seconds),
      narrative_function: s.narrative_function,
      visual_type: s.visual_type,
      visual_description: s.visual_description,
      video_prompt: s.video_prompt,
      camera_movement: s.camera_movement,
      voiceover_text: s.voiceover_text,
      on_screen_text: s.on_screen_text,
      audio_ambiance: s.audio_ambiance,
      continuity_notes: s.continuity_notes,
    }));

    await onUpdate(payloads, title);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Header Card */}
      <div className="rounded-2xl bg-white border border-zinc-200/80 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-[#BA3807] text-white text-xs font-bold uppercase tracking-wider">
                Storyboard Engine
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  isDurationMatching
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>
                  Total : {totalDuration.toFixed(1)}s / {storyboard.target_duration}s
                </span>
              </span>
            </div>
            <div className="pt-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xl font-bold text-zinc-900 border-b border-transparent hover:border-zinc-300 focus:border-[#BA3807] focus:outline-none px-1 py-0.5"
              />
            </div>
            <p className="text-xs text-zinc-500">
              Personnalisez les prompts de caméra, voix-off et sous-titres de chaque scène avant
              génération vidéo.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={isUpdating}
              className="px-4 py-2.5 rounded-xl border border-zinc-300 hover:bg-zinc-50 text-zinc-700 text-xs font-bold transition flex items-center gap-2"
            >
              <Save className="w-4 h-4 text-zinc-500" />
              <span>{isUpdating ? 'Sauvegarde...' : 'Sauvegarder'}</span>
            </button>

            <button
              type="button"
              onClick={onLaunchVideo}
              disabled={isLaunching || !isDurationMatching}
              className="px-5 py-2.5 rounded-xl bg-[#BA3807] hover:bg-[#9A2D04] disabled:opacity-50 text-white text-xs font-bold shadow-xs transition flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{isLaunching ? 'Lancement...' : 'Générer la vidéo MP4'}</span>
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Storyboard et scènes mis à jour avec succès !
          </div>
        )}
      </div>

      {/* Scenes List */}
      <div className="space-y-4">
        {editedScenes.map((scene, idx) => (
          <div
            key={scene.id || idx}
            className="rounded-2xl bg-white border border-zinc-200/80 p-5 shadow-2xs space-y-4 transition hover:border-[#FED7AA]"
          >
            {/* Scene Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#FFF5ED] text-[#BA3807] font-bold text-xs flex items-center justify-center">
                  #{scene.scene_order}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-800 text-xs font-bold uppercase tracking-wider">
                  {scene.narrative_function}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                  Visuel: {scene.visual_type}
                </span>
                {scene.feasibility_status && (
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      scene.feasibility_status === 'feasible'
                        ? 'bg-emerald-100 text-emerald-800'
                        : scene.feasibility_status === 'risky'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {scene.feasibility_status === 'feasible'
                      ? '✓ Faisabilité validée'
                      : scene.feasibility_status === 'risky'
                        ? '⚠️ Risque modéré'
                        : '⚡ Alternative simplifiée'}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Durée :</span>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="30"
                    value={scene.duration_seconds}
                    onChange={(e) =>
                      handleSceneChange(idx, 'duration_seconds', parseFloat(e.target.value) || 3)
                    }
                    className="w-16 px-2 py-1 rounded-lg border border-zinc-200 text-xs font-bold text-zinc-900 focus:outline-none focus:border-[#BA3807]"
                  />
                  <span>sec</span>
                </div>
              </div>
            </div>

            {/* Prompt & Visuals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-[#BA3807]" />
                  <span>Prompt de génération vidéo</span>
                </label>
                <textarea
                  value={scene.video_prompt}
                  onChange={(e) => handleSceneChange(idx, 'video_prompt', e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#BA3807] font-mono leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Mouvement de caméra & Composition</span>
                </label>
                <textarea
                  value={scene.camera_movement}
                  onChange={(e) => handleSceneChange(idx, 'camera_movement', e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#BA3807]"
                />
              </div>
            </div>

            {/* AI Feasibility Fallback Box */}
            {scene.fallback_alternative && (
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <span>⚡ Prompt alternatif stabilisé (Recommandation IA) :</span>
                  </div>
                  <p className="text-amber-800 font-mono text-[11px] leading-relaxed">
                    {scene.fallback_alternative}
                  </p>
                  {scene.feasibility_notes && (
                    <p className="text-[10px] text-amber-700 italic">{scene.feasibility_notes}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleSceneChange(idx, 'video_prompt', scene.fallback_alternative!)
                  }
                  className="px-3 py-1.5 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold shrink-0 transition text-xs"
                >
                  Appliquer
                </button>
              </div>
            )}

            {/* Dialogue / VO & On-screen text */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1 flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-blue-600" />
                  <span>Voix-off / Dialogue prononcé</span>
                </label>
                <input
                  type="text"
                  value={scene.voiceover_text || ''}
                  onChange={(e) => handleSceneChange(idx, 'voiceover_text', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-800 focus:outline-none focus:border-[#BA3807]"
                  placeholder="Ex : Vous en avez marre des bruits parasites au bureau ?"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-purple-600" />
                  <span>Texte affiché à l&apos;écran (Sous-titre / Hook text)</span>
                </label>
                <input
                  type="text"
                  value={scene.on_screen_text || ''}
                  onChange={(e) => handleSceneChange(idx, 'on_screen_text', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-800 focus:outline-none focus:border-[#BA3807]"
                  placeholder="Ex : -40dB de réduction active"
                />
              </div>
            </div>

            {/* Ambiance Note */}
            {scene.audio_ambiance && (
              <div className="flex items-center gap-2 text-[11px] text-zinc-500 bg-zinc-50 px-3 py-1.5 rounded-xl">
                <Music className="w-3.5 h-3.5 text-zinc-400" />
                <span>Ambiance : {scene.audio_ambiance}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

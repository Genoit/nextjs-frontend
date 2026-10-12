'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Sliders,
  Target,
  Clock,
  Smartphone,
  Volume2,
  Tv,
  AlertCircle,
} from 'lucide-react';
import {
  CampaignObjective,
  VideoStyle,
  TargetPlatform,
  UGCSetup,
  UGCSetupCreatePayload,
} from '../../lib/types/creative';

interface Props {
  productId: string;
  initialSetup?: UGCSetup | null;
  onSubmit: (payload: UGCSetupCreatePayload) => Promise<unknown>;
  isLoading?: boolean;
}

const SUGGESTED_ANGLES = [
  'Démonstration concrète en situation réelle',
  'Avant / Après sans artifice',
  'Problème du quotidien résolu en 3 secondes',
  'Expérience utilisateur et déballage immersif',
  'Comparatif honnête avec alternatives génériques',
];

const PREDEFINED_AUDIENCES = [
  'Télétravailleurs et professionnels nomades',
  'Créateurs de contenu et gamers',
  'Passionnés de fitness et bien-être',
  'Parents actifs et familles organisées',
  'Étudiants et jeunes actifs urbains',
];

export const CONCEPT_FAMILIES = [
  {
    id: 'founder_story',
    label: 'Histoire Fondateur',
    desc: 'Genèse, vision & valeurs artisanales',
    icon: '🎙️',
  },
  {
    id: 'cinematic_storytelling',
    label: 'Cinématique Premium',
    desc: 'Élégance, studio & ambiance léchée',
    icon: '🎬',
  },
  {
    id: 'sensory_focus',
    label: 'Publicité Sensorielle',
    desc: 'ASMR, textures & détails tactiles',
    icon: '✨',
  },
  {
    id: 'product_demo',
    label: 'Démonstration Produit',
    desc: 'Efficacité concrète en action directe',
    icon: '🔍',
  },
  {
    id: 'problem_solution',
    label: 'Problème / Solution',
    desc: 'Douleur quotidienne -> remède immédiat',
    icon: '💡',
  },
  {
    id: 'before_after',
    label: 'Avant / Après',
    desc: 'Transformation nette et contraste visuel',
    icon: '⚡',
  },
  {
    id: 'social_proof',
    label: 'Preuve Sociale',
    desc: 'Témoignage authentique & retours clients',
    icon: '⭐',
  },
  {
    id: 'unboxing',
    label: 'Expérience Unboxing',
    desc: 'Déballage immersif & première impression',
    icon: '📦',
  },
  {
    id: 'comparative_challenge',
    label: 'Défi Comparatif',
    desc: 'Face-à-face loyal avec les génériques',
    icon: '⚔️',
  },
  {
    id: 'myth_busting',
    label: 'Démystification',
    desc: 'Idées reçues brisées avec pédagogie',
    icon: '🛡️',
  },
];

export function UGCSetupForm({ productId, initialSetup, onSubmit, isLoading = false }: Props) {
  const [conceptType, setConceptType] = useState<string>(
    initialSetup?.concept_type || 'product_demo',
  );
  const [objective, setObjective] = useState<CampaignObjective>(initialSetup?.objective || 'sales');
  const [targetAudience, setTargetAudience] = useState(
    initialSetup?.target_audience || 'Professionnels et jeunes actifs',
  );
  const [targetMotivation, setTargetMotivation] = useState(
    initialSetup?.target_motivation || 'Gagner du temps et simplifier mon quotidien',
  );
  const [primaryEmotion, setPrimaryEmotion] = useState(
    initialSetup?.primary_emotion || 'confiance',
  );
  const [creativeAngle, setCreativeAngle] = useState(
    initialSetup?.creative_angle || 'Démonstration concrète en situation réelle',
  );
  const [videoStyle, setVideoStyle] = useState<VideoStyle>(initialSetup?.video_style || 'hybrid');
  const [targetDuration, setTargetDuration] = useState<15 | 30 | 45 | 60>(
    initialSetup?.target_duration || 30,
  );
  const [platform, setPlatform] = useState<TargetPlatform>(initialSetup?.platform || 'tiktok');
  const [language, setLanguage] = useState(initialSetup?.language || 'fr');
  const [aspectRatio, setAspectRatio] = useState(initialSetup?.aspect_ratio || '9:16');
  const [callToAction, setCallToAction] = useState(
    initialSetup?.call_to_action || 'Profitez de notre offre exclusive aujourd’hui',
  );
  const [voiceTone, setVoiceTone] = useState(
    (initialSetup?.voice_preferences?.tone as string) || 'naturel et dynamique',
  );
  const [voiceGender, setVoiceGender] = useState(
    (initialSetup?.voice_preferences?.gender as string) || 'female',
  );
  const [musicMood, setMusicMood] = useState(
    (initialSetup?.music_preferences?.mood as string) || 'upbeat',
  );
  const [userConstraints, setUserConstraints] = useState(initialSetup?.user_constraints || '');

  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!targetAudience.trim()) {
      setFormError('Veuillez préciser l’audience cible.');
      return;
    }
    if (!targetMotivation.trim()) {
      setFormError('Veuillez préciser la motivation visée.');
      return;
    }
    if (!callToAction.trim()) {
      setFormError('Veuillez renseigner un appel à l’action (CTA).');
      return;
    }

    const payload: UGCSetupCreatePayload = {
      product_id: productId,
      concept_type: conceptType,
      objective,
      target_audience: targetAudience.trim(),
      target_motivation: targetMotivation.trim(),
      primary_emotion: primaryEmotion.trim(),
      creative_angle: creativeAngle.trim(),
      video_style: videoStyle,
      target_duration: targetDuration,
      platform,
      language,
      aspect_ratio: aspectRatio,
      call_to_action: callToAction.trim(),
      voice_preferences: {
        tone: voiceTone,
        gender: voiceGender,
      },
      music_preferences: {
        mood: musicMood,
      },
      user_constraints: userConstraints.trim() || undefined,
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* Header card */}
      <div className="rounded-2xl bg-white border border-zinc-200/80 p-6 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#BA3807]">
            <Sliders className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              UGC Setup & Paramètres
            </span>
          </div>
          <span className="text-xs text-zinc-400">Étape 2 / 5</span>
        </div>
        <h3 className="text-lg font-bold text-zinc-900">
          Configuration créative et contraintes de génération
        </h3>
        <p className="text-xs text-zinc-500">
          Définissez la stratégie de contenu. Toutes les données sont enregistrées pour pouvoir
          modifier la campagne ultérieurement.
        </p>
      </div>

      {formError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Section 1: Objectif & Audience */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-2xs space-y-6">
        <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
          <Target className="w-4 h-4 text-[#BA3807]" />
          <span>1. Objectif de campagne & Audience cible</span>
        </h4>

        {/* Objective selection */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-2">Objectif commercial</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'sales', label: 'Ventes directes', desc: 'Conversion e-commerce' },
              { id: 'traffic', label: 'Trafic', desc: 'Clics vers la boutique' },
              { id: 'awareness', label: 'Notoriété', desc: 'Visibilité et mémorisation' },
              { id: 'retargeting', label: 'Retargeting', desc: 'Lever les hésitations' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setObjective(item.id as CampaignObjective)}
                className={`p-3.5 rounded-xl border text-left transition ${
                  objective === item.id
                    ? 'border-[#BA3807] bg-[#FFF5ED] ring-1 ring-[#BA3807]'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white'
                }`}
              >
                <div className="font-bold text-xs text-zinc-900">{item.label}</div>
                <div className="text-[11px] text-zinc-500 mt-0.5">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Audience */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-zinc-700">Audience cible</label>
            <span className="text-[11px] text-zinc-400">Cliquez pour suggérer</span>
          </div>
          <input
            type="text"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#BA3807]/20 focus:border-[#BA3807] text-sm text-zinc-900"
            placeholder="Ex : Télétravailleurs cherchant du confort sonore"
            required
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {PREDEFINED_AUDIENCES.map((aud, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTargetAudience(aud)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition"
              >
                + {aud}
              </button>
            ))}
          </div>
        </div>

        {/* Motivation */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-2">
            Motivation ou besoin visé
          </label>
          <input
            type="text"
            value={targetMotivation}
            onChange={(e) => setTargetMotivation(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#BA3807]/20 focus:border-[#BA3807] text-sm text-zinc-900"
            placeholder="Ex : Supprimer les bruits de fond pour se concentrer sans fatigue"
            required
          />
        </div>
      </div>

      {/* Section 2: Angle créatif & Émotion */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-2xs space-y-6">
        <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#BA3807]" />
          <span>2. Famille de Concept & Angle Publicitaire</span>
        </h4>

        {/* 10 Concept Archetypes Selector */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-1">
            Archétype de Concept Publicitaire (10 Familles)
          </label>
          <p className="text-[11px] text-zinc-500 mb-3">
            Sélectionnez la structure narrative optimale pour convertir votre audience cible.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {CONCEPT_FAMILIES.map((fam) => (
              <button
                key={fam.id}
                type="button"
                onClick={() => setConceptType(fam.id)}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  conceptType === fam.id
                    ? 'border-[#BA3807] bg-[#FFF5ED] ring-2 ring-[#BA3807]/20 shadow-2xs'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white'
                }`}
              >
                <div>
                  <span className="text-base">{fam.icon}</span>
                  <div className="font-bold text-xs text-zinc-900 mt-1">{fam.label}</div>
                </div>
                <div className="text-[10px] text-zinc-500 mt-1 line-clamp-2">{fam.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-zinc-700">Angle créatif recommandé</label>
            <button
              type="button"
              onClick={() => {
                const next =
                  SUGGESTED_ANGLES[
                    (SUGGESTED_ANGLES.indexOf(creativeAngle) + 1) % SUGGESTED_ANGLES.length
                  ];
                setCreativeAngle(next);
              }}
              className="text-xs text-[#BA3807] hover:underline font-semibold flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              Suggérer un autre angle
            </button>
          </div>
          <input
            type="text"
            value={creativeAngle}
            onChange={(e) => setCreativeAngle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#BA3807]/20 focus:border-[#BA3807] text-sm text-zinc-900"
            required
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {SUGGESTED_ANGLES.map((ang, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCreativeAngle(ang)}
                className={`text-[11px] px-2.5 py-1 rounded-lg transition ${
                  creativeAngle === ang
                    ? 'bg-[#BA3807] text-white font-medium'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                }`}
              >
                {ang}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-2">Émotion principale</label>
            <select
              value={primaryEmotion}
              onChange={(e) => setPrimaryEmotion(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 bg-white focus:outline-none focus:border-[#BA3807]"
            >
              <option value="confiance">Confiance & Réassurance</option>
              <option value="enthousiasme">Enthousiasme & Excitation</option>
              <option value="soulagement">Soulagement & Sérénité</option>
              <option value="curiosité">Curiosité & Surprise</option>
              <option value="fierté">Fierté & Statut social</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-2">Style de vidéo</label>
            <select
              value={videoStyle}
              onChange={(e) => setVideoStyle(e.target.value as VideoStyle)}
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 bg-white focus:outline-none focus:border-[#BA3807]"
            >
              <option value="hybrid">Hybride (Créateur UGC + Focus Produit)</option>
              <option value="ugc_natural">100% UGC Naturel (Format selfie casual)</option>
              <option value="cinematic">Cinématographique (Éclairage et plans soignés)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 3: Format, Durée & Plateforme */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-2xs space-y-6">
        <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-[#BA3807]" />
          <span>3. Format, Durée & Diffusion</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Duration */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <span>Durée cible</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[15, 30, 45, 60].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setTargetDuration(sec as 15 | 30 | 45 | 60)}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    targetDuration === sec
                      ? 'border-[#BA3807] bg-[#FFF5ED] text-[#BA3807]'
                      : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-2">
              Plateforme principale
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as TargetPlatform)}
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 bg-white focus:outline-none focus:border-[#BA3807]"
            >
              <option value="tiktok">TikTok Ads</option>
              <option value="instagram_reels">Instagram Reels</option>
              <option value="facebook">Facebook Ads</option>
              <option value="youtube">YouTube Shorts</option>
            </select>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-2 flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5 text-zinc-500" />
              <span>Format d&apos;image</span>
            </label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 bg-white focus:outline-none focus:border-[#BA3807]"
            >
              <option value="9:16">9:16 (Vertical TikTok/Reels)</option>
              <option value="1:1">1:1 (Carré Feed)</option>
              <option value="16:9">16:9 (Paysage)</option>
            </select>
          </div>
        </div>

        {/* Call to action & Language */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-zinc-700 mb-2">
              Appel à l&apos;action (CTA)
            </label>
            <input
              type="text"
              value={callToAction}
              onChange={(e) => setCallToAction(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#BA3807]/20 focus:border-[#BA3807] text-sm text-zinc-900"
              placeholder="Ex : Commandez aujourd'hui avec 20% de remise"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-2">
              Langue audio/sous-titres
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 bg-white focus:outline-none focus:border-[#BA3807]"
            >
              <option value="fr">Français (FR)</option>
              <option value="en">English (US)</option>
              <option value="es">Español (ES)</option>
              <option value="de">Deutsch (DE)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 4: Voix, Ambiance & Contraintes */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-2xs space-y-6">
        <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-[#BA3807]" />
          <span>4. Voix-off, Ambiance sonore & Contraintes spécifiques</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-2">Type de voix</label>
            <select
              value={voiceGender}
              onChange={(e) => setVoiceGender(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 bg-white focus:outline-none focus:border-[#BA3807]"
            >
              <option value="female">Voix Féminine</option>
              <option value="male">Voix Masculine</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-2">
              Tonalité de la voix
            </label>
            <input
              type="text"
              value={voiceTone}
              onChange={(e) => setVoiceTone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:border-[#BA3807]"
              placeholder="Ex : chaleureux, complice, énergique"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-2">Ambiance musicale</label>
            <select
              value={musicMood}
              onChange={(e) => setMusicMood(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 bg-white focus:outline-none focus:border-[#BA3807]"
            >
              <option value="upbeat">Rythmée & Énergique (Trendy TikTok)</option>
              <option value="calm">Calme & Apaisante (Acoustique / Lo-Fi)</option>
              <option value="corporate">Inspirante & Moderne (Tech)</option>
              <option value="dramatic">Impactante & Cinématique</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-700 mb-2">
            Directives ou contraintes supplémentaires (Optionnel)
          </label>
          <textarea
            value={userConstraints}
            onChange={(e) => setUserConstraints(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#BA3807]/20 focus:border-[#BA3807] text-sm text-zinc-900"
            placeholder="Ex : Mettre l'accent sur l'autonomie de la batterie. Ne pas mentionner de comparaison directe avec une marque concurrente."
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 rounded-xl bg-[#BA3807] hover:bg-[#9A2D04] disabled:opacity-50 text-white text-sm font-bold shadow-xs transition flex items-center gap-2"
        >
          {isLoading ? (
            <span>Sauvegarde en cours...</span>
          ) : (
            <>
              <span>Sauvegarder & Générer la stratégie créative</span>
              <span>→</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

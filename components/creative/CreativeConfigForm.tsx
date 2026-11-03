'use client';

import React, { useState } from 'react';
import { MusicPicker } from './MusicPicker';
import {
  MUSIC_AUTO,
  MUSIC_NONE,
  musicChoiceOf,
  musicPreferences,
} from '../../lib/finishing-rules.mjs';
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
  CreativeConfig,
  CreativeConfigCreatePayload,
} from '../../lib/types/creative';

interface Props {
  productId: string;
  initialConfig?: CreativeConfig | null;
  onSubmit: (payload: CreativeConfigCreatePayload) => Promise<unknown>;
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

export function CreativeConfigForm({
  productId,
  initialConfig,
  onSubmit,
  isLoading = false,
}: Props) {
  const [conceptType, setConceptType] = useState<string>(
    initialConfig?.concept_type || 'product_demo',
  );
  const [objective, setObjective] = useState<CampaignObjective>(
    initialConfig?.objective || 'sales',
  );
  const [targetAudience, setTargetAudience] = useState(
    initialConfig?.target_audience || 'Professionnels et jeunes actifs',
  );
  const [targetMotivation, setTargetMotivation] = useState(
    initialConfig?.target_motivation || 'Gagner du temps et simplifier mon quotidien',
  );
  const [primaryEmotion, setPrimaryEmotion] = useState(
    initialConfig?.primary_emotion || 'confiance',
  );
  const [creativeAngle, setCreativeAngle] = useState(
    initialConfig?.creative_angle || 'Démonstration concrète en situation réelle',
  );
  const [videoStyle, setVideoStyle] = useState<VideoStyle>(initialConfig?.video_style || 'hybrid');
  const [targetDuration, setTargetDuration] = useState<15 | 30 | 45 | 60>(
    initialConfig?.target_duration || 30,
  );
  const [platform, setPlatform] = useState<TargetPlatform>(initialConfig?.platform || 'tiktok');
  const [language, setLanguage] = useState(initialConfig?.language || 'fr');
  const [aspectRatio, setAspectRatio] = useState(initialConfig?.aspect_ratio || '9:16');
  const [callToAction, setCallToAction] = useState(
    initialConfig?.call_to_action || 'Profitez de notre offre exclusive aujourd’hui',
  );
  const [voiceTone, setVoiceTone] = useState(
    (initialConfig?.voice_preferences?.tone as string) || 'naturel et dynamique',
  );
  const [voiceGender, setVoiceGender] = useState(
    (initialConfig?.voice_preferences?.gender as string) || 'female',
  );
  const storedMood = initialConfig?.music_preferences?.mood as string | undefined;
  const [musicMood, setMusicMood] = useState(
    storedMood && storedMood !== MUSIC_NONE ? storedMood : 'upbeat',
  );
  const [musicChoice, setMusicChoice] = useState(() =>
    musicChoiceOf(initialConfig?.music_preferences),
  );
  const [userConstraints, setUserConstraints] = useState(initialConfig?.user_constraints || '');

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

    const payload: CreativeConfigCreatePayload = {
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
      music_preferences: musicPreferences(musicChoice, musicMood),
      user_constraints: userConstraints.trim() || undefined,
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* Header card */}
      <div className="rounded-2xl bg-studio-ground border border-line/80 p-6 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-trend-orange">
            <Sliders className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Configuration créative
            </span>
          </div>
          <span className="text-xs text-ink-muted">Étape 2 / 5</span>
        </div>
        <h3 className="text-lg font-bold text-ink">
          Configuration créative et contraintes de génération
        </h3>
        <p className="text-xs text-ink-muted">
          Définissez la stratégie de contenu. Toutes les données sont enregistrées pour pouvoir
          modifier la campagne ultérieurement.
        </p>
      </div>

      {formError && (
        <div className="p-4 rounded-xl bg-danger-soft border border-danger/30 flex items-center gap-3 text-xs text-danger">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Section 1: Objectif & Audience */}
      <div className="bg-studio-ground rounded-2xl border border-line/80 p-6 shadow-2xs space-y-6">
        <h4 className="text-sm font-bold text-ink flex items-center gap-2">
          <Target className="w-4 h-4 text-trend-orange" />
          <span>1. Objectif de campagne & Audience cible</span>
        </h4>

        {/* Objective selection */}
        <div>
          <p id="cfg-objective-label" className="block text-xs font-bold text-ink-soft mb-2">
            Objectif commercial
          </p>
          <div
            role="group"
            aria-labelledby="cfg-objective-label"
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
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
                aria-pressed={objective === item.id}
                className={`p-3.5 rounded-xl border text-left transition ${
                  objective === item.id
                    ? 'border-trend-orange bg-cream ring-1 ring-trend-orange'
                    : 'border-line hover:border-line bg-studio-ground'
                }`}
              >
                <div className="font-bold text-xs text-ink">{item.label}</div>
                <div className="text-[11px] text-ink-muted mt-0.5">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Audience */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="cfg-targetAudience" className="text-xs font-bold text-ink-soft">
              Audience cible
            </label>
            <span className="text-[11px] text-ink-muted">Cliquez pour suggérer</span>
          </div>
          <input
            id="cfg-targetAudience"
            type="text"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-line focus:outline-none focus:ring-2 focus:ring-trend-orange/20 focus:border-trend-orange text-sm text-ink"
            placeholder="Ex : Télétravailleurs cherchant du confort sonore"
            required
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {PREDEFINED_AUDIENCES.map((aud, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTargetAudience(aud)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-studio-raised hover:bg-studio-rule text-ink-soft transition"
              >
                + {aud}
              </button>
            ))}
          </div>
        </div>

        {/* Motivation */}
        <div>
          <label
            htmlFor="cfg-targetMotivation"
            className="block text-xs font-bold text-ink-soft mb-2"
          >
            Motivation ou besoin visé
          </label>
          <input
            id="cfg-targetMotivation"
            type="text"
            value={targetMotivation}
            onChange={(e) => setTargetMotivation(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-line focus:outline-none focus:ring-2 focus:ring-trend-orange/20 focus:border-trend-orange text-sm text-ink"
            placeholder="Ex : Supprimer les bruits de fond pour se concentrer sans fatigue"
            required
          />
        </div>
      </div>

      {/* Section 2: Angle créatif & Émotion */}
      <div className="bg-studio-ground rounded-2xl border border-line/80 p-6 shadow-2xs space-y-6">
        <h4 className="text-sm font-bold text-ink flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-trend-orange" />
          <span>2. Famille de Concept & Angle Publicitaire</span>
        </h4>

        {/* 10 Concept Archetypes Selector */}
        <div>
          <p id="cfg-concept-label" className="block text-xs font-bold text-ink-soft mb-1">
            Archétype de Concept Publicitaire (10 Familles)
          </p>
          <p className="text-[11px] text-ink-muted mb-3">
            Sélectionnez la structure narrative optimale pour convertir votre audience cible.
          </p>
          <div
            role="group"
            aria-labelledby="cfg-concept-label"
            className="grid grid-cols-2 sm:grid-cols-5 gap-2.5"
          >
            {CONCEPT_FAMILIES.map((fam) => (
              <button
                key={fam.id}
                type="button"
                onClick={() => setConceptType(fam.id)}
                aria-pressed={conceptType === fam.id}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  conceptType === fam.id
                    ? 'border-trend-orange bg-cream ring-2 ring-trend-orange/20 shadow-2xs'
                    : 'border-line hover:border-line bg-studio-ground'
                }`}
              >
                <div>
                  <span className="text-base">{fam.icon}</span>
                  <div className="font-bold text-xs text-ink mt-1">{fam.label}</div>
                </div>
                <div className="text-[10px] text-ink-muted mt-1 line-clamp-2">{fam.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="cfg-creativeAngle" className="text-xs font-bold text-ink-soft">
              Angle créatif recommandé
            </label>
            <button
              type="button"
              onClick={() => {
                const next =
                  SUGGESTED_ANGLES[
                    (SUGGESTED_ANGLES.indexOf(creativeAngle) + 1) % SUGGESTED_ANGLES.length
                  ];
                setCreativeAngle(next);
              }}
              className="text-xs text-trend-orange hover:underline font-semibold flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              Suggérer un autre angle
            </button>
          </div>
          <input
            id="cfg-creativeAngle"
            type="text"
            value={creativeAngle}
            onChange={(e) => setCreativeAngle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-line focus:outline-none focus:ring-2 focus:ring-trend-orange/20 focus:border-trend-orange text-sm text-ink"
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
                    ? 'bg-trend-orange text-on-accent font-medium'
                    : 'bg-studio-raised hover:bg-studio-rule text-ink-soft'
                }`}
              >
                {ang}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="cfg-primaryEmotion"
              className="block text-xs font-bold text-ink-soft mb-2"
            >
              Émotion principale
            </label>
            <select
              id="cfg-primaryEmotion"
              value={primaryEmotion}
              onChange={(e) => setPrimaryEmotion(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-line text-sm text-ink bg-studio-ground focus:outline-none focus:border-trend-orange"
            >
              <option value="confiance">Confiance & Réassurance</option>
              <option value="enthousiasme">Enthousiasme & Excitation</option>
              <option value="soulagement">Soulagement & Sérénité</option>
              <option value="curiosité">Curiosité & Surprise</option>
              <option value="fierté">Fierté & Statut social</option>
            </select>
          </div>

          <div>
            <label htmlFor="cfg-videoStyle" className="block text-xs font-bold text-ink-soft mb-2">
              Style de vidéo
            </label>
            <select
              id="cfg-videoStyle"
              value={videoStyle}
              onChange={(e) => setVideoStyle(e.target.value as VideoStyle)}
              className="w-full px-3 py-2.5 rounded-xl border border-line text-sm text-ink bg-studio-ground focus:outline-none focus:border-trend-orange"
            >
              <option value="hybrid">Hybride (Créateur UGC + Focus Produit)</option>
              <option value="ugc_natural">100% UGC Naturel (Format selfie casual)</option>
              <option value="cinematic">Cinématographique (Éclairage et plans soignés)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 3: Format, Durée & Plateforme */}
      <div className="bg-studio-ground rounded-2xl border border-line/80 p-6 shadow-2xs space-y-6">
        <h4 className="text-sm font-bold text-ink flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-trend-orange" />
          <span>3. Format, Durée & Diffusion</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Duration */}
          <div>
            <p
              id="cfg-duration-label"
              className="block text-xs font-bold text-ink-soft mb-2 flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-ink-muted" aria-hidden />
              <span>Durée cible</span>
            </p>
            <div
              role="group"
              aria-labelledby="cfg-duration-label"
              className="grid grid-cols-4 gap-1.5"
            >
              {[15, 30, 45, 60].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setTargetDuration(sec as 15 | 30 | 45 | 60)}
                  aria-pressed={targetDuration === sec}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    targetDuration === sec
                      ? 'border-trend-orange bg-cream text-trend-orange'
                      : 'border-line text-ink-soft hover:border-line'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <label htmlFor="cfg-platform" className="block text-xs font-bold text-ink-soft mb-2">
              Plateforme principale
            </label>
            <select
              id="cfg-platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value as TargetPlatform)}
              className="w-full px-3 py-2.5 rounded-xl border border-line text-sm text-ink bg-studio-ground focus:outline-none focus:border-trend-orange"
            >
              <option value="tiktok">TikTok Ads</option>
              <option value="instagram_reels">Instagram Reels</option>
              <option value="facebook">Facebook Ads</option>
              <option value="youtube">YouTube Shorts</option>
            </select>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label
              htmlFor="cfg-aspectRatio"
              className="block text-xs font-bold text-ink-soft mb-2 flex items-center gap-1.5"
            >
              <Tv className="w-3.5 h-3.5 text-ink-muted" />
              <span>Format d&apos;image</span>
            </label>
            <select
              id="cfg-aspectRatio"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-line text-sm text-ink bg-studio-ground focus:outline-none focus:border-trend-orange"
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
            <label
              htmlFor="cfg-callToAction"
              className="block text-xs font-bold text-ink-soft mb-2"
            >
              Appel à l&apos;action (CTA)
            </label>
            <input
              id="cfg-callToAction"
              type="text"
              value={callToAction}
              onChange={(e) => setCallToAction(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-line focus:outline-none focus:ring-2 focus:ring-trend-orange/20 focus:border-trend-orange text-sm text-ink"
              placeholder="Ex : Commandez aujourd'hui avec 20% de remise"
              required
            />
          </div>

          <div>
            <label htmlFor="cfg-language" className="block text-xs font-bold text-ink-soft mb-2">
              Langue audio/sous-titres
            </label>
            <select
              id="cfg-language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-line text-sm text-ink bg-studio-ground focus:outline-none focus:border-trend-orange"
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
      <div className="bg-studio-ground rounded-2xl border border-line/80 p-6 shadow-2xs space-y-6">
        <h4 className="text-sm font-bold text-ink flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-trend-orange" />
          <span>4. Voix-off, Ambiance sonore & Contraintes spécifiques</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="cfg-voiceGender" className="block text-xs font-bold text-ink-soft mb-2">
              Type de voix
            </label>
            <select
              id="cfg-voiceGender"
              value={voiceGender}
              onChange={(e) => setVoiceGender(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-line text-sm text-ink bg-studio-ground focus:outline-none focus:border-trend-orange"
            >
              <option value="female">Voix Féminine</option>
              <option value="male">Voix Masculine</option>
            </select>
          </div>

          <div>
            <label htmlFor="cfg-voiceTone" className="block text-xs font-bold text-ink-soft mb-2">
              Tonalité de la voix
            </label>
            <input
              id="cfg-voiceTone"
              type="text"
              value={voiceTone}
              onChange={(e) => setVoiceTone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-line text-sm text-ink focus:outline-none focus:border-trend-orange"
              placeholder="Ex : chaleureux, complice, énergique"
            />
          </div>

          <div>
            <label htmlFor="cfg-musicMood" className="block text-xs font-bold text-ink-soft mb-2">
              Ambiance musicale
            </label>
            <select
              id="cfg-musicMood"
              value={musicMood}
              onChange={(e) => setMusicMood(e.target.value)}
              disabled={musicChoice === MUSIC_NONE}
              aria-describedby="cfg-musicMood-hint"
              className="w-full px-3 py-2.5 rounded-xl border border-line text-sm text-ink bg-studio-ground focus:outline-none focus:border-trend-orange"
            >
              <option value="upbeat">Rythmée & Énergique (Trendy TikTok)</option>
              <option value="calm">Calme & Apaisante (Acoustique / Lo-Fi)</option>
              <option value="corporate">Inspirante & Moderne (Tech)</option>
              <option value="dramatic">Impactante & Cinématique</option>
            </select>
            <p id="cfg-musicMood-hint" className="mt-1 text-xs text-ink-muted">
              {musicChoice === MUSIC_AUTO
                ? 'Choisit le morceau de la bibliothèque.'
                : musicChoice === MUSIC_NONE
                  ? 'Sans musique : ambiance ignorée.'
                  : 'Morceau choisi ci-dessous.'}
            </p>
          </div>

          <MusicPicker value={musicChoice} onChange={setMusicChoice} />
        </div>

        <div>
          <label
            htmlFor="cfg-userConstraints"
            className="block text-xs font-bold text-ink-soft mb-2"
          >
            Directives ou contraintes supplémentaires (Optionnel)
          </label>
          <textarea
            id="cfg-userConstraints"
            value={userConstraints}
            onChange={(e) => setUserConstraints(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-line focus:outline-none focus:ring-2 focus:ring-trend-orange/20 focus:border-trend-orange text-sm text-ink"
            placeholder="Ex : Mettre l'accent sur l'autonomie de la batterie. Ne pas mentionner de comparaison directe avec une marque concurrente."
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 rounded-xl bg-trend-orange hover:bg-trend-orange-strong disabled:opacity-50 text-on-accent text-sm font-bold shadow-xs transition flex items-center gap-2"
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

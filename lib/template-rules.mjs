// Ad templates: presets of the creative setup form, one per concept the backend knows.
// Structures compiled from public creative guides (see SOURCES); their performance claims are
// the guides' own, not measured by TrendED.

export const TEMPLATE_KEY = 'trended.template';

/** Values the creative setup form accepts. */
const ALLOWED = {
  platform: ['tiktok', 'instagram_reels', 'facebook', 'youtube'],
  video_style: ['hybrid', 'ugc_natural', 'cinematic'],
  target_duration: [15, 30, 45, 60],
  aspect_ratio: ['9:16', '1:1', '16:9'],
  primary_emotion: ['confiance', 'enthousiasme', 'soulagement', 'curiosité', 'fierté'],
  music_mood: ['upbeat', 'calm', 'corporate', 'dramatic'],
};

/**
 * @typedef {{ role: 'hook' | 'context' | 'reveal' | 'demonstration' | 'resolution' | 'cta', label: string, seconds: number }} Beat
 * @typedef {{
 *   id: string, name: string, summary: string, bestFor: string[], note?: string,
 *   concept_type: string, platform: string, video_style: string, target_duration: 15 | 30 | 45 | 60,
 *   aspect_ratio: string, primary_emotion: string, creative_angle: string, call_to_action: string,
 *   voice_tone: string, music_mood: string, beats: Beat[]
 * }} Template
 */

/** @type {Template[]} */
export const TEMPLATES = [
  {
    id: 'problem-solution',
    name: 'Problem to solution',
    summary: 'Name the viewer’s frustration first, then show the product ending it.',
    bestFor: ['Cleaning', 'Kitchen', 'Organisation', 'Gadgets'],
    concept_type: 'problem_solution',
    platform: 'tiktok',
    video_style: 'ugc_natural',
    target_duration: 30,
    aspect_ratio: '9:16',
    primary_emotion: 'soulagement',
    creative_angle: 'Problème du quotidien résolu en 3 secondes',
    call_to_action: 'Découvrez la solution, lien en bio',
    voice_tone: 'naturel et complice',
    music_mood: 'upbeat',
    beats: [
      { role: 'hook', label: 'The frustration', seconds: 3 },
      { role: 'context', label: 'Make it worse', seconds: 5 },
      { role: 'reveal', label: 'Product appears', seconds: 7 },
      { role: 'demonstration', label: 'It works', seconds: 10 },
      { role: 'cta', label: 'Offer', seconds: 5 },
    ],
  },
  {
    id: 'before-after',
    name: 'Before / after',
    summary: 'Open on the result, then rewind to show how the product got there.',
    bestFor: ['Cleaning', 'Home', 'Car care', 'Beauty tools'],
    note: 'Meta restricts before/after claims on health and body appearance.',
    concept_type: 'before_after',
    platform: 'instagram_reels',
    video_style: 'hybrid',
    target_duration: 15,
    aspect_ratio: '9:16',
    primary_emotion: 'fierté',
    creative_angle: 'Avant / Après sans artifice',
    call_to_action: 'Obtenez le même résultat dès aujourd’hui',
    voice_tone: 'enthousiaste et direct',
    music_mood: 'upbeat',
    beats: [
      { role: 'hook', label: 'Result first', seconds: 3 },
      { role: 'context', label: 'Before', seconds: 3 },
      { role: 'demonstration', label: 'Product in use', seconds: 5 },
      { role: 'cta', label: 'After + offer', seconds: 4 },
    ],
  },
  {
    id: 'unboxing',
    name: 'Unboxing reaction',
    summary: 'The parcel builds anticipation; the first reaction sells the product.',
    bestFor: ['Gifts', 'Tech accessories', 'Beauty sets', 'Toys'],
    concept_type: 'unboxing',
    platform: 'tiktok',
    video_style: 'ugc_natural',
    target_duration: 30,
    aspect_ratio: '9:16',
    primary_emotion: 'curiosité',
    creative_angle: 'Expérience utilisateur et déballage immersif',
    call_to_action: 'Commandez le vôtre, livraison rapide',
    voice_tone: 'spontané et curieux',
    music_mood: 'upbeat',
    beats: [
      { role: 'hook', label: 'The parcel', seconds: 3 },
      { role: 'reveal', label: 'Opening', seconds: 7 },
      { role: 'context', label: 'First reaction', seconds: 5 },
      { role: 'demonstration', label: 'Close look', seconds: 10 },
      { role: 'cta', label: 'Offer', seconds: 5 },
    ],
  },
  {
    id: 'fast-demo',
    name: 'Fast demo',
    summary: 'Demo in the first second, quick cuts and big captions, one feature per cut.',
    bestFor: ['Gadgets', 'Kitchen', 'Fitness', 'Phone accessories'],
    concept_type: 'product_demo',
    platform: 'instagram_reels',
    video_style: 'hybrid',
    target_duration: 15,
    aspect_ratio: '9:16',
    primary_emotion: 'enthousiasme',
    creative_angle: 'Démonstration concrète en situation réelle',
    call_to_action: 'Voyez-le en action, commandez maintenant',
    voice_tone: 'rythmé et énergique',
    music_mood: 'upbeat',
    beats: [
      { role: 'hook', label: 'Demo first', seconds: 2 },
      { role: 'demonstration', label: 'Feature one', seconds: 4 },
      { role: 'demonstration', label: 'Feature two', seconds: 4 },
      { role: 'resolution', label: 'Result', seconds: 2 },
      { role: 'cta', label: 'Offer', seconds: 3 },
    ],
  },
  {
    id: 'testimonial',
    name: 'Customer testimonial',
    summary: 'Looks posted by a customer, built around one quote and what changed for them.',
    bestFor: ['Skincare', 'Wellness', 'Pet care', 'Home'],
    note: 'Use real customer words, with their permission.',
    concept_type: 'social_proof',
    platform: 'facebook',
    video_style: 'ugc_natural',
    target_duration: 30,
    aspect_ratio: '1:1',
    primary_emotion: 'confiance',
    creative_angle: 'Témoignage authentique d’un client satisfait',
    call_to_action: 'Rejoignez nos clients satisfaits',
    voice_tone: 'sincère et posé',
    music_mood: 'calm',
    beats: [
      { role: 'hook', label: 'The quote', seconds: 3 },
      { role: 'context', label: 'Who they are', seconds: 6 },
      { role: 'demonstration', label: 'What changed', seconds: 12 },
      { role: 'resolution', label: 'Proof', seconds: 5 },
      { role: 'cta', label: 'Offer', seconds: 4 },
    ],
  },
  {
    id: 'versus',
    name: 'Us vs. generic',
    summary: 'A fair side-by-side test against the usual alternative, then the verdict.',
    bestFor: ['Kitchen', 'Tools', 'Cleaning', 'Bags'],
    concept_type: 'comparative_challenge',
    platform: 'tiktok',
    video_style: 'hybrid',
    target_duration: 30,
    aspect_ratio: '9:16',
    primary_emotion: 'confiance',
    creative_angle: 'Comparatif honnête avec alternatives génériques',
    call_to_action: 'Faites le test vous-même',
    voice_tone: 'factuel et assuré',
    music_mood: 'corporate',
    beats: [
      { role: 'hook', label: 'The challenge', seconds: 3 },
      { role: 'demonstration', label: 'Side by side', seconds: 12 },
      { role: 'resolution', label: 'Verdict', seconds: 5 },
      { role: 'context', label: 'Why it wins', seconds: 6 },
      { role: 'cta', label: 'Offer', seconds: 4 },
    ],
  },
  {
    id: 'myth-fact',
    name: 'Myth vs. fact',
    summary: 'Break a common belief about the category, then prove it with the product.',
    bestFor: ['Skincare', 'Wellness', 'Sleep', 'Cleaning'],
    concept_type: 'myth_busting',
    platform: 'tiktok',
    video_style: 'ugc_natural',
    target_duration: 30,
    aspect_ratio: '9:16',
    primary_emotion: 'curiosité',
    creative_angle: 'Idée reçue démontée preuve à l’appui',
    call_to_action: 'Découvrez la vérité, lien en bio',
    voice_tone: 'pédagogue et direct',
    music_mood: 'corporate',
    beats: [
      { role: 'hook', label: 'The myth', seconds: 3 },
      { role: 'context', label: 'Why people believe it', seconds: 7 },
      { role: 'reveal', label: 'The fact', seconds: 6 },
      { role: 'demonstration', label: 'Product proof', seconds: 9 },
      { role: 'cta', label: 'Offer', seconds: 5 },
    ],
  },
  {
    id: 'sensory',
    name: 'Sensory close-ups',
    summary: 'Macro textures and sounds; no talking, the product carries the video.',
    bestFor: ['Cosmetics', 'Food', 'Candles', 'Textiles'],
    concept_type: 'sensory_focus',
    platform: 'instagram_reels',
    video_style: 'cinematic',
    target_duration: 15,
    aspect_ratio: '9:16',
    primary_emotion: 'curiosité',
    creative_angle: 'Textures et détails sensoriels en gros plan',
    call_to_action: 'Ressentez-le par vous-même',
    voice_tone: 'doux et chuchoté',
    music_mood: 'calm',
    beats: [
      { role: 'hook', label: 'Texture', seconds: 3 },
      { role: 'demonstration', label: 'Macro details', seconds: 6 },
      { role: 'resolution', label: 'In hand', seconds: 3 },
      { role: 'cta', label: 'Packshot', seconds: 3 },
    ],
  },
  {
    id: 'cinematic-hero',
    name: 'Cinematic hero',
    summary: 'A mood, a slow reveal and a hero packshot, made for wide screens.',
    bestFor: ['Fragrance', 'Watches', 'Premium tech', 'Drinks'],
    concept_type: 'cinematic_storytelling',
    platform: 'youtube',
    video_style: 'cinematic',
    target_duration: 30,
    aspect_ratio: '16:9',
    primary_emotion: 'fierté',
    creative_angle: 'Mise en scène premium du produit',
    call_to_action: 'Découvrez la collection',
    voice_tone: 'grave et posé',
    music_mood: 'dramatic',
    beats: [
      { role: 'hook', label: 'Mood', seconds: 4 },
      { role: 'reveal', label: 'Slow reveal', seconds: 8 },
      { role: 'context', label: 'Lifestyle moment', seconds: 10 },
      { role: 'resolution', label: 'Hero packshot', seconds: 4 },
      { role: 'cta', label: 'Offer', seconds: 4 },
    ],
  },
  {
    id: 'founder',
    name: 'Founder story',
    summary: 'Why the product exists, told to camera by the person who made it.',
    bestFor: ['Handmade', 'Eco products', 'Small brands', 'Food'],
    concept_type: 'founder_story',
    platform: 'facebook',
    video_style: 'ugc_natural',
    target_duration: 45,
    aspect_ratio: '9:16',
    primary_emotion: 'confiance',
    creative_angle: 'Histoire du fondateur et savoir-faire',
    call_to_action: 'Soutenez une marque indépendante',
    voice_tone: 'chaleureux et sincère',
    music_mood: 'calm',
    beats: [
      { role: 'hook', label: 'Why I made it', seconds: 4 },
      { role: 'context', label: 'The problem', seconds: 9 },
      { role: 'demonstration', label: 'How it’s made', seconds: 15 },
      { role: 'resolution', label: 'The mission', seconds: 10 },
      { role: 'cta', label: 'Offer', seconds: 7 },
    ],
  },
];

export const SOURCES = [
  {
    label: 'Ecommerce Fastlane: UGC hooks',
    url: 'https://ecommercefastlane.com/ugc-hooks-for-ecommerce/',
  },
  {
    label: 'Imagine: best hooks for video ads',
    url: 'https://www.imagine.art/blogs/best-hooks-for-video-ads-2026',
  },
  { label: 'TikTok Creative Center', url: 'https://ads.tiktok.com/help/article/creative-center' },
  { label: 'Stackmatix: Meta ads examples', url: 'https://www.stackmatix.com/blog/meta-ads-examples' },
  {
    label: 'Shuttlerock: Reels ad creative',
    url: 'https://blog.shuttlerock.com/7-examples-of-effective-reels-ad-creative',
  },
];

/** Total length of a template's beats, in seconds. @param {Template} t */
export const beatsTotal = (t) => t.beats.reduce((s, b) => s + b.seconds, 0);

/**
 * What goes into session storage when a template is picked: its id and the product it is for
 * (null: the next new product).
 * @param {string} id @param {string | null} productId
 */
export const templateHandoff = (id, productId) => JSON.stringify({ id, productId });

/**
 * The template that presets a product's creative setup form, or null. A template picked for this
 * product applies even over a saved setup; one picked for "a new product" applies only while the
 * product has no setup. Unknown ids and broken JSON count as no template.
 * @param {string | null} raw stored handoff
 * @param {string} productId
 * @param {boolean} hasConfig
 * @returns {Template | null}
 */
export function pickedTemplate(raw, productId, hasConfig) {
  if (!raw) return null;
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  const t = TEMPLATES.find((x) => x.id === data?.id);
  if (!t) return null;
  if (data.productId === productId) return t;
  return data.productId === null && !hasConfig ? t : null;
}

/** Every value is one the setup form accepts and the beats add up. @param {Template} t */
export function isValidTemplate(t) {
  return (
    ALLOWED.platform.includes(t.platform) &&
    ALLOWED.video_style.includes(t.video_style) &&
    ALLOWED.target_duration.includes(t.target_duration) &&
    ALLOWED.aspect_ratio.includes(t.aspect_ratio) &&
    ALLOWED.primary_emotion.includes(t.primary_emotion) &&
    ALLOWED.music_mood.includes(t.music_mood) &&
    beatsTotal(t) === t.target_duration
  );
}

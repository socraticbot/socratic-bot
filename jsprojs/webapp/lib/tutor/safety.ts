import { Locale } from '@/lib/i18n/locales';

/**
 * Deterministic crisis check, run before any model call. Models can mistake
 * statements like "nobody would miss me" for beliefs to question, so obvious
 * crisis language never reaches the Socratic prompt.
 *
 * Every language's patterns run on every message, and the reply uses the
 * language that matched. This is a floor, not a classifier: ambiguous phrases
 * that people also use about stress ("ich kann nicht mehr", "ya no puedo más",
 * "撑不下去了") are left to the system prompt's safety rules.
 *
 * zh, de and es patterns were drafted from public suicide-prevention guidance
 * (notes/roadmap-2026/13-multilingual-sources.md) and need native-speaker review.
 */

/** Word boundaries that understand accented letters (JS `\b` is ASCII-only). */
const word = (pattern: string) => new RegExp(`(?<![\\p{L}\\p{N}])(?:${pattern})(?![\\p{L}\\p{N}])`, 'iu');

const PATTERNS: Record<Locale, RegExp[]> = {
  en: [
    /\bsuicid/i,
    /\bkill(ing)?\s+my\s?self\b/i,
    /\bend(ing)?\s+(it\s+all|my\s+life|things)\b/i,
    /\btake\s+my\s+(own\s+)?life\b/i,
    /\b(want|wanna|wish)\s+(to\s+)?(die|be\s+dead|disappear\s+forever)\b/i,
    /\bdon'?t\s+want\s+to\s+(live|be\s+alive|exist|wake\s+up)\b/i,
    /\bno\s+(reason|point)\s+(to|in)\s+(live|living|going\s+on)\b/i,
    /\b(nobody|no\s+one|noone)\s+(would|will)\s+(miss|care|notice)\b/i,
    /\b(better|easier)\s+off\s+(without\s+me|dead|if\s+i\s+(was|were)\s+gone)\b/i,
    /\b(self[-\s]?harm|hurt(ing)?\s+my\s?self|cut(ting)?\s+my\s?self)\b/i,
    /\b(being|getting)\s+(abused|hit|beaten)\b/i,
  ],
  de: [
    word('suizid\\p{L}*|selbstmord\\p{L}*'),
    word('ich\\s+(will|möchte|mag)\\s+nicht\\s+mehr\\s+leben'),
    word('ich\\s+(will|möchte)\\s+(sterben|tot\\s+sein)'),
    word('wünschte,?\\s+ich\\s+wäre\\s+tot'),
    word('ich\\s+bringe?\\s+mich\\s+um'),
    word('mir\\s+das\\s+leben\\s+(zu\\s+)?nehmen'),
    word('es\\s+hat\\s+(alles\\s+)?keinen\\s+sinn\\s+mehr'),
    word('ich\\s+bin\\s+(für\\s+alle\\s+|allen\\s+)?nur\\s+(noch\\s+)?eine\\s+last'),
    word('ohne\\s+mich\\s+wären?\\s+alle\\s+besser\\s+dran'),
    word('(einschlafen|schlafen)\\s+und\\s+nicht\\s+mehr\\s+aufwachen'),
    word('(ich\\s+sehe\\s+)?keinen\\s+ausweg\\s+mehr'),
    word('ich\\s+(tu|will)\\s+mir\\s+(et)?was\\s+an(tun)?'),
    word('ich\\s+ritze\\s+mich|mich\\s+selbst\\s+verletzen'),
    word('niemand\\s+würde\\s+mich\\s+vermissen'),
  ],
  es: [
    word('suicid(io|ios|a|as|arme|arse|arte|ar)'),
    word('ya\\s+no\\s+quiero\\s+vivir'),
    word('(me\\s+quiero|quiero)\\s+morir(me)?'),
    word('quisiera\\s+(estar\\s+muert[oa]|morir(me)?)'),
    word('me\\s+voy\\s+a\\s+matar|quiero\\s+matarme'),
    word('(me\\s+quiero\\s+)?quitar(me)?\\s+la\\s+vida'),
    word('(quiero|me\\s+gustaría)\\s+acabar\\s+con\\s+todo'),
    word('no\\s+le\\s+(encuentro|veo)\\s+sentido\\s+a\\s+la\\s+vida'),
    word('soy\\s+una\\s+carga'),
    word('(todos|todo\\s+el\\s+mundo)\\s+estar(í|i)an?\\s+mejor\\s+sin\\s+m(í|i)'),
    word('ojal(á|a)\\s+no\\s+hubiera\\s+nacido|desear(í|i)a\\s+no\\s+haber\\s+nacido'),
    word('dormir(me)?\\s+y\\s+no\\s+(volver\\s+a\\s+)?despertar'),
    word('no\\s+veo\\s+(ninguna\\s+)?salida'),
    word('hacerme\\s+da(ñ|n)o|me\\s+hago\\s+da(ñ|n)o|cortarme\\s+(las\\s+venas|los\\s+brazos)'),
    word('nadie\\s+me\\s+(extrañaría|extranaria|echaría\\s+de\\s+menos|echaria\\s+de\\s+menos)'),
  ],
  zh: [
    /自杀|轻生|自尽/,
    /不想活/,
    /活着(没|没有)(意思|意义)/,
    /我想死(?![你您他她它])/,
    /希望我死了|我死了算了/,
    /活不下去/,
    /我是(个|一个)?(累赘|大家的负担)/,
    /没有我.{0,6}(会)?(过得)?更好/,
    /(希望|但愿)我(没有|没)出生/,
    /一睡不醒/,
    /结束(这一切|自己的生命|生命)/,
    /割腕|自残|伤害自己/,
    /没有人会(在乎|想念)我/,
  ],
};

export const CRISIS_REPLIES: Record<Locale, string> = {
  en:
    "I'm really sorry you're feeling this way, and I'm glad you said something. " +
    "I'm an AI tutor, so I'm not the right support for this, but you don't have to go through it alone. " +
    'You can find free, confidential help in your country at findahelpline.com, ' +
    "or contact local emergency services if you're in danger right now. " +
    "If you'd like to talk about something else later, I'll be here.",
  de:
    'Es tut mir wirklich leid, dass es dir so geht, und gut, dass du es sagst. ' +
    'Ich bin ein KI-Tutor und nicht die richtige Unterstützung dafür, aber du musst da nicht allein durch. ' +
    'Kostenlos und rund um die Uhr erreichbar: TelefonSeelsorge in Deutschland 0800 111 0 111 oder 0800 111 0 222, ' +
    'in Österreich 142, in der Schweiz 143. Andere Länder findest du auf findahelpline.com. ' +
    'Wenn du in akuter Gefahr bist, ruf den Notruf 112. ' +
    'Wenn du später über etwas anderes reden möchtest, bin ich da.',
  es:
    'Siento mucho que te sientas así, y me alegra que lo hayas dicho. ' +
    'Soy un tutor de IA, así que no soy el apoyo adecuado para esto, pero no tienes que pasar por ello en soledad. ' +
    'Hay ayuda gratuita y confidencial: en España, la línea 024; en México, la Línea de la Vida 800 911 2000; ' +
    'en Argentina, 0800 999 0091; en Colombia, la línea 106. Para otros países, consulta findahelpline.com. ' +
    'Si estás en peligro ahora mismo, llama a los servicios de emergencia. ' +
    'Si más tarde quieres hablar de otra cosa, aquí estaré.',
  zh:
    '听到你这么难受，我真的很难过，也谢谢你愿意说出来。' +
    '我是一个 AI 学习助手，不是能在这件事上帮助你的合适对象，但你不必独自面对。' +
    '在中国大陆，可以拨打全国心理援助热线 12356，或北京心理危机干预中心 010-82951332（24 小时）；' +
    '在新加坡，可以拨打 1767。其他国家和地区可以在 findahelpline.com 查找。' +
    '如果你现在有危险，请拨打 120 或 110。' +
    '如果之后你想聊聊别的，我会在这里。',
};

/** Back-compat for callers that only need the English reply. */
export const CRISIS_REPLY = CRISIS_REPLIES.en;

/** The language whose crisis patterns match `text`, or null. */
export function crisisLocale(text: string): Locale | null {
  // English last: its broad /suicid/ also matches Spanish words, which should get the Spanish reply.
  for (const locale of ['de', 'es', 'zh', 'en'] as Locale[]) {
    if (PATTERNS[locale].some((pattern) => pattern.test(text))) return locale;
  }
  return null;
}

export function isCrisisMessage(text: string): boolean {
  return crisisLocale(text) !== null;
}

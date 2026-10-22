import { describe, expect, it } from 'vitest';
import { CRISIS_REPLIES, crisisLocale } from '@/lib/tutor/safety';

// Seeds from notes/roadmap-2026/13-multilingual-sources.md. Native-speaker review pending.
const crisis: Record<string, string[]> = {
  de: [
    'Ich will nicht mehr leben.',
    'ich möchte tot sein',
    'Manchmal denke ich, ich bring mich um',
    'Ich will mir das Leben nehmen',
    'Es hat alles keinen Sinn mehr',
    'Ich bin allen nur eine Last',
    'Ohne mich wären alle besser dran',
    'Ich will einschlafen und nicht mehr aufwachen',
    'Ich sehe keinen Ausweg mehr',
    'Ich will mir was antun',
    'ich ritze mich',
    'Ich denke an Suizid',
  ],
  es: [
    'Ya no quiero vivir',
    'Me quiero morir',
    'Quisiera estar muerta',
    'Creo que me voy a matar',
    'Me quiero quitar la vida',
    'Quiero acabar con todo',
    'No le encuentro sentido a la vida',
    'Soy una carga para todos',
    'Todos estarían mejor sin mí',
    'Ojalá no hubiera nacido',
    'Quiero dormirme y no despertar',
    'No veo ninguna salida',
    'A veces me hago daño',
    'He pensado en el suicidio',
    'Nadie me extrañaría',
  ],
  zh: [
    '我不想活了',
    '活着没意思',
    '我想死',
    '我想自杀',
    '我真的活不下去了',
    '我是大家的负担',
    '没有我大家会过得更好',
    '真希望我没有出生',
    '想一睡不醒',
    '想结束这一切',
    '我又割腕了',
    '没有人会在乎我',
  ],
  ru: [
    'Я не хочу больше жить',
    'жить не хочется',
    'Я хочу умереть',
    'Лучше бы я умерла',
    'Иногда думаю покончить с собой',
    'Я убью себя',
    'Я не могу так дальше жить',
    'Без меня всем будет лучше',
    'Я всем в тягость',
    'Хочу уснуть и не проснуться',
    'Я не вижу никакого выхода',
    'Я снова режу себя',
    'Думаю о самоубийстве',
    'По мне никто не будет скучать',
  ],
};

const hyperbole = [
  'Ich lach mich tot',
  'Ich sterbe vor Langeweile',
  'Das ist nur eine Last für das Budget',
  'Me muero de risa',
  'Me muero de hambre',
  'Me mata el calor',
  'Me corto el pelo mañana',
  '想死你了',
  '我想死你了',
  '笑死我了',
  '累死了',
  '热死了',
  'Ich will nicht mehr warten',
  'Умираю со смеху',
  'Я умру от скуки на этой лекции',
  'Хочу умереть со смеху от этого видео',
  'Убить его готов',
  'В такую жару сдохнуть можно',
  'Режу салат и слушаю подкаст',
  'Смертельно устал',
  'Убила весь вечер на сериал',
];

describe('multilingual crisis check', () => {
  for (const [locale, phrases] of Object.entries(crisis)) {
    it.each(phrases)(`flags (${locale}) %s and replies in that language`, (text) => {
      expect(crisisLocale(text)).toBe(locale);
    });
  }

  it.each(hyperbole)('does not flag everyday hyperbole: %s', (text) => {
    expect(crisisLocale(text)).toBeNull();
  });

  it('still flags English', () => {
    expect(crisisLocale('nobody would miss me')).toBe('en');
  });

  it.each(Object.entries(CRISIS_REPLIES))('%s reply points to real help without questioning', (_locale, reply) => {
    expect(reply).toContain('findahelpline.com');
    expect(reply).not.toMatch(/[?？¿]/);
  });
});

describe('language attribution', () => {
  it('answers English "suicidal" in English, not Spanish', () => {
    expect(crisisLocale('I have been feeling suicidal')).toBe('en');
    expect(crisisLocale('thinking about suicide')).toBe('en');
  });
});

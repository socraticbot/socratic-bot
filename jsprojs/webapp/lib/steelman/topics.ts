/**
 * Weekly Steel-Man Arena topics. Each is a contested claim with real,
 * thoughtful proponents on both sides, so whichever side someone disagrees
 * with, there is a strong case to write.
 *
 * The set is balanced across the usual political and cultural lines: a
 * topic should be uncomfortable for someone, not for one camp in particular.
 * Avoid claims about the worth of groups of people; steel-manning those
 * would mean writing the best case for contempt.
 */

export type Side = 'for' | 'against';

export interface Topic {
  slug: string;
  /** The claim. "For" argues it; "against" argues `counter`. */
  claim: string;
  /** The opposing claim, worded so a proponent of it would accept the wording. */
  counter: string;
  /** One or two sentences of neutral framing: what is being disputed and why it matters. */
  context: string;
}

export const TOPICS: Topic[] = [
  {
    slug: 'rent-control',
    claim: 'Rent control does more harm than good for renters.',
    counter: 'Rent control protects renters and is worth its costs.',
    context:
      'Cities from Berlin to San Francisco cap how fast rents can rise. The dispute is over who gains, who loses, and over what time frame.',
  },
  {
    slug: 'open-borders',
    claim: 'Rich countries should greatly expand legal immigration.',
    counter: 'Rich countries should keep immigration at or below current levels.',
    context:
      'Immigration policy trades off economic gains, cultural change, wages, public services and the interests of the migrants themselves.',
  },
  {
    slug: 'nuclear-power',
    claim: 'Nuclear power should be a central part of decarbonizing the grid.',
    counter: 'Renewables and storage should lead decarbonization, with no new nuclear.',
    context:
      'Both camps want low-carbon electricity. They disagree on cost, speed of construction, safety, waste and reliability.',
  },
  {
    slug: 'social-media-teens',
    claim: 'Social media has been, on balance, good for teenagers.',
    counter: 'Social media has been, on balance, bad for teenagers.',
    context:
      'Teen mental health indicators worsened in many countries in the 2010s. Researchers disagree on how much social media caused it and what it gave teens in return.',
  },
  {
    slug: 'billionaires',
    claim: 'A society with many billionaires is a sign of a healthy economy.',
    counter: 'A society with many billionaires is a sign of an unhealthy economy.',
    context:
      'Extreme fortunes can reflect value created, rents extracted, or both. The dispute is about what they tell us and what should be done about them.',
  },
  {
    slug: 'ai-pause',
    claim: 'Frontier AI development should be paused until it can be shown to be safe.',
    counter: 'Frontier AI development should continue without a pause.',
    context:
      'People who take AI risk seriously disagree on whether a pause is feasible, enforceable, or would make outcomes better or worse.',
  },
  {
    slug: 'standardized-tests',
    claim: 'Universities should require standardized test scores for admission.',
    counter: 'Universities should not require standardized test scores for admission.',
    context:
      'Many universities dropped test requirements around 2020 and some have since brought them back. The dispute is over fairness, prediction and access.',
  },
  {
    slug: 'organ-markets',
    claim: 'People should be allowed to sell their kidneys.',
    counter: 'Selling kidneys should remain illegal.',
    context:
      'Thousands die each year waiting for a kidney. Iran is the only country with a legal paid-donor system. The dispute is over welfare, consent and exploitation.',
  },
  {
    slug: 'free-speech',
    claim: 'The law should protect speech that most people consider hateful.',
    counter: 'The law should restrict speech that most people consider hateful.',
    context:
      'The US protects almost all such speech; Germany, the UK and many other democracies restrict some of it. Both sides claim to be protecting a free society.',
  },
  {
    slug: 'ubi',
    claim: 'A universal basic income would be better than most existing welfare programs.',
    counter: 'Targeted welfare programs are better than a universal basic income.',
    context:
      'UBI has supporters and critics on both the left and the right. The dispute is over cost, work incentives, dignity and who ends up better or worse off.',
  },
  {
    slug: 'factory-farming',
    claim: 'Factory farming is one of the greatest moral problems of our time.',
    counter: 'Factory farming is not among the greatest moral problems of our time.',
    context:
      'Tens of billions of land animals are farmed each year. The dispute is over how much animal suffering matters morally and how it compares with human problems.',
  },
  {
    slug: 'religion',
    claim: 'Religion does more good than harm in modern societies.',
    counter: 'Religion does more harm than good in modern societies.',
    context:
      'Religion shapes community, charity, conflict and moral life. The question here is its net effect on societies today.',
  },
  {
    slug: 'embryo-selection',
    claim: 'Parents should be free to select embryos for traits like health and intelligence.',
    counter: 'Selecting embryos for traits like intelligence should be prohibited.',
    context:
      'Polygenic screening of IVF embryos is now sold commercially. The dispute is over parental freedom, inequality, accuracy and what it means for how we value people.',
  },
  {
    slug: 'remote-work',
    claim: 'Remote work is worse for most early-career employees.',
    counter: 'Remote work is better for most early-career employees.',
    context:
      'Hybrid and remote work became common after 2020. The dispute is over mentoring, learning, flexibility and who benefits.',
  },
  {
    slug: 'gun-ownership',
    claim: 'Widespread private gun ownership makes a society safer.',
    counter: 'Widespread private gun ownership makes a society less safe.',
    context:
      'Countries and US states vary widely in gun laws and gun ownership. The dispute is over crime, suicide, self-defense and the role of an armed citizenry.',
  },
  {
    slug: 'meat-tax',
    claim: 'Governments should tax meat to reflect its environmental cost.',
    counter: 'Governments should not tax meat.',
    context:
      'Livestock is a large source of emissions and land use. The dispute is over effectiveness, fairness to poorer households, and the role of the state in diet.',
  },
];

export function getTopicBySlug(slug: string): Topic | undefined {
  return TOPICS.find((topic) => topic.slug === slug);
}

/** The claim a writer argues for on a given side. */
export function claimFor(topic: Topic, side: Side): string {
  return side === 'for' ? topic.claim : topic.counter;
}

/**
 * Launch set for "Bias of the day".
 *
 * Each entry is a well-replicated bias with an everyday, politically neutral
 * scenario. The card asks the user to spot the bias before revealing it, since
 * practice with feedback (not reading definitions) is what transfers.
 *
 * The /public/biases illustrations are deliberately not used here: several
 * print inaccurate definitions and their licence is unconfirmed
 * (notes/roadmap-2026/11-bias-list-review.md).
 */

export interface Bias {
  slug: string;
  name: string;
  definition: string;
  scenario: string;
  /** Bias names offered as answers; exactly one matches `name`. */
  options: string[];
  explanation: string;
  counterMove: string;
}

export const BIASES: Bias[] = [
  {
    slug: 'confirmation-bias',
    name: 'Confirmation Bias',
    definition: 'Favoring information that fits what we already believe.',
    scenario:
      'Maya is sure her new coworker dislikes her. She clearly remembers the morning he didn\'t say hi and the meeting where he interrupted her, but not the three times he helped her out.',
    options: ['Anchoring', 'Confirmation Bias', 'Sunk Cost Fallacy'],
    explanation:
      'Maya notices and remembers the evidence that fits her belief and lets the rest slip away, so the belief feels better supported than it is.',
    counterMove: 'Ask: what would I expect to see if I were wrong, and have I looked for it?',
  },
  {
    slug: 'anchoring',
    name: 'Anchoring',
    definition: 'Relying too much on the first number or piece of information we see.',
    scenario:
      'A used car is listed at $18,000. After haggling, Sam pays $15,500 and feels it was a great deal, even though similar cars sell for about $14,000.',
    options: ['Halo Effect', 'Gambler\'s Fallacy', 'Anchoring'],
    explanation:
      'The asking price set a reference point. Sam judged the deal against $18,000 instead of against what the car is actually worth.',
    counterMove: 'Before you see anyone else\'s number, write down your own estimate.',
  },
  {
    slug: 'availability-heuristic',
    name: 'Availability Heuristic',
    definition: 'Judging how likely something is by how easily examples come to mind.',
    scenario:
      'After a week of news coverage about a plane crash, Lee decides to drive 900 km instead of flying, believing it is the safer choice.',
    options: ['Availability Heuristic', 'Status Quo Bias', 'Curse of Knowledge'],
    explanation:
      'Vivid, recent stories make plane crashes easy to picture, so they feel common. Per kilometer, driving is far riskier than flying.',
    counterMove: 'Ask: what are the actual numbers, not the memorable examples?',
  },
  {
    slug: 'framing-effect',
    name: 'Framing Effect',
    definition: 'Reacting differently to the same information depending on how it is presented.',
    scenario:
      'A doctor describes the same operation to two patients. One hears "90% of patients survive." The other hears "10% of patients die." The first patient is much more willing to go ahead.',
    options: ['Optimism Bias', 'Framing Effect', 'Anchoring'],
    explanation:
      'Both statements describe identical odds. Wording it as a gain or a loss changed the decision, not the facts.',
    counterMove: 'Restate the choice the other way around and check whether your answer changes.',
  },
  {
    slug: 'sunk-cost-fallacy',
    name: 'Sunk Cost Fallacy',
    definition: 'Continuing something because of what we have already spent on it.',
    scenario:
      'Priya is an hour into a movie she isn\'t enjoying. She stays to the end because she already paid for the ticket.',
    options: ['Gambler\'s Fallacy', 'Status Quo Bias', 'Sunk Cost Fallacy'],
    explanation:
      'The ticket money is gone whether she stays or leaves. Only the next hour is still a choice.',
    counterMove: 'Ask: if I hadn\'t already spent anything, would I choose this now?',
  },
  {
    slug: 'survivorship-bias',
    name: 'Survivorship Bias',
    definition: 'Drawing conclusions only from the cases that made it through.',
    scenario:
      'A magazine profiles ten college dropouts who became billionaires and concludes that leaving college is a smart path to success.',
    options: ['Survivorship Bias', 'Halo Effect', 'False Consensus'],
    explanation:
      'The many dropouts who did not become billionaires are not in the magazine, so the sample only shows the winners.',
    counterMove: 'Ask: who tried the same thing and failed, and why am I not seeing them?',
  },
  {
    slug: 'fundamental-attribution-error',
    name: 'Fundamental Attribution Error',
    definition: 'Explaining others\' behavior by their character and overlooking their situation.',
    scenario:
      'A cashier is short with Jordan. Jordan decides the cashier is simply a rude person, without considering that they may be near the end of a twelve-hour shift.',
    options: ['Curse of Knowledge', 'Fundamental Attribution Error', 'Confirmation Bias'],
    explanation:
      'Jordan jumped to a judgment about who the cashier is. Situations explain a lot of behavior, and we tend to underweight them for other people.',
    counterMove: 'Ask: what situation would make a reasonable person act this way?',
  },
  {
    slug: 'status-quo-bias',
    name: 'Status Quo Bias',
    definition: 'Preferring things to stay as they are, even when a change would be better.',
    scenario:
      'A company changes its retirement plan so new employees are enrolled automatically unless they opt out. Participation rises sharply, even though the options are exactly the same as before.',
    options: ['Status Quo Bias', 'Optimism Bias', 'Bias Blind Spot'],
    explanation:
      'Many people stick with whatever the default is. Changing the default changed behavior without changing anyone\'s options.',
    counterMove: 'Ask: if the default were the other option, would I switch to this one?',
  },
  {
    slug: 'halo-effect',
    name: 'Halo Effect',
    definition: 'Letting one good impression color our judgment of unrelated qualities.',
    scenario:
      'A job candidate is confident and well dressed. The interviewer rates them higher on honesty and technical skill, neither of which the interview actually tested.',
    options: ['Anchoring', 'False Consensus', 'Halo Effect'],
    explanation:
      'One positive trait spilled over into ratings of traits the interviewer had no evidence about.',
    counterMove: 'Rate each quality separately, using only the evidence for that quality.',
  },
  {
    slug: 'false-consensus',
    name: 'False Consensus Effect',
    definition: 'Overestimating how many people share our opinions and habits.',
    scenario:
      'Chris loves pineapple on pizza and is surprised to learn that most coworkers don\'t. Chris had assumed nearly everyone agreed.',
    options: ['False Consensus Effect', 'Survivorship Bias', 'Framing Effect'],
    explanation:
      'Our own view feels normal, so we assume it is common. Chris projected a personal preference onto the group.',
    counterMove: 'Ask: how would I actually find out what other people think?',
  },
  {
    slug: 'gamblers-fallacy',
    name: 'Gambler\'s Fallacy',
    definition: 'Believing past random events change the odds of future ones.',
    scenario:
      'A roulette wheel lands on red six times in a row. Dana bets heavily on black, sure that black is "due."',
    options: ['Sunk Cost Fallacy', 'Gambler\'s Fallacy', 'Availability Heuristic'],
    explanation:
      'Each spin is independent. The wheel has no memory, so the odds of black are the same as on any other spin.',
    counterMove: 'Ask: does this process have any memory of past results?',
  },
  {
    slug: 'curse-of-knowledge',
    name: 'Curse of Knowledge',
    definition: 'Forgetting what it is like not to know something we know well.',
    scenario:
      'An expert writes setup instructions for a new app and skips the steps that feel obvious to them. Most beginners get stuck on step two.',
    options: ['Curse of Knowledge', 'Fundamental Attribution Error', 'Halo Effect'],
    explanation:
      'Once we know something, it is hard to imagine not knowing it, so we leave out what beginners need.',
    counterMove: 'Have a newcomer try it, or explain it as if to someone who has never seen it.',
  },
  {
    slug: 'automation-bias',
    name: 'Automation Bias',
    definition: 'Trusting automated systems over our own judgment and the evidence in front of us.',
    scenario:
      'A navigation app tells a driver to turn onto a road with a "Road Closed" sign. The driver follows the app and ends up stuck.',
    options: ['Status Quo Bias', 'Automation Bias', 'Anchoring'],
    explanation:
      'The driver let the app override clear evidence. The same thing can happen with AI tools, including this one.',
    counterMove: 'Treat a tool\'s output as a suggestion and check it against what you can see.',
  },
  {
    slug: 'bias-blind-spot',
    name: 'Bias Blind Spot',
    definition: 'Seeing biases in other people more easily than in ourselves.',
    scenario:
      'After reading about cognitive biases, Sam concludes that most people are quite biased, but rates their own judgment as better than average.',
    options: ['Bias Blind Spot', 'Optimism Bias', 'False Consensus Effect'],
    explanation:
      'Learning about biases tends to make us better at spotting them in others, not in ourselves.',
    counterMove: 'Assume you are about as biased as anyone else, and look for where.',
  },
  {
    slug: 'planning-fallacy',
    name: 'Planning Fallacy',
    definition: 'Underestimating how long our own tasks will take, even when we have been late before.',
    scenario:
      'Ravi plans to finish a report in one evening. The last four reports each took about three evenings, but Ravi is confident this one will be different.',
    options: ['Planning Fallacy', 'Sunk Cost Fallacy', 'Bias Blind Spot'],
    explanation:
      'Ravi planned from the best case for this task instead of from how long similar tasks have actually taken.',
    counterMove: 'Start from how long similar tasks really took you, then adjust.',
  },
];

export function getBiasBySlug(slug: string): Bias | undefined {
  return BIASES.find((bias) => bias.slug === slug);
}

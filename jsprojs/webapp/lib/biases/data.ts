/**
 * "Bias of the day" schedule. Index 0 is 2026-10-20 (UTC); the list then
 * cycles. Every 7th day is a review card: an earlier bias in a new scenario,
 * mixed with earlier biases as options (spaced, interleaved practice).
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
  /** Set on review cards: the slug of the earlier card this revisits. */
  reviewOf?: string;
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
    slug: 'confirmation-bias-review',
    name: 'Confirmation Bias',
    reviewOf: 'confirmation-bias',
    definition: 'Favoring information that fits what we already believe.',
    scenario:
      'Jamal believes his new diet gives him more energy. He notices every day he feels great and forgets the tired ones, so the diet seems to be working.',
    options: ['Sunk Cost Fallacy', 'Survivorship Bias', 'Confirmation Bias'],
    explanation:
      'Only the days that fit the belief got counted, so the diet looks better than the evidence shows.',
    counterMove: 'Ask: what would I expect to see if I were wrong, and have I looked for it?',
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
    slug: 'anchoring-review',
    name: 'Anchoring',
    reviewOf: 'anchoring',
    definition: 'Relying too much on the first number or piece of information we see.',
    scenario:
      'A charity form suggests donating $100, $250 or $500. Pia, who planned to give $50, gives $100.',
    options: ['Anchoring', 'Halo Effect', 'Curse of Knowledge'],
    explanation:
      'The suggested amounts set a reference point that pulled the gift upward.',
    counterMove: 'Before you see anyone else\'s number, write down your own estimate.',
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
  {
    slug: 'base-rate-neglect',
    name: 'Base-Rate Neglect',
    definition: 'Ignoring how common something is overall when judging a specific case.',
    scenario:
      'Sam is quiet, loves books, and keeps a tidy desk. Asked whether Sam is more likely a librarian or a salesperson, most people say librarian, even though salespeople outnumber librarians many times over.',
    options: ['Halo Effect', 'Base-Rate Neglect', 'Anchoring'],
    explanation:
      'The description fits a librarian stereotype, but there are so many more salespeople that a quiet, bookish salesperson is still the likelier match.',
    counterMove: 'Ask: how common is each possibility before I look at the details?',
  },
  {
    slug: 'hindsight-bias',
    name: 'Hindsight Bias',
    definition: 'Believing, after something happens, that we saw it coming.',
    scenario:
      'After her team loses the final, Lena tells friends she always knew their defense was too weak. Before the game, she had predicted an easy win.',
    options: ['Confirmation Bias', 'Planning Fallacy', 'Hindsight Bias'],
    explanation:
      'Knowing the outcome reshapes our memory of what we expected, so the result feels like it was predictable all along.',
    counterMove: 'Write predictions down before you know the outcome, then compare.',
  },
  {
    slug: 'authority-bias',
    name: 'Authority Bias',
    definition: 'Giving extra weight to a claim because of who says it, even outside their expertise.',
    scenario:
      'A famous heart surgeon recommends a new budgeting app in an ad. Many viewers download it, trusting the surgeon\'s judgment about personal finance.',
    options: ['Authority Bias', 'Status Quo Bias', 'Planning Fallacy'],
    explanation:
      'Expertise in one field doesn\'t carry over to another, but the surgeon\'s status makes the advice feel credible.',
    counterMove: 'Ask: is this person an expert in this specific question?',
  },
  {
    slug: 'sunk-cost-fallacy-review',
    name: 'Sunk Cost Fallacy',
    reviewOf: 'sunk-cost-fallacy',
    definition: 'Continuing something because of what we have already spent on it.',
    scenario:
      'A company has spent two years on software that still doesn\'t work. Its leaders approve another year of funding because "we\'ve invested too much to stop now."',
    options: ['Status Quo Bias', 'Sunk Cost Fallacy', 'Hindsight Bias'],
    explanation:
      'The two years are spent either way. The only question is whether the next year of funding is worth it.',
    counterMove: 'Ask: if I hadn\'t already spent anything, would I choose this now?',
  },
  {
    slug: 'belief-bias',
    name: 'Belief Bias',
    definition: 'Judging an argument\'s logic by whether we like its conclusion.',
    scenario:
      'Consider: "All flowers need water. Roses need water. So roses are flowers." Many people call this argument logically sound because its conclusion is true.',
    options: ['Gambler\'s Fallacy', 'Confirmation Bias', 'Belief Bias'],
    explanation:
      'Needing water doesn\'t make something a flower, so the reasoning is broken even though the conclusion happens to be true. A believable conclusion hid a bad argument.',
    counterMove: 'Swap in a conclusion you disagree with and check whether the logic still seems fine.',
  },
  {
    slug: 'self-serving-bias',
    name: 'Self-Serving Bias',
    definition: 'Crediting ourselves for successes and blaming circumstances for failures.',
    scenario:
      'When Omar\'s presentation goes well, he credits his preparation. When the next one flops, he blames the projector and a tough audience.',
    options: ['Self-Serving Bias', 'Fundamental Attribution Error', 'Hindsight Bias'],
    explanation:
      'Taking credit for wins and blaming outside factors for losses protects how we feel about ourselves, but it makes it hard to learn from mistakes.',
    counterMove: 'Ask: what part of this outcome was mine, whichever way it went?',
  },
  {
    slug: 'zero-risk-bias',
    name: 'Zero-Risk Bias',
    definition: 'Preferring to eliminate a small risk completely over reducing a bigger risk by more.',
    scenario:
      'A town can either remove a rare contaminant from one well, cutting expected illnesses from 5 to 0, or reduce a common contaminant citywide, cutting illnesses from 50 to 25. Many residents prefer the first plan.',
    options: ['Framing Effect', 'Zero-Risk Bias', 'Status Quo Bias'],
    explanation:
      'The second plan prevents 25 illnesses instead of 5, but getting a risk all the way to zero feels safer.',
    counterMove: 'Compare the total harm prevented, not whether a risk reaches zero.',
  },
  {
    slug: 'forer-effect',
    name: 'Forer Effect',
    definition: 'Rating vague, general descriptions as uniquely accurate about ourselves.',
    scenario:
      'An online quiz tells Mia: "You have a lot of unused potential, and you sometimes doubt whether you\'ve made the right decision." She is amazed at how well it knows her.',
    options: ['Confirmation Bias', 'Bias Blind Spot', 'Forer Effect'],
    explanation:
      'Statements like these fit almost everyone, so they feel personal without saying anything specific.',
    counterMove: 'Ask: would this description fit most people I know?',
  },
  {
    slug: 'outcome-bias',
    name: 'Outcome Bias',
    definition: 'Judging a decision by how it turned out rather than by what was known when it was made.',
    scenario:
      'Jo puts all her savings into a single risky stock on a friend\'s tip, and it triples. Friends praise it as a smart decision.',
    options: ['Outcome Bias', 'Survivorship Bias', 'Gambler\'s Fallacy'],
    explanation:
      'The result was good, but the decision was a gamble with the same information either way. Good outcomes can follow bad decisions, and the reverse.',
    counterMove: 'Ask: would this still look like a good decision if it had turned out badly?',
  },
  {
    slug: 'illusory-truth-effect',
    name: 'Illusory Truth Effect',
    definition: 'Believing a claim more after hearing it repeatedly.',
    scenario:
      'Kai has seen the claim "we only use 10% of our brains" in several videos. Kai can\'t recall any source for it, but it now feels obviously true.',
    options: ['Availability Heuristic', 'Illusory Truth Effect', 'Authority Bias'],
    explanation:
      'Repetition makes a statement feel familiar, and familiarity feels like truth. The 10% claim is a myth.',
    counterMove: 'Ask: do I know why this is true, or have I just heard it a lot?',
  },
  {
    slug: 'availability-heuristic-review',
    name: 'Availability Heuristic',
    reviewOf: 'availability-heuristic',
    definition: 'Judging how likely something is by how easily examples come to mind.',
    scenario:
      'After hearing about a neighbor\'s burglary, Ivy estimates that break-ins in her area are far more common than police records show.',
    options: ['Anchoring', 'Outcome Bias', 'Availability Heuristic'],
    explanation:
      'One vivid, recent story made break-ins easy to picture, so they felt more common than they are.',
    counterMove: 'Ask: what are the actual numbers, not the memorable examples?',
  },
  {
    slug: 'bandwagon-effect',
    name: 'Bandwagon Effect',
    definition: 'Adopting a choice or belief because many others have.',
    scenario:
      'Two restaurants sit side by side. One has a line out the door and the other is empty. Nadia joins the line without checking the menu or any reviews.',
    options: ['Status Quo Bias', 'Halo Effect', 'Bandwagon Effect'],
    explanation:
      'A crowd can be a useful signal, but it can also just mean that others followed the crowd too. Nadia didn\'t check anything else.',
    counterMove: 'Ask: what do I know about this beyond how many people chose it?',
  },
  {
    slug: 'spotlight-effect',
    name: 'Spotlight Effect',
    definition: 'Overestimating how much others notice our appearance and mistakes.',
    scenario:
      'Leo spills coffee on his shirt before a meeting and spends the hour sure that everyone is staring at the stain. Afterward, no one remembers it.',
    options: ['Spotlight Effect', 'Curse of Knowledge', 'Negativity Bias'],
    explanation:
      'We are the center of our own attention, so we assume we are the center of everyone else\'s. Studies find people overestimate how much they are noticed by about double.',
    counterMove: 'Ask: how much did I notice the last time someone else did this?',
  },
  {
    slug: 'ikea-effect',
    name: 'IKEA Effect',
    definition: 'Valuing things more because we made them ourselves.',
    scenario:
      'After two hours assembling a slightly wobbly bookshelf, Ana values it more than a sturdier one from the store and wouldn\'t sell it for what she paid.',
    options: ['Sunk Cost Fallacy', 'IKEA Effect', 'Status Quo Bias'],
    explanation:
      'Successfully building something ourselves raises how much we value it, beyond what it would be worth to anyone else.',
    counterMove: 'Ask: would I value this as much if someone else had made it?',
  },
  {
    slug: 'conjunction-fallacy',
    name: 'Conjunction Fallacy',
    definition: 'Judging a specific combination of events as more likely than one of its parts.',
    scenario:
      'Which is more likely next year: "a major earthquake in California," or "a major earthquake in California that causes a flood"? Many people pick the second.',
    options: ['Availability Heuristic', 'Anchoring', 'Conjunction Fallacy'],
    explanation:
      'Every earthquake that causes a flood is also an earthquake, so the second can never be more likely. Extra detail makes a story vivid, not more probable.',
    counterMove: 'Ask: does this extra detail make it more likely, or just more convincing?',
  },
  {
    slug: 'negativity-bias',
    name: 'Negativity Bias',
    definition: 'Giving more weight to bad experiences and information than to equally good ones.',
    scenario:
      'Rina gets ten kind comments and one critical one on her talk. That night, the criticism is all she can think about.',
    options: ['Negativity Bias', 'Spotlight Effect', 'Confirmation Bias'],
    explanation:
      'Negative information grabs more attention and weighs more, so one criticism can outweigh ten compliments.',
    counterMove: 'Ask: if I weigh the good and the bad equally, what is the overall picture?',
  },
  {
    slug: 'naive-realism',
    name: 'Naive Realism',
    definition: 'Assuming we see the world as it really is, so people who disagree must be uninformed or biased.',
    scenario:
      'Two friends watch a referee\'s close call. Each is sure their view is simply obvious and that the other only sees it differently because of which team they support.',
    options: ['False Consensus Effect', 'Naive Realism', 'Self-Serving Bias'],
    explanation:
      'Each friend treats their own view as plain reality and explains away the other\'s. We rarely notice our own perspective as a perspective.',
    counterMove: 'Ask: what would a reasonable person need to believe to see it the other way?',
  },
  {
    slug: 'framing-effect-review',
    name: 'Framing Effect',
    reviewOf: 'framing-effect',
    definition: 'Reacting differently to the same information depending on how it is presented.',
    scenario:
      'Shoppers prefer ground beef labeled "75% lean" over the same beef labeled "25% fat."',
    options: ['Framing Effect', 'Halo Effect', 'Anchoring'],
    explanation:
      'Both labels describe the same beef. Describing it by what is good rather than what is bad changed the choice.',
    counterMove: 'Restate the choice the other way around and check whether your answer changes.',
  },
  {
    slug: 'clustering-illusion',
    name: 'Clustering Illusion',
    definition: 'Seeing meaningful patterns in random streaks.',
    scenario:
      'Ella\'s playlist is on shuffle and plays three songs by the same artist in a row. She decides the shuffle isn\'t really random.',
    options: ['Gambler\'s Fallacy', 'Confirmation Bias', 'Clustering Illusion'],
    explanation:
      'Random sequences produce streaks more often than we expect. A truly random shuffle often feels less random than one designed to avoid repeats.',
    counterMove: 'Ask: how often would this happen by chance alone?',
  },
  {
    slug: 'reactance',
    name: 'Reactance',
    definition: 'Resisting a request because it feels like a threat to our freedom.',
    scenario:
      'A sign says "Absolutely no phones beyond this point." Rob, who wasn\'t planning to use his phone, suddenly feels a strong urge to check it.',
    options: ['Reactance', 'Status Quo Bias', 'Bandwagon Effect'],
    explanation:
      'Being told we can\'t do something can make it more appealing, as a way of reclaiming our freedom to choose.',
    counterMove: 'Ask: do I actually want this, or do I just not like being told no?',
  },
  {
    slug: 'third-person-effect',
    name: 'Third-Person Effect',
    definition: 'Thinking media messages influence other people more than they influence us.',
    scenario:
      'After a wave of slick ads for a new energy drink, Tom says his friends are being manipulated by the ads but that they have no effect on him.',
    options: ['Halo Effect', 'Third-Person Effect', 'Reactance'],
    explanation:
      'We tend to see others as easier to influence than ourselves, which leaves us less guarded against the same messages.',
    counterMove: 'Ask: if this ad works on other people, why would it not work on me?',
  },
  {
    slug: 'false-memory',
    name: 'False Memory',
    definition: 'Confidently remembering events that never happened, or that happened differently.',
    scenario:
      'Years later, two siblings both vividly remember being the one who found the family\'s lost dog. Only one of them can be right.',
    options: ['Hindsight Bias', 'Self-Serving Bias', 'False Memory'],
    explanation:
      'Memories are rebuilt each time we recall them, so a vivid, confident memory can still be wrong.',
    counterMove: 'Ask: is there a record that could check this memory?',
  },
  {
    slug: 'suggestibility',
    name: 'Suggestibility',
    definition: 'Letting leading questions or later information change what we remember.',
    scenario:
      'After watching a video of a car crash, people asked "How fast were the cars going when they smashed into each other?" recall higher speeds, and some remember broken glass that was never there.',
    options: ['Suggestibility', 'Curse of Knowledge', 'Status Quo Bias'],
    explanation:
      'The word "smashed" changed the memory itself, not just the answer. Information we hear later can quietly rewrite what we think we saw.',
    counterMove: 'Ask: could the way I was asked have shaped what I remember?',
  },
  {
    slug: 'in-group-favoritism',
    name: 'In-Group Favoritism',
    definition: 'Favoring people in our own group, even when the groups are arbitrary.',
    scenario:
      'Volunteers are split into two teams by a coin flip. Asked to divide a bonus, most give more to their own team, even though they have never met anyone on either team.',
    options: ['Bandwagon Effect', 'In-Group Favoritism', 'False Consensus Effect'],
    explanation:
      'A team assigned by a coin flip was enough to make people favor "us" over "them."',
    counterMove: 'Ask: would I decide the same way if this person were on the other team?',
  },
  {
    slug: 'survivorship-bias-review',
    name: 'Survivorship Bias',
    reviewOf: 'survivorship-bias',
    definition: 'Drawing conclusions only from the cases that made it through.',
    scenario:
      'A fan of old houses says buildings from a century ago were built better, pointing to the sturdy old homes still standing in town.',
    options: ['Hindsight Bias', 'Survivorship Bias', 'Halo Effect'],
    explanation:
      'The badly built houses from that era have mostly been torn down, so only the best ones are left to see.',
    counterMove: 'Ask: who tried the same thing and failed, and why am I not seeing them?',
  },
];

export function getBiasBySlug(slug: string): Bias | undefined {
  return BIASES.find((bias) => bias.slug === slug);
}

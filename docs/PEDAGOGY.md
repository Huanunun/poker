# Why the course is shaped this way

Notes on the teaching decisions, written down so that future changes are
arguments rather than accidents.

## The problem with how poker is normally taught

Poker instruction has a characteristic failure. It presents a chart, or a
formula, and the learner memorises it. This works while the situation matches
the chart, and collapses the moment it does not — which is most of the time,
because the space of poker situations is effectively infinite and the chart
covers a few hundred of them.

Worse, memorisation feels like learning. A learner who can recite that a
half-pot bet needs 25% equity, without being able to say why, will confidently
misapply it and never find out.

The specific request that produced this system was from someone with no strong
mathematical background who did not want to memorise odds. That constraint turns
out to be the right design constraint even for people who would happily
memorise, because derived knowledge is repairable and memorised knowledge is
not.

## Step chains

The central format. A decision a beginner cannot make is asked as four or five
questions they can each answer, in the order a strong player would actually
think them.

Facing a bet with a draw is genuinely hard. But:

1. Who is ahead right now?
2. How many cards have you not seen?
3. How many of those give you the better hand?
4. What percentage is that?
5. What price are you being offered?
6. So what do you do?

Every one of those is answerable by a beginner. Nothing in the chain is harder
than counting or one division. And the chain is not a scaffold to be removed
later — it is the actual thinking process, so practising it *is* practising the
skill.

Three details matter in the implementation:

- **Each step is graded on its own.** A learner who miscounts outs but reasons
  correctly from their wrong number gets step 3 wrong and steps 4 to 6 right.
  That is a much more useful signal than one mark for the whole thing.
- **Answered steps stay visible.** By the last question the learner can see the
  chain of reasoning they built. This is the part that transfers to the table.
- **Feedback is computed from the specific hand.** Not "remember to check for
  dirty outs" but "you counted 15, the real answer is 11, because two of those
  clubs pair the board and give them a full house".

## Withholding shortcuts

Every poker book opens with the rule of 2 and 4. Here it appears in level 2,
lesson 5, after four lessons of dividing outs by 47 by hand.

By that point the learner has effectively derived it, and the lesson's job is
only to name the pattern they have already noticed. More importantly, they know
where it breaks: with more than about eight outs the times-four version runs
several points high, because it double counts the runouts where both cards are
outs and you only needed one.

That last bit is the whole point. A shortcut whose error bounds you understand
is safe to use at speed. A shortcut you were handed is a liability, because you
cannot tell when it is lying to you.

The same treatment applies to the fixed prices of standard bet sizes, and to
minimum defence frequency, which is introduced explicitly as the pot odds
calculation the learner already knows, read from the other chair. It is not a
new formula. Presenting it as one would double the perceived difficulty of the
material for no gain.

## Counting instead of algebra

There is no algebra anywhere in the course. Not simplified algebra — none.

- Pot odds: "what share of the final pot is your own money?"
- Combinatorics: "there are four aces, so six ways to pick two of them"
- Equity: "count the good cards, divide by the cards you haven't seen"
- Bluff ratios: "a pot-sized bet offers them 33%, so a third of your bets should
  be bluffs"

Each of these is complete and correct. None is a simplification that will need
to be unlearned. The learner ends up genuinely fluent in poker mathematics while
never having seen an equation, because the mathematics of poker really is just
counting and one division — the algebra was always presentational.

## Skills, not lessons

Progress is tracked against 48 skills in a prerequisite graph, not against
lessons completed. A lesson is an event; a skill is something you can or cannot
do, and it decays.

This matters for scheduling. Standard spaced repetition schedules facts, and you
either recall a fact or you do not. A poker skill is an ability under time
pressure, so the grade comes from performance across a batch of freshly
generated drills rather than a self-reported recall score. Getting a skill wrong
drops its interval hard — a skill you have lost needs practice now, not in three
days.

Strength also decays with elapsed time, not just with failures, so the progress
screen tells the truth about what has gone rusty rather than showing a permanent
record of things you could once do.

## Level gating, and why it is loose

Levels unlock on lessons completed, not on mastery.

Gating on mastery is tempting and wrong. Holding someone at level 2 because
their outs counting sits at 68% would be demoralising, and it is unnecessary:
spaced repetition already drags weak skills forward into later sessions, so the
material keeps getting practised whether or not the path is blocked. Blocking
adds frustration without adding practice.

## Streaks that survive a bad week

Streaks are here because they demonstrably bring people back, and daily return
is the only mechanism by which any of this works.

But a learner who breaks a 40-day streak and quits has been actively harmed by
the feature. So a single missed day spends a freeze rather than resetting to
zero, freezes are earned back every ten days, and two consecutive missed days
without a freeze does reset it. The streak still means something; an ordinary
busy Tuesday does not undo two months.

The same reasoning shapes the 365-day plan. It is a map, not a debt. Miss a
fortnight and sessions resume from what you know, not from where the calendar
says you should be.

## Generated drills over authored ones

Every drill is generated fresh from a seed. This is not primarily about content
volume — it is that authored questions can be pattern-matched. A learner who
sees the same flush-draw-versus-top-pair spot repeatedly learns the answer to
that spot rather than the skill.

Generation also makes the feedback honest. Because the generator has the engine
available, it computes the explanation from the actual hand. There is no way for
the explanation to drift out of sync with the question, which is a real risk in
hand-authored material and an invisible one — nobody notices until a learner
internalises something false.

## What the tests are actually for

Three things, in descending order of importance.

**The engine must be correct**, because everything the learner is graded against
comes from it. A subtly wrong evaluator would teach subtly wrong poker to
everyone who used it, silently. Hence exact enumeration where it is affordable
and assertions on known values like AA versus KK.

**Every generator must produce solvable, self-consistent questions.** The test
runs all 35 across 40 seeds and checks that each grades its own stated answer as
correct and a wrong answer as wrong. A generator that occasionally produces a
question with no right answer would be nearly impossible to catch by hand and
would quietly destroy trust.

**The promises must hold.** The suite simulates a learner doing a session every
day for a year and asserts the course completes with real mastery, and a second
learner getting half of everything wrong who still advances with weak skills
recycled. Those are the two claims the README makes to a prospective user, so
they are the two claims that should fail loudly if they stop being true.

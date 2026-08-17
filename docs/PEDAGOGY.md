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

The specific request that produced this system was from someone who knows the
rules, cannot yet calculate odds or EV, and had already bounced off the existing
tools: "those are super, super complicated, and there's no way to really 100%
memorize them."

That is the correct diagnosis, and it is the design constraint. The charts are
unusable at the table not because the learner is deficient but because recall is
the wrong mechanism. So nothing here is presented for recall. Every number is
derived, from counting, fast enough to use — and derived knowledge is repairable
where memorised knowledge is not.

## Organising the course around five decisions

An early version of this course spent its first thirty days on hand rankings,
card notation and board reading. That was wrong for this learner, and the
feedback was blunt: the questions were far too easy.

The mistake was structural rather than one of calibration. The course was
organised around *topics* — reading, maths, preflop, postflop — which is how
poker books are organised and how nobody actually plays. Poker only ever asks
five questions:

> Bet or check? Call or fold? Raise — and how much?

So every level is now one of those decisions, and the maths strand exists only
to supply their inputs. The reorganisation also fixed the difficulty problem at
its root: a course that opens with "what is this call worth in chips?" cannot
accidentally spend a month on material a learner already knows.

Rules-level drills still exist, tiered as difficulty 1, and are excluded from
the path entirely. They appear only as warm-ups when a learner is actually
getting something wrong. A test enforces this, because it is exactly the kind of
thing that creeps back in.

## Everything reduces to comparing numbers

The unifying move is that every action is priced in big blinds and the correct
play is the largest number. Folding is worth exactly zero, which turns out to be
the single most clarifying fact available to a beginner: it makes sunk cost
disappear as a concept, because the chips already in the pot are simply not part
of any comparison.

This is why the EV engine prices fold, check, call, bet and raise with the same
interface and ranks them. "Should I raise?" stops being a question about nerve
and becomes a question about which of two numbers is larger.

The fold model matters more than it looks. Bigger bets fold out more hands with
diminishing returns, so a flat fold frequency would make the largest bet always
win and would teach precisely the wrong lesson about sizing. The model curves,
and it shifts with opponent stickiness, so "bet bigger against a station" comes
out of the arithmetic rather than being asserted.

### The model's limits are stated, not hidden

The EV model stops at the current street. It does not price the money won on
later streets, which means semi-bluffs are worth more than it reports.

That understatement is disclosed in the lessons themselves rather than quietly
tolerated. A model whose edges you know is usable at the table; a black box that
is silently optimistic in one direction is not. The same applies to villain fold
frequencies, which are always stated out loud in the drill — the honest lesson
is that EV depends on a read, and the skill is knowing how far the answer moves
when the read is wrong.

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

Every poker book opens with the rule of 2 and 4. Here it appears in level 1,
lesson 8, after four lessons of dividing outs by 47 by hand.

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

Progress is tracked against 58 skills in a prerequisite graph, not against
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

## Adaptive difficulty, and treating boredom as a failure

Every drill carries a difficulty tier from 2 to 5, and the session builder holds
a ceiling that tracks the last twenty answers against a 75% accuracy target.
Cruise and it rises; struggle and it falls. It never falls to tier 1, because
that is rules material this course does not teach.

The design commitment is that *too easy is a failure mode*, not a pleasant one.
A learner who gets everything right is being entertained rather than taught, and
the earlier version of this course failed exactly that way. Automating the
response means the learner never has to notice or complain.

Two implementation details earn their keep. The window resets after an
adjustment, so the next judgement is about the new tier rather than a re-reaction
to performance at the old one. And the tier is shown to the learner by name —
Building, Standard, Sharp, Hard — because silent adaptation reads as the app
being broken, while a visible tier makes moving up feel like the achievement it
is.

## Scope: cash games, six to ten players, 100 big blinds

Deliberately narrow. Tournaments, ICM, and short stacks are excluded, and a test
fails the build if any lesson mentions them.

Narrowing is what lets the course be specific. "How much should you open?" has
no general answer, but it has a precise one at a nine-handed cash table at 100bb
with two limpers. Every drill is a spot the learner will actually sit in this
week, and pot sizes are expressed in big blinds throughout — an earlier version
used generic chips and produced spots like "pot 80, they bet 80", which at 100bb
would be nearly all in and quietly taught the wrong sense of scale.

## Progress that belongs to the learner

Local storage is fine until a browser is cleared, at which point a year of work
is gone with no warning and no recourse. So progress exports to a readable JSON
file the learner holds, and imports back anywhere.

Export is offered two ways — a download and a copyable text box — because a
sandboxed page cannot always start a download, and a backup feature that fails
silently in some contexts is worse than none. Import validates and explains what
went wrong in a sentence rather than throwing, since it runs on a file a person
chose and a stack trace is not a useful answer to "that was the wrong file".

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
runs all 51 across 40 seeds and checks that each grades its own stated answer as
correct and a wrong answer as wrong. A generator that occasionally produces a
question with no right answer would be nearly impossible to catch by hand and
would quietly destroy trust.

**The promises must hold.** The suite simulates a learner doing a session every
day for a year and asserts the course completes with real mastery, and a second
learner getting half of everything wrong who still advances with weak skills
recycled. Those are the two claims the README makes to a prospective user, so
they are the two claims that should fail loudly if they stop being true.

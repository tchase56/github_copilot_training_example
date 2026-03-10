---
name: 02-scaffolding
description: Build the Bug Race application from the implementation plan
---
Build the **Bug Race** application using [planning.md](../../planning.md) as the primary implementation source and [Bug-Race-Game.md](../../Bug-Race-Game.md) as requirements validation.

## Goal
Generate a complete, runnable first version of the game with all core requirements implemented, then add bonus features if requested.

## Inputs
- `planning.md` (source of architecture, milestones, validation rules, animation strategy, test plan)
- `Bug-Race-Game.md` (original user stories and constraints)

## Build Rules
1. Treat `planning.md` as the build contract.
2. Implement all **core** features first:
	- 4-lane track and input panel
	- icon selection per lane (3 options), lane naming, speed tier selection
	- predicted winner selection
	- Start button disable/enable lifecycle
	- validation messages (duplicate icons warning, duplicate names error, missing winner error)
	- race animation with random per-bug speed within selected tier
	- stop all racers when first bug reaches finish line
	- session metric for races run
3. Keep implementation modular according to the plan’s structure.
4. Use native browser APIs for animation (`requestAnimationFrame`) unless explicitly told to use a library.
5. Do not add unrelated features.

## Assumptions to Apply (unless overridden)
- Stack: HTML + CSS + vanilla JavaScript.
- No build tool required.
- Speed tiers:
  - slow: `1.2–2.0 px/frame`
  - normal: `2.1–3.2 px/frame`
  - fast: `3.3–4.8 px/frame`

## Required Output
Produce response in this order:

1. `## Implementation Plan of Action`
	- 5–10 concise steps mapped to `planning.md` milestones.
2. `## Files to Create/Update`
	- Explicit file list and one-line purpose for each.
3. `## Code`
	- Full contents for each file, each in its own markdown code block.
	- Minimum expected files:
	  - `index.html`
	  - `styles.css`
	  - `app.js`
	  - `state.js`
	  - `validation.js`
	  - `raceEngine.js`
	  - `metrics.js`
4. `## Manual Test Checklist`
	- Checklist mapped to the test plan in `planning.md`.
5. `## Bonus Feature Hooks`
	- Describe where bonus features plug in (`audio.js`, animation classes, per-bug stats extension points).

## Quality Constraints
- Keep code readable and split by responsibility.
- Avoid global mutable state outside designated state module.
- Ensure race loop cannot produce multiple winners.
- Ensure validation prevents invalid starts.
- Ensure repeated races work without page refresh.

## Completion Criteria
The output is complete only if a developer can copy the files as-is, open `index.html`, and run a full race cycle with validation and session metrics functioning.
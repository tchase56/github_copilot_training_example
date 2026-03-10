---
name: 01-scaffolding
description: Generate a project planning document from the Bug Race game specification
---
Create a **planning document** for implementing the game described in [Bug-Race-Game.md](../Bug-Race-Game.md).

## Goal
Transform the game spec into a practical implementation plan that a developer can execute step-by-step.

## Instructions
1. Read and use all constraints and user stories from `Bug-Race-Game.md`.
2. Treat checked/unchecked boxes in the spec as requirements to cover in the plan.
3. Include both **core requirements** and **bonus features**, but clearly separate them.
4. Keep the plan implementation-oriented (tasks, sequence, validation), not just a summary.
5. If details are unspecified in the source (for example exact speed ranges), propose sensible defaults and label them as assumptions.

## Output Requirements
Produce markdown with the following sections in this exact order:

1. `# Bug Race Implementation Plan`
2. `## 1) Project Summary`
	- One short paragraph explaining the game objective.
3. `## 2) Requirements Breakdown`
	- Group by:
	  - UI/Setup Controls
	  - Race Mechanics
	  - Validation & Error Messaging
	  - Metrics & Session State
	  - Bonus Features
4. `## 3) Architecture & State Model`
	- Proposed file/module structure.
	- Data model for lanes, bugs, race settings, and metrics.
	- Key state transitions (idle → ready → racing → finished).
5. `## 4) Milestones`
	- Provide 4–7 milestones, each with:
	  - objective
	  - task checklist
	  - definition of done
6. `## 5) Validation Rules`
	- Explicit rules for duplicate icons, duplicate names, and missing winner selection.
7. `## 6) Animation Strategy`
	- Explain how bug movement starts/stops and how winner detection halts all racers.
	- Include speed tier assumptions (`slow`, `normal`, `fast`) and randomization approach.
8. `## 7) Test Plan`
	- Functional test checklist mapped to user stories.
	- Edge cases and failure scenarios.
9. `## 8) Delivery Checklist`
	- Final “ready to ship” checklist.

## Formatting Rules
- Use concise bullet points for tasks and checklists.
- Use numbered sections exactly as listed above.
- Do not include code.
- Do not include unrelated feature ideas.
- Keep language specific enough that another developer can implement without re-reading the entire spec.
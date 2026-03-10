# Bug Race Implementation Plan

## 1) Project Summary
Build a browser-based bug racing game with four lanes where users configure each bug (icon and name), choose a race speed, predict a winner, and start a race; the game animates all bugs, stops when the first bug finishes, validates user input with clear errors, and tracks session race metrics plus optional per-bug stats and effects.

## 2) Requirements Breakdown

### UI/Setup Controls
- Show an input panel with lane configuration controls, speed selector, and Start button.
- Provide 4 lane entries, each with:
  - Lane number label.
  - Icon selection radios showing 3 unique bug thumbnails.
  - Name input.
- Provide speed radio group with Slow, Normal, Fast.
- Show race track with 4 horizontal lanes.
- Show winner-pick radio on each lane.

### Race Mechanics
- Allow user to pick one potential winner lane.
- Start race only when required inputs are valid.
- Disable Start button while race is in progress.
- Move each bug across its lane toward finish line.
- Randomize each bug’s race speed within selected speed tier before race begins.
- Stop all movement immediately when first bug reaches finish.

### Validation & Error Messaging
- Warn if same icon is assigned to multiple lanes.
- Error if duplicate bug names are entered.
- Error if Start is clicked with no predicted winner selected.
- Keep messages visible and specific until corrected.

### Metrics & Session State
- Track and display number of races run in current session.
- Persist session metrics during page lifetime.
- Reset lane positions and race status between races while preserving session counts.

### Bonus Features
- Track per-bug races, wins, losses.
- Animate winner bounce on race end.
- Animate losing bugs flipped on backs.
- Play unique start and finish sounds.

## 3) Architecture & State Model

### Proposed File/Module Structure
- `index.html`: layout for control panel, track, metrics, and message area.
- `styles.css`: track/lane visuals, bug sizing, button/error/metrics styling, bonus animation classes.
- `app.js`: bootstrapping, event wiring, state machine orchestration.
- `state.js`: central game state, getters/setters, reset helpers.
- `validation.js`: duplicate icon/name checks and winner-selection validation.
- `raceEngine.js`: speed assignment, animation loop, finish detection, stop logic.
- `metrics.js`: session and per-bug metric updates.
- `audio.js` (bonus): start/end sound playback abstraction.
- `assets/`: bug icons and optional audio files.

### Data Model
- `lanes`: array of 4 lane objects:
  - `laneId`
  - `selectedIconId`
  - `bugName`
  - `predictedWinner` (boolean, one true globally)
  - `positionPx`
  - `currentVelocityPxPerFrame`
- `settings`:
  - `speedTier` (`slow` | `normal` | `fast`)
  - `trackLengthPx`
- `race`:
  - `status` (`idle` | `ready` | `racing` | `finished`)
  - `winnerLaneId` (nullable)
  - `raceId`
- `metrics`:
  - `sessionRacesRun`
  - `perBugStats` keyed by lane/icon/name identity: `races`, `wins`, `losses`
- `ui`:
  - `errors` (blocking)
  - `warnings` (non-blocking)

### Key State Transitions
- `idle → ready`: defaults loaded and minimum required selections made.
- `ready → racing`: Start clicked, validations pass, speeds randomized, positions reset.
- `racing → finished`: first bug reaches finish threshold; engine halts all racers.
- `finished → ready`: user can start next race after post-race UI/metrics update.

## 4) Milestones

### Milestone 1: Base UI Shell
- Objective:
  - Deliver static layout and interactive controls scaffold.
- Task checklist:
  - Build control panel and 4-lane track markup.
  - Add icon selectors, name inputs, speed radios, winner radios, Start button.
  - Add placeholders for warnings/errors and metrics.
- Definition of done:
  - All required controls render correctly and are manually interactable in the browser.

### Milestone 2: State + Validation
- Objective:
  - Implement reliable state updates and pre-race validation.
- Task checklist:
  - Create centralized state object and input-to-state bindings.
  - Add duplicate icon warning detection.
  - Add duplicate name error detection.
  - Add missing winner error on Start.
  - Gate Start behavior by race status and blocking errors.
- Definition of done:
  - Validation messages appear/disappear correctly and invalid race starts are blocked.

### Milestone 3: Core Race Engine
- Objective:
  - Animate race and finish detection with deterministic stop behavior.
- Task checklist:
  - Define speed tier ranges and per-lane randomization.
  - Implement animation loop and lane position updates.
  - Detect first finisher and stop all lanes instantly.
  - Disable Start during race and re-enable at race end.
- Definition of done:
  - A full race runs end-to-end; exactly one winner is declared; all bugs stop on winner finish.

### Milestone 4: Metrics + Reset Flow
- Objective:
  - Add session tracking and stable repeated race flow.
- Task checklist:
  - Increment session race counter after each completed race.
  - Reset lane positions and race fields for next run.
  - Preserve configuration inputs where appropriate.
- Definition of done:
  - Multiple consecutive races run without refresh and session race count is correct.

### Milestone 5: Bonus Metrics + Outcome Animations
- Objective:
  - Implement optional value-add features tied to race outcome.
- Task checklist:
  - Add per-bug races/wins/losses updates.
  - Add winner bounce animation and loser flipped animation.
  - Ensure bonus effects do not break core race completion/reset.
- Definition of done:
  - Bonus metrics and animations trigger correctly and remain optional/non-blocking.

### Milestone 6: Bonus Audio + Polish
- Objective:
  - Final UX polish and readiness checks.
- Task checklist:
  - Play unique sound on race start and race finish.
  - Refine message text clarity and visual hierarchy.
  - Run complete functional and edge-case checklist.
- Definition of done:
  - Core and enabled bonus features pass test plan with no blocking defects.

## 5) Validation Rules
- Duplicate icons:
  - Rule: each lane must have a unique selected icon.
  - Behavior: show warning when duplicates exist; warning clears when uniqueness restored.
  - Start policy: allowed with warning (or block if team chooses stricter mode, but keep behavior consistent).
- Duplicate names:
  - Rule: bug names must be unique across all 4 lanes (case-insensitive, trimmed).
  - Behavior: show blocking error and prevent race start until resolved.
- Missing winner selection:
  - Rule: exactly one predicted winner lane must be selected before race start.
  - Behavior: show blocking error when Start clicked without selection.
- Additional consistency rules:
  - Ignore leading/trailing spaces in names for duplicate checks.
  - Prevent Start while status is `racing`.

## 6) Animation Strategy
- Movement model:
  - Use frame-based updates with elapsed-time normalization so speed is stable across devices.
  - Represent each bug position in pixels from lane start.
- Start behavior:
  - On race start, reset all positions to 0.
  - Assign each lane a randomized velocity sampled from selected speed tier range.
  - Begin single animation loop updating all lanes each frame.
- Winner detection and global halt:
  - After each frame update, check if any bug crosses finish threshold.
  - On first crossing, capture winner once, set status to `finished`, stop loop, freeze all positions.
- Speed tier assumptions:
  - `slow`: 1.2–2.0 px/frame
  - `normal`: 2.1–3.2 px/frame
  - `fast`: 3.3–4.8 px/frame
- Randomization approach:
  - Uniform random per bug within tier bounds at race start.
  - Optional tiny variance cap to avoid ties while preserving unpredictability.

## 7) Test Plan

### Functional Checklist (Mapped to User Stories)
- Input panel, 4-lane track, lane winner radios, Start button are visible.
- Each lane shows lane number, 3 icon choices, and a name input.
- Speed selector supports Slow/Normal/Fast and updates settings state.
- User can pick lane icon and name per lane.
- Duplicate icon warning appears for repeated icon selections.
- Duplicate name error appears for repeated names.
- User can select predicted winner lane.
- Start triggers race only when validations pass.
- Start remains disabled during race and re-enables after completion.
- Error appears if no predicted winner was selected.
- Bugs animate to finish line; first finisher ends race and all bugs stop.
- Session race counter increments after each completed race.
- Bonus: per-bug stats update correctly.
- Bonus: winner bounce and loser flip effects trigger on race end.
- Bonus: start/finish sounds play at correct times.

### Edge Cases & Failure Scenarios
- Name duplicates with case/space variation (e.g., “Bolt” vs “ bolt ”).
- Rapid Start clicks at race begin.
- Winner radio changed immediately before Start.
- All lanes configured with same icon.
- Empty names allowed vs required (decide policy and test accordingly).
- Very close finish events in same frame (ensure single winner).
- Consecutive races (10+) without drift in metrics or positions.
- Audio asset missing or blocked by autoplay policy (graceful fallback).
- Browser tab throttling/resume does not corrupt race status.

## 8) Delivery Checklist
- Core UI controls and 4-lane track implemented.
- Core validations implemented with correct warning/error behavior.
- Race engine randomizes per-bug speed by tier and halts on first finisher.
- Start button lock/unlock behavior matches race state.
- Session race counter updates correctly across repeated races.
- Core user stories manually verified via checklist.
- Bonus features (if included) verified and isolated from core stability.
- Final pass completed for UX clarity, no blocking defects, ready for handoff.

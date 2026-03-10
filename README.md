# Bug Race 🐛

A browser-based bug racing game where players configure four lanes of bugs, predict the winner, and watch them race to the finish line.

## Overview

Bug Race is a lightweight, single-page game built with vanilla HTML, CSS, and JavaScript — no build tools or external dependencies required. Players customise each lane by choosing a bug icon and giving their bug a name, select a race speed, predict which bug will win, and then start the race. The first bug to cross the finish line wins.

The game tracks session metrics, plays sound effects, and rewards the winning bug with a bounce animation while the losers flip over.

## Features

- **Lane configuration** — Four independent lanes, each with:
  - A choice of three unique bug icons
  - A free-text name field for the bug
- **Speed control** — Choose Slow, Normal, or Fast before each race
- **Winner prediction** — Pick the lane you think will win before clicking Start
- **Animated race** — Bugs travel across the track at randomised speeds within the selected tier; the race stops the instant the first bug crosses the finish line
- **Input validation**
  - Warning shown when the same icon is assigned to more than one lane
  - Error shown when duplicate bug names are entered
  - Error shown when no predicted winner is selected at race start
- **Session metrics** — Displays the number of races run in the current session
- **Per-bug statistics** — Tracks races run, wins, and losses for each bug
- **Outcome animations** — Winner bounces; losers flip on their backs
- **Sound effects** — Unique audio cues on race start and race finish

## Project Structure

| File | Purpose |
|---|---|
| `index.html` | Application markup — control panel, race track, metrics, and message areas |
| `styles.css` | All styling including track layout, lane visuals, animations, and responsive design |
| `app.js` | Entry point — bootstraps the UI, wires events, and orchestrates the state machine |
| `state.js` | Central game state with getters, setters, and reset helpers |
| `validation.js` | Duplicate icon/name checks and winner-selection validation |
| `raceEngine.js` | Speed assignment, animation loop, finish detection, and stop logic |
| `metrics.js` | Session and per-bug metric updates |
| `audio.js` | Race start and finish sound playback |

## How to Run

Because the application uses ES modules (`import`/`export`), it must be served over HTTP rather than opened directly as a local file. Any static file server will work.

### Option 1 — VS Code Live Server

1. Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension in VS Code.
2. Right-click `index.html` in the Explorer panel and choose **Open with Live Server**.
3. Your browser will open automatically at `http://127.0.0.1:5500`.

### Option 2 — Python built-in server

```bash
# Python 3
python -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080) in your browser.

### Option 3 — Node.js `serve` package

```bash
npx serve .
```

Then open the URL printed in the terminal (typically [http://localhost:3000](http://localhost:3000)).

## How to Play

1. **Configure your bugs** — For each of the four lanes, select a bug icon using the radio buttons and optionally enter a name in the text field.
2. **Pick a speed** — Choose Slow, Normal, or Fast from the Speed panel.
3. **Predict the winner** — Click the radio button next to the lane you think will win.
4. **Start the race** — Click the **Start** button. It will be disabled until the race finishes.
5. **Watch the results** — The first bug to reach the finish line wins. A message confirms whether your prediction was correct.
6. **Run again** — The track resets automatically after each race. Session and per-bug statistics accumulate across consecutive races.

### Validation rules

| Situation | Message type | Effect on Start |
|---|---|---|
| Same icon selected in two or more lanes | Warning | Start is still allowed |
| Same name used in two or more lanes | Error | Start is blocked |
| No predicted winner selected | Error | Start is blocked |

## Browser Compatibility

The game uses standard Web Platform APIs (ES modules, `requestAnimationFrame`, Web Audio API) and is compatible with all modern browsers (Chrome, Firefox, Edge, Safari).

import {
  ICON_OPTIONS,
  state,
  beginRace,
  finishRace,
  getPredictedWinnerLaneId,
  incrementSessionRaceCount,
  markReadyState,
  recordRaceOutcome,
  resetLanePositions,
  setError,
  setLaneIcon,
  setLaneName,
  setLanePosition,
  setLaneVelocity,
  setPredictedWinner,
  setResult,
  setSpeedTier,
  setTrackLength,
  setWarning
} from "./state.js";
import { validateBeforeStart } from "./validation.js";
import { runRace } from "./raceEngine.js";
import { updateSessionMetrics } from "./metrics.js";
import { playRaceEndSound, playRaceStartSound } from "./audio.js";

const elements = {
  laneConfigList: document.querySelector("#lane-config-list"),
  track: document.querySelector("#track"),
  warningText: document.querySelector("#warning-text"),
  errorText: document.querySelector("#error-text"),
  resultText: document.querySelector("#result-text"),
  startButton: document.querySelector("#start-btn"),
  racesRun: document.querySelector("#races-run"),
  bugStatsList: document.querySelector("#bug-stats-list")
};

let activeRaceControl = null;

function iconById(iconId) {
  return ICON_OPTIONS.find((icon) => icon.id === iconId) ?? ICON_OPTIONS[0];
}

function renderLaneConfigControls() {
  elements.laneConfigList.innerHTML = "";

  for (const lane of state.lanes) {
    const card = document.createElement("section");
    card.className = "lane-config";

    const topRow = document.createElement("div");
    topRow.className = "lane-config-top";

    const laneLabel = document.createElement("strong");
    laneLabel.textContent = `Lane ${lane.laneId}`;
    topRow.appendChild(laneLabel);

    const iconList = document.createElement("div");
    iconList.className = "icon-options";

    for (const icon of ICON_OPTIONS) {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `lane-${lane.laneId}-icon`;
      input.value = icon.id;
      input.checked = lane.selectedIconId === icon.id;
      input.addEventListener("change", () => {
        setLaneIcon(lane.laneId, icon.id);
        syncValidationMessages();
        renderTrackLanes();
      });

      const glyph = document.createElement("span");
      glyph.className = "icon";
      glyph.textContent = icon.symbol;

      label.append(input, glyph);
      iconList.appendChild(label);
    }

    topRow.appendChild(iconList);

    const nameInput = document.createElement("input");
    nameInput.className = "bug-name-input";
    nameInput.type = "text";
    nameInput.maxLength = 24;
    nameInput.value = lane.bugName;
    nameInput.placeholder = "Bug name";
    nameInput.addEventListener("input", (event) => {
      setLaneName(lane.laneId, event.target.value);
      syncValidationMessages();
      renderTrackLanes();
    });

    card.append(topRow, nameInput);
    elements.laneConfigList.appendChild(card);
  }
}

function renderTrackLanes() {
  elements.track.innerHTML = "";

  for (const lane of state.lanes) {
    const laneRow = document.createElement("div");
    laneRow.className = "track-lane";
    laneRow.dataset.laneId = String(lane.laneId);

    const predictCell = document.createElement("div");
    const predictInput = document.createElement("input");
    predictInput.type = "radio";
    predictInput.name = "predicted-winner";
    predictInput.checked = lane.predictedWinner;
    predictInput.disabled = state.race.status === "racing";
    predictInput.addEventListener("change", () => {
      setPredictedWinner(lane.laneId);
      syncValidationMessages();
      renderTrackLanes();
    });
    predictCell.appendChild(predictInput);

    const laneCell = document.createElement("div");
    laneCell.className = "lane-label";
    laneCell.textContent = `Lane ${lane.laneId}`;

    const runway = document.createElement("div");
    runway.className = "bug-runway";

    const bug = document.createElement("div");
    bug.className = "bug-runner";
    bug.dataset.role = "bug-runner";
    bug.dataset.laneId = String(lane.laneId);

    const icon = document.createElement("span");
    icon.className = "icon";
    icon.textContent = iconById(lane.selectedIconId).symbol;

    const name = document.createElement("span");
    name.className = "bug-name";
    name.textContent = lane.bugName.trim() || `Bug ${lane.laneId}`;

    bug.append(icon, name);
    bug.style.transform = `translate(${lane.positionPx}px, -50%)`;
    runway.appendChild(bug);

    laneRow.append(predictCell, laneCell, runway);
    elements.track.appendChild(laneRow);
  }

  const firstRunway = elements.track.querySelector(".bug-runway");
  const firstRunner = elements.track.querySelector(".bug-runner");
  if (firstRunway && firstRunner) {
    const finishDistancePx = Math.max(
      0,
      firstRunway.clientWidth - firstRunner.clientWidth - 4
    );
    setTrackLength(finishDistancePx);
  }
}

function syncValidationMessages() {
  const validation = validateBeforeStart(state.lanes);
  setWarning(validation.warning);

  if (validation.error && state.race.status !== "racing") {
    setError(validation.error);
  } else if (!validation.error) {
    setError("");
  }

  elements.warningText.textContent = state.ui.warning;
  elements.errorText.textContent = state.ui.error;
}

function paintLanePositions(snapshot) {
  for (const row of snapshot) {
    setLanePosition(row.laneId, row.positionPx);
    const runner = elements.track.querySelector(
      `.bug-runner[data-lane-id="${row.laneId}"]`
    );
    if (runner) {
      runner.style.transform = `translate(${row.positionPx}px, -50%)`;
    }
  }
}

function resetForNextRace() {
  resetLanePositions();
  markReadyState();
  renderTrackLanes();
}

function applyOutcomeAnimations(winnerLaneId) {
  for (const lane of state.lanes) {
    const runner = elements.track.querySelector(
      `.bug-runner[data-lane-id="${lane.laneId}"]`
    );
    if (!runner) {
      continue;
    }

    if (lane.laneId === winnerLaneId) {
      runner.classList.add("bonus-winner");
    } else {
      runner.classList.add("bonus-loser");
    }
  }
}

function handleStartClick() {
  if (state.race.status === "racing") {
    return;
  }

  const validation = validateBeforeStart(state.lanes);
  setWarning(validation.warning);
  setError(validation.error);
  setResult("");
  elements.warningText.textContent = state.ui.warning;
  elements.errorText.textContent = state.ui.error;
  elements.resultText.textContent = "";

  if (!validation.valid) {
    return;
  }

  resetLanePositions();
  renderTrackLanes();
  beginRace();
  elements.startButton.disabled = true;
  playRaceStartSound();

  activeRaceControl?.stop();

  activeRaceControl = runRace({
    lanes: state.lanes,
    speedTier: state.settings.speedTier,
    finishDistancePx: state.settings.trackLengthPx,
    onFrame(snapshot) {
      paintLanePositions(snapshot);
    },
    onFinish(winnerLaneId, snapshot) {
      paintLanePositions(snapshot);
      finishRace(winnerLaneId);
      incrementSessionRaceCount();
      recordRaceOutcome(winnerLaneId);
      updateSessionMetrics(state, elements);
      applyOutcomeAnimations(winnerLaneId);
      playRaceEndSound();

      const predictedLane = getPredictedWinnerLaneId();
      const wasCorrect = predictedLane === winnerLaneId;
      const winnerLane = state.lanes.find((lane) => lane.laneId === winnerLaneId);
      const winnerName = winnerLane?.bugName.trim() || `Bug ${winnerLaneId}`;

      setResult(
        wasCorrect
          ? `Winner: ${winnerName} (Lane ${winnerLaneId}). You guessed correctly!`
          : `Winner: ${winnerName} (Lane ${winnerLaneId}). Better luck next race!`
      );
      elements.resultText.textContent = state.ui.result;

      window.setTimeout(() => {
        elements.startButton.disabled = false;
        resetForNextRace();
        syncValidationMessages();
      }, 900);
    }
  });

  for (const velocity of activeRaceControl.sampledVelocities) {
    setLaneVelocity(velocity.laneId, velocity.velocityPxPerFrame);
  }
}

function wireSpeedControls() {
  const radios = document.querySelectorAll('input[name="speed"]');
  for (const radio of radios) {
    radio.addEventListener("change", (event) => {
      setSpeedTier(event.target.value);
    });
  }
}

function init() {
  renderLaneConfigControls();
  renderTrackLanes();
  wireSpeedControls();
  updateSessionMetrics(state, elements);
  markReadyState();
  syncValidationMessages();

  elements.startButton.addEventListener("click", handleStartClick);

  window.addEventListener("resize", () => {
    renderTrackLanes();
  });
}

init();

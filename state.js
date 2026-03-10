export const ICON_OPTIONS = [
  { id: "ladybug", symbol: "🐞", label: "Ladybug" },
  { id: "beetle", symbol: "🪲", label: "Beetle" },
  { id: "ant", symbol: "🐜", label: "Ant" }
];

export const SPEED_RANGES = {
  slow: [1.2, 2.0],
  normal: [2.1, 3.2],
  fast: [3.3, 4.8]
};

const createLane = (laneId, iconId) => ({
  laneId,
  selectedIconId: iconId,
  bugName: `Bug ${laneId}`,
  predictedWinner: false,
  positionPx: 0,
  currentVelocityPxPerFrame: 0
});

const createPerBugStats = (lanes) => {
  const stats = {};
  for (const lane of lanes) {
    stats[lane.laneId] = {
      races: 0,
      wins: 0,
      losses: 0
    };
  }
  return stats;
};

const initialLanes = [
  createLane(1, "ladybug"),
  createLane(2, "beetle"),
  createLane(3, "ant"),
  createLane(4, "ladybug")
];

const initialState = {
  lanes: initialLanes,
  settings: {
    speedTier: "normal",
    trackLengthPx: 0
  },
  race: {
    status: "idle",
    winnerLaneId: null,
    raceId: 0
  },
  metrics: {
    sessionRacesRun: 0,
    perBugStats: createPerBugStats(initialLanes)
  },
  ui: {
    warning: "",
    error: "",
    result: ""
  }
};

export const state = structuredClone(initialState);

export function getLaneById(laneId) {
  return state.lanes.find((lane) => lane.laneId === laneId);
}

export function setLaneIcon(laneId, iconId) {
  const lane = getLaneById(laneId);
  if (lane) {
    lane.selectedIconId = iconId;
  }
}

export function setLaneName(laneId, bugName) {
  const lane = getLaneById(laneId);
  if (lane) {
    lane.bugName = bugName;
  }
}

export function setPredictedWinner(laneId) {
  for (const lane of state.lanes) {
    lane.predictedWinner = lane.laneId === laneId;
  }
}

export function getPredictedWinnerLaneId() {
  const lane = state.lanes.find((entry) => entry.predictedWinner);
  return lane ? lane.laneId : null;
}

export function setSpeedTier(speedTier) {
  state.settings.speedTier = speedTier;
}

export function setTrackLength(trackLengthPx) {
  state.settings.trackLengthPx = trackLengthPx;
}

export function setRaceStatus(status) {
  state.race.status = status;
}

export function beginRace() {
  state.race.raceId += 1;
  state.race.status = "racing";
  state.race.winnerLaneId = null;
  state.ui.error = "";
  state.ui.result = "";
}

export function finishRace(winnerLaneId) {
  state.race.status = "finished";
  state.race.winnerLaneId = winnerLaneId;
}

export function resetLanePositions() {
  for (const lane of state.lanes) {
    lane.positionPx = 0;
    lane.currentVelocityPxPerFrame = 0;
  }
}

export function setLanePosition(laneId, positionPx) {
  const lane = getLaneById(laneId);
  if (lane) {
    lane.positionPx = positionPx;
  }
}

export function setLaneVelocity(laneId, velocityPxPerFrame) {
  const lane = getLaneById(laneId);
  if (lane) {
    lane.currentVelocityPxPerFrame = velocityPxPerFrame;
  }
}

export function setWarning(message) {
  state.ui.warning = message;
}

export function setError(message) {
  state.ui.error = message;
}

export function setResult(message) {
  state.ui.result = message;
}

export function incrementSessionRaceCount() {
  state.metrics.sessionRacesRun += 1;
}

export function recordRaceOutcome(winnerLaneId) {
  for (const lane of state.lanes) {
    const laneStats = state.metrics.perBugStats[lane.laneId];
    if (!laneStats) {
      continue;
    }

    laneStats.races += 1;
    if (lane.laneId === winnerLaneId) {
      laneStats.wins += 1;
    } else {
      laneStats.losses += 1;
    }
  }
}

export function markReadyState() {
  state.race.status = "ready";
}

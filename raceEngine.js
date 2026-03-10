import { SPEED_RANGES } from "./state.js";

const FRAME_RATE = 60;

const perFrameToPerMs = (pxPerFrame) => (pxPerFrame * FRAME_RATE) / 1000;

export function assignLaneVelocities(lanes, speedTier) {
  const [minSpeed, maxSpeed] = SPEED_RANGES[speedTier] ?? SPEED_RANGES.normal;

  return lanes.map((lane) => {
    const sampledSpeed = minSpeed + Math.random() * (maxSpeed - minSpeed);
    return {
      laneId: lane.laneId,
      velocityPxPerFrame: sampledSpeed,
      velocityPxPerMs: perFrameToPerMs(sampledSpeed)
    };
  });
}

export function runRace({
  lanes,
  speedTier,
  finishDistancePx,
  onFrame,
  onFinish
}) {
  let animationFrameId = 0;
  let winnerLaneId = null;
  let previousTime = 0;

  const velocityByLane = new Map();
  const positionByLane = new Map();

  const sampled = assignLaneVelocities(lanes, speedTier);
  for (const row of sampled) {
    velocityByLane.set(row.laneId, row.velocityPxPerMs);
    positionByLane.set(row.laneId, 0);
  }

  const tick = (time) => {
    if (winnerLaneId !== null) {
      return;
    }

    if (!previousTime) {
      previousTime = time;
    }

    const dt = Math.max(0, time - previousTime);
    previousTime = time;

    for (const lane of lanes) {
      const laneId = lane.laneId;
      const velocity = velocityByLane.get(laneId) ?? 0;
      const current = positionByLane.get(laneId) ?? 0;
      const next = current + velocity * dt;
      const clamped = Math.min(next, finishDistancePx);
      positionByLane.set(laneId, clamped);

      if (winnerLaneId === null && clamped >= finishDistancePx) {
        winnerLaneId = laneId;
      }
    }

    const snapshot = lanes.map((lane) => ({
      laneId: lane.laneId,
      positionPx: positionByLane.get(lane.laneId) ?? 0
    }));

    onFrame(snapshot);

    if (winnerLaneId !== null) {
      onFinish(winnerLaneId, snapshot);
      return;
    }

    animationFrameId = requestAnimationFrame(tick);
  };

  animationFrameId = requestAnimationFrame(tick);

  return {
    stop() {
      cancelAnimationFrame(animationFrameId);
    },
    sampledVelocities: sampled
  };
}

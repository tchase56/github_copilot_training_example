let sharedContext = null;

function getContext() {
  if (!window.AudioContext && !window.webkitAudioContext) {
    return null;
  }

  if (!sharedContext) {
    const ContextClass = window.AudioContext || window.webkitAudioContext;
    sharedContext = new ContextClass();
  }

  return sharedContext;
}

async function ensureRunningContext(context) {
  if (!context) {
    return false;
  }

  if (context.state === "suspended") {
    try {
      await context.resume();
    } catch {
      return false;
    }
  }

  return true;
}

function tone(context, frequency, durationMs, gainValue, type = "sine") {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;

  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(gainValue, context.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    context.currentTime + durationMs / 1000
  );

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start();
  oscillator.stop(context.currentTime + durationMs / 1000);
}

export async function playRaceStartSound() {
  const context = getContext();
  const ok = await ensureRunningContext(context);
  if (!ok) {
    return;
  }

  tone(context, 380, 120, 0.05, "triangle");
  setTimeout(() => {
    tone(context, 520, 140, 0.05, "triangle");
  }, 90);
}

export async function playRaceEndSound() {
  const context = getContext();
  const ok = await ensureRunningContext(context);
  if (!ok) {
    return;
  }

  tone(context, 660, 140, 0.05, "square");
  setTimeout(() => {
    tone(context, 820, 200, 0.05, "square");
  }, 110);
}

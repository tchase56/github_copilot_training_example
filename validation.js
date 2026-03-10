function normalizeName(name) {
  return name.trim().toLowerCase();
}

export function hasDuplicateIcons(lanes) {
  const seen = new Set();
  for (const lane of lanes) {
    if (seen.has(lane.selectedIconId)) {
      return true;
    }
    seen.add(lane.selectedIconId);
  }
  return false;
}

export function hasDuplicateNames(lanes) {
  const seen = new Set();
  for (const lane of lanes) {
    const normalized = normalizeName(lane.bugName);
    if (!normalized) {
      continue;
    }
    if (seen.has(normalized)) {
      return true;
    }
    seen.add(normalized);
  }
  return false;
}

export function hasWinnerSelection(lanes) {
  return lanes.some((lane) => lane.predictedWinner);
}

export function validateBeforeStart(lanes) {
  if (hasDuplicateNames(lanes)) {
    return {
      valid: false,
      error: "Bug names must be unique across all lanes.",
      warning: hasDuplicateIcons(lanes)
        ? "Warning: duplicate bug icons are selected across lanes."
        : ""
    };
  }

  if (!hasWinnerSelection(lanes)) {
    return {
      valid: false,
      error: "Select a predicted winner before starting the race.",
      warning: hasDuplicateIcons(lanes)
        ? "Warning: duplicate bug icons are selected across lanes."
        : ""
    };
  }

  return {
    valid: true,
    error: "",
    warning: hasDuplicateIcons(lanes)
      ? "Warning: duplicate bug icons are selected across lanes."
      : ""
  };
}

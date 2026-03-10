export function updateSessionMetrics(state, elements) {
  elements.racesRun.textContent = String(state.metrics.sessionRacesRun);

  elements.bugStatsList.innerHTML = "";
  for (const lane of state.lanes) {
    const laneStats = state.metrics.perBugStats[lane.laneId];
    if (!laneStats) {
      continue;
    }

    const item = document.createElement("li");
    item.className = "bug-stats-item";

    const laneName = lane.bugName.trim() || `Bug ${lane.laneId}`;
    const name = document.createElement("span");
    name.className = "bug-stats-name";
    name.textContent = `${laneName}`;

    const values = document.createElement("span");
    values.textContent = `R:${laneStats.races} W:${laneStats.wins} L:${laneStats.losses}`;

    item.append(name, values);
    elements.bugStatsList.appendChild(item);
  }
}

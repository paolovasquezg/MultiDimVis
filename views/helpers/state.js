
const State = (() => {

  let selectedIds = new Set();
  const executors = [];

  const DECADE_COLOR = d3.scaleOrdinal().domain(["1920s", "1930s", "1940s", "1950s", "1960s", "1970s", "1980s", "1990s", "2000s", "2010s", "2020s"]).range(["#e63946", "#f4a261", "#e9c46a", "#2a9d8f", "#264653", "#457b9d", "#a8dadc", "#1db954", "#6a4c93", "#ff6b6b", "#ffd166"]);
  const POPULARITY_COLOR = d3.scaleOrdinal().domain(["Low", "Medium", "High", "Very High"]).range(["#444", "#888", "#1db954", "#f4e04d"]);

  function isActive(id) { return selectedIds.size === 0 || selectedIds.has(id); }

  function onChange(funct) { executors.push(funct); }

  function select(ids) { selectedIds = new Set(ids); executors.forEach(funct => funct(selectedIds)); }

  function clear() { select([]); }

  return { DECADE_COLOR, POPULARITY_COLOR, isActive, onChange, select, clear };
})();
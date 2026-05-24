function PCA(data) {

  const container = document.getElementById("pca-container");
  const width = container.clientWidth;
  const height = container.clientHeight;
  const margin = { top: 20, right: 20, bottom: 30, left: 36 };
  const graphWidth = width - margin.left - margin.right;
  const graphHeight = height - margin.top - margin.bottom;

  const records = data.data;
  const pcaVariance = data.pca_variance;

  const xExtent = d3.extent(records, record => record.pca_x);
  const yExtent = d3.extent(records, record => record.pca_y);

  const xScale = d3.scaleLinear().domain(xExtent).nice().range([0, graphWidth]);
  const yScale = d3.scaleLinear().domain(yExtent).nice().range([graphHeight, 0]);

  const tooltip = document.getElementById("tooltip");

  const colorMode = { value: "decade" };
  const colorModes = ["decade", "popularity"];
  let colorModeIndex = 0;

  function getColor(d) { return colorMode.value === "decade" ? State.DECADE_COLOR(d.decade) : State.POPULARITY_COLOR(d.popularity_type) }

  const svg = d3.select("#pca-container").append("svg").attr("width", width).attr("height", height);
  const mainGroup = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  mainGroup.append("g").attr("class", "grid").call(d3.axisLeft(yScale).ticks(5).tickSize(-graphWidth).tickFormat("")).selectAll("line").attr("stroke", "#1e1e30").attr("stroke-dasharray", "2,2");
  mainGroup.append("g").attr("class", "grid").attr("transform", `translate(0,${graphHeight})`).call(d3.axisBottom(xScale).ticks(6).tickSize(-graphHeight).tickFormat("")).selectAll("line").attr("stroke", "#1e1e30").attr("stroke-dasharray", "2,2");

  mainGroup.append("g").attr("transform", `translate(0,${graphHeight})`).call(d3.axisBottom(xScale).ticks(6).tickSize(3)).selectAll("text").attr("font-size", "8px").attr("fill", "#666");
  mainGroup.append("g").call(d3.axisLeft(yScale).ticks(5).tickSize(3)).selectAll("text").attr("font-size", "8px").attr("fill", "#666");

  mainGroup.append("text").attr("x", graphWidth / 2).attr("y", graphHeight + 26).attr("text-anchor", "middle").attr("font-size", "9px").attr("fill", "#666").text(`PC1 (${(pcaVariance[0] * 100).toFixed(1)}% var)`);
  mainGroup.append("text").attr("transform", "rotate(-90)").attr("x", -graphHeight / 2).attr("y", -28).attr("text-anchor", "middle").attr("font-size", "9px").attr("fill", "#666").text(`PC2 (${(pcaVariance[1] * 100).toFixed(1)}% var)`);

  const dots = mainGroup.selectAll(".pca-dot").data(records).enter().append("circle")
    .attr("class", "pca-dot").attr("cx", d => xScale(d.pca_x)).attr("cy", d => yScale(d.pca_y))
    .attr("r", 3.5).attr("fill", d => getColor(d)).attr("opacity", 0.7)

  const legendGroup = svg.append("g").attr("transform", `translate(${width - 76}, ${margin.top})`);

  function buildLegend() {
    legendGroup.selectAll("*").remove();
    const entries = colorMode.value === "decade" ? [...new Set(records.map(record => record.decade))].sort() : ["Low", "Medium", "High", "Very High"];
    const colorFn = colorMode.value === "decade" ? State.DECADE_COLOR : State.POPULARITY_COLOR;

    entries.forEach((entry, i) => {
      const row = legendGroup.append("g").attr("transform", `translate(0,${i * 12})`);
      row.append("circle").attr("r", 3.5).attr("cx", 4).attr("cy", 4).attr("fill", colorFn(entry));
      row.append("text").attr("x", 11).attr("y", 8).attr("font-size", "7.5px").attr("fill", "#888").text(entry);
    });
  }

  buildLegend();

  const brush = d3.brush().extent([[0, 0], [graphWidth, graphHeight]]).on("end", ({ selection }) => {
    if (!selection) { State.clear(); return; }

    const [[x0, y0], [x1, y1]] = selection;

    const selectedIds = records.filter(record => {
      const px = xScale(record.pca_x), py = yScale(record.pca_y);
      return px >= x0 && px <= x1 && py >= y0 && py <= y1;
    }).map(record => record.id);

    State.select(selectedIds);
  });

  const brushGroup = mainGroup.append("g").attr("class", "pca-brush").call(brush);
  brushGroup.select(".overlay").attr("fill", "transparent");
  brushGroup.select(".selection").attr("fill", "#1db95422").attr("stroke", "#1db954").attr("stroke-width", 1);

  const colorToggleGroup = svg.append("g").attr("transform", `translate(${margin.left + 4}, ${margin.top + 4})`);
  colorToggleGroup.append("rect").attr("width", 110).attr("height", 16).attr("rx", 3).attr("fill", "#222").attr("stroke", "#444").attr("cursor", "pointer");

  const toggleLabel = colorToggleGroup.append("text").attr("x", 55).attr("y", 11.5)
    .attr("text-anchor", "middle").attr("font-size", "8.5px").attr("fill", "#aaa").attr("pointer-events", "none").text("Color: Decade");

  colorToggleGroup.on("click", () => {
    colorModeIndex = (colorModeIndex + 1) % colorModes.length;
    colorMode.value = colorModes[colorModeIndex];
    toggleLabel.text(`Color: ${colorMode.value === "decade" ? "Decade" : "Popularity"}`);
    dots.attr("fill", d => getColor(d));
    buildLegend();
  });

  State.onChange(() => { dots.attr("opacity", d => State.isActive(d.id) ? 0.85 : 0.07).attr("r", d => State.isActive(d.id) ? 3.5 : 2) });
}

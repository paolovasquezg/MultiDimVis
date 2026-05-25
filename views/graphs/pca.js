function PCA(data) {

  const container = document.getElementById("pca-container");
  const width = container.clientWidth;
  const height = container.clientHeight;
  const margin = { top: 20, right: 70, bottom: 50, left: 70 };
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

  mainGroup.append("g").attr("transform", `translate(0,${graphHeight})`).call(d3.axisBottom(xScale).ticks(6).tickSize(3)).selectAll("text").attr("font-size", "15px").attr("fill", "#666");
  mainGroup.append("g").call(d3.axisLeft(yScale).ticks(5).tickSize(3)).selectAll("text").attr("font-size", "15px").attr("fill", "#666");

  mainGroup.append("text").attr("x", graphWidth / 2 - 40).attr("y", graphHeight + 40).attr("text-anchor", "middle").attr("font-size", "15px").attr("fill", "#666").text(`PC1 (${(pcaVariance[0] * 100).toFixed(1)}% var)`);
  mainGroup.append("text").attr("transform", "rotate(-90)").attr("x", -graphHeight / 2).attr("y", -40).attr("text-anchor", "middle").attr("font-size", "15px").attr("fill", "#666").text(`PC2 (${(pcaVariance[1] * 100).toFixed(1)}% var)`);

  const dots = mainGroup.selectAll(".pca-dot").data(records).enter().append("circle")
    .attr("class", "pca-dot").attr("cx", d => xScale(d.pca_x)).attr("cy", d => yScale(d.pca_y))
    .attr("r", 5).attr("fill", d => getColor(d)).attr("opacity", 0.7)

    .on("mouseover", function (_event, d) {
      d3.select(this).attr("r", 7).attr("opacity", 1).raise();
      tooltip.style.display = "block";
      tooltip.innerHTML = `<strong>${d.name}</strong><br>${d.artists}<br>Year: ${d.year} · Popularity: ${d.popularity} (${d.popularity_type})`;
    })
    .on("mousemove", event => {
      tooltip.style.left = (event.clientX + 12) + "px"; tooltip.style.top = (event.clientY - 10) + "px";
    })
    .on("mouseout", function (_event, d) {
      d3.select(this).attr("r", State.isActive(d.id) ? 5 : 2).attr("opacity", State.isActive(d.id) ? 0.85 : 0.07);
      tooltip.style.display = "none";
    })

  const legendGroup = svg.append("g").attr("transform", `translate(${width - 105}, ${margin.top})`);

  function buildLegend() {
    legendGroup.selectAll("*").remove();
    const entries = colorMode.value === "decade" ? [...new Set(records.map(record => record.decade))].sort() : ["Low", "Medium", "High", "Very High"];
    const colorFn = colorMode.value === "decade" ? State.DECADE_COLOR : State.POPULARITY_COLOR;

    entries.forEach((entry, i) => {
      const row = legendGroup.append("g").attr("transform", `translate(0,${i * 25})`);
      row.append("circle").attr("r", 6).attr("cx", 4).attr("cy", 4).attr("fill", colorFn(entry));
      row.append("text").attr("x", 18).attr("y", 11).attr("font-size", "20px").attr("fill", "#888").text(entry);
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
  brushGroup.select(".overlay").attr("fill", "transparent").attr("stroke", "none");
  brushGroup.select(".selection").attr("fill", "#1db95422").attr("stroke", "#1db954").attr("stroke-width", 1);

  dots.raise();

  const colorToggleGroup = svg.append("g").attr("transform", `translate(${margin.left - 20}, ${margin.top + 4})`);
  colorToggleGroup.append("rect").attr("width", 120).attr("height", 30).attr("rx", 5).attr("fill", "#222").attr("stroke", "#444").attr("cursor", "pointer");

  const toggleLabel = colorToggleGroup.append("text").attr("x", 58).attr("y", 22)
    .attr("text-anchor", "middle").attr("font-size", "20px").attr("fill", "#aaa").attr("pointer-events", "none").text("Decade");

  colorToggleGroup.on("click", () => {
    colorModeIndex = (colorModeIndex + 1) % colorModes.length;
    colorMode.value = colorModes[colorModeIndex];
    toggleLabel.text(`${colorMode.value === "decade" ? "Decade" : "Popularity"}`);
    dots.attr("fill", d => getColor(d));
    buildLegend();
  });

  State.onChange(() => { dots.attr("opacity", d => State.isActive(d.id) ? 0.85 : 0.07).attr("r", d => State.isActive(d.id) ? 5 : 2) });
}

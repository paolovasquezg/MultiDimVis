
function RadViz(data) {

  const container = document.getElementById("radviz-container");
  const width = container.clientWidth;
  const height = container.clientHeight;

  const centerX = width / 2, centerY = height / 2;
  const circleRadius = Math.min(width, height) / 2 - 40;

  const features = data.features;
  const featureCount = features.length;

  const anchors = features.map((feature, i) => {
    const angle = (2 * Math.PI * i) / featureCount - Math.PI / 2;
    return { name: feature, x: Math.cos(angle) * circleRadius, y: Math.sin(angle) * circleRadius, angle };
  });

  const colorMode = { value: "decade" };
  const colorModes = ["decade", "popularity"];
  let colorModeIndex = 0;

  function getColor(d) { if (colorMode.value === "decade") return State.DECADE_COLOR(d.decade); return State.POPULARITY_COLOR(d.popularity_type); }

  function RadVizPos(record) {
    let weightedX = 0, weightedY = 0, weightSum = 0;

    anchors.forEach(anchor => {
      const value = record[anchor.name] || 0;
      weightedX += value * anchor.x;
      weightedY += value * anchor.y;
      weightSum += value;
    });

    if (weightSum === 0) return { x: 0, y: 0 };
    return { x: weightedX / weightSum, y: weightedY / weightSum };
  }

  const positions = data.data.map(record => ({ ...RadVizPos(record), d: record }));

  const tooltip = document.getElementById("tooltip");

  const svg = d3.select("#radviz-container").append("svg").attr("width", width).attr("height", height);
  const mainGroup = svg.append("g").attr("transform", `translate(${centerX},${centerY})`);

  mainGroup.append("circle").attr("r", circleRadius).attr("fill", "none").attr("stroke", "#333").attr("stroke-width", 1);

  mainGroup.selectAll(".spoke").data(anchors).enter().append("line")
    .attr("class", "spoke").attr("x1", 0).attr("y1", 0).attr("x2", d => d.x)
    .attr("y2", d => d.y).attr("stroke", "#2a2a4a").attr("stroke-width", 1);

  mainGroup.selectAll(".anchor-label").data(anchors).enter().append("text")
    .attr("class", "anchor-label").attr("x", d => d.x * 1.15).attr("y", d => d.y - 10)
    .attr("text-anchor", d => d.x > 5 ? "start" : d.x < -5 ? "end" : "middle")
    .attr("font-size", "15px").attr("fill", "#777").text(d => d.name);

  mainGroup.selectAll(".anchor-dot").data(anchors).enter().append("circle")
    .attr("class", "anchor-dot").attr("cx", d => d.x)
    .attr("cy", d => d.y).attr("r", 5).attr("fill", "#1db954");

  const dots = mainGroup.selectAll(".rv-dot").data(positions).enter().append("circle")
    .attr("class", "rv-dot").attr("cx", d => d.x).attr("cy", d => d.y).attr("r", 5)
    .attr("fill", d => getColor(d.d)).attr("opacity", 0.75)

    .on("mouseover", (event, d) => {
      tooltip.style.display = "block";
      tooltip.innerHTML = `<strong>${d.d.name}</strong><br>${d.d.artists}<br>
        Year: ${d.d.year} · Pop: ${d.d.popularity}<br>
        Energy: ${d.d.energy.toFixed(2)} · Valence: ${d.d.valence.toFixed(2)}<br>
        Dance: ${d.d.danceability.toFixed(2)} · Acoustic: ${d.d.acousticness.toFixed(2)}`;
    })

    .on("mousemove", event => {
      tooltip.style.left = (event.clientX + 12) + "px";
      tooltip.style.top = (event.clientY - 10) + "px";
    })

    .on("mouseout", () => { tooltip.style.display = "none"; })
    .on("click", (event, d) => {
      State.select([d.d.id]);
    });

  const legendGroup = svg.append("g").attr("transform", `translate(12, 20)`);
  function buildLegend() {
    legendGroup.selectAll("*").remove();
    const entries = colorMode.value === "decade" ? [...new Set(data.data.map(record => record.decade))].sort() : ["Low", "Medium", "High", "Very High"];
    const colorFn = colorMode.value === "decade" ? State.DECADE_COLOR : State.POPULARITY_COLOR;

    entries.forEach((entry, i) => {
      const row = legendGroup.append("g").attr("transform", `translate(0,${i * 25})`);
      row.append("circle").attr("r", 6).attr("cx", 4).attr("cy", 4).attr("fill", colorFn(entry));
      row.append("text").attr("x", 18).attr("y", 11).attr("font-size", "20px").attr("fill", "#888").text(entry);
    });
  }
  buildLegend();


  const colorToggleGroup = svg.append("g").attr("transform", `translate(8,${height - 48})`);
  colorToggleGroup.append("rect").attr("width", 120).attr("height", 30).attr("rx", 5).attr("fill", "#222").attr("stroke", "#444").attr("cursor", "pointer");

  const toggleLabel = colorToggleGroup.append("text").attr("x", 60).attr("y", 22).attr("text-anchor", "middle").attr("font-size", "20px").attr("fill", "#aaa").attr("pointer-events", "none").text("Decade");
  colorToggleGroup.on("click", () => {
    colorModeIndex = (colorModeIndex + 1) % colorModes.length;
    colorMode.value = colorModes[colorModeIndex];
    toggleLabel.text(`${colorMode.value === "decade" ? "Decade" : "Popularity"}`);
    dots.attr("fill", d => getColor(d.d));
    buildLegend();
  });

  State.onChange(() => { dots.attr("opacity", d => State.isActive(d.d.id) ? 0.85 : 0.08).attr("r", d => State.isActive(d.d.id) ? 3.5 : 2) });
}

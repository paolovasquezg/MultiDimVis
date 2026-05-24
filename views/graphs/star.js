function StarCoords(data) {

  const container = document.getElementById("star-container");
  const width = container.clientWidth
  const height = container.clientHeight;
  const centerX = width / 2, centerY = height / 2;
  const axisRadius = Math.min(width, height) / 2 - 36;

  const features = data.features;
  const featureCount = features.length;

  const anchors = features.map((feature, i) => {
    const angle = (2 * Math.PI * i) / featureCount - Math.PI / 2;
    return { name: feature, x: Math.cos(angle) * axisRadius, y: Math.sin(angle) * axisRadius };
  });

  function DefaultAxes() {
    features.forEach((_feature, i) => {
      const angle = (2 * Math.PI * i) / featureCount - Math.PI / 2;
      anchors[i].x = Math.cos(angle) * axisRadius;
      anchors[i].y = Math.sin(angle) * axisRadius;
    });
  }

  function StarPos(record) {
    let posX = 0, posY = 0;
    anchors.forEach(axis => {
      const value = record[axis.name] || 0;
      posX += value * axis.x;
      posY += value * axis.y;
    });
    return { x: posX / featureCount, y: posY / featureCount };
  }

  const tooltip = document.getElementById("tooltip");
  const positions = data.data.map(record => ({ d: record, ...StarPos(record) }));

  const svg = d3.select("#star-container").append("svg").attr("width", width).attr("height", height);
  const mainGroup = svg.append("g").attr("transform", `translate(${centerX},${centerY})`);

  mainGroup.append("circle").attr("r", axisRadius).attr("fill", "none").attr("stroke", "#2a2a3a").attr("stroke-dasharray", "3,3");

  const axisLines = mainGroup.selectAll(".sc-axis").data(anchors).enter().append("line")
    .attr("class", "sc-axis").attr("x1", 0).attr("y1", 0)
    .attr("x2", d => d.x).attr("y2", d => d.y).attr("stroke", "#444").attr("stroke-width", 1.5);

  const axisLabels = mainGroup.selectAll(".sc-label").data(anchors).enter().append("text")
    .attr("class", "sc-label").attr("x", d => d.x * 1.14).attr("y", d => d.y * 1.14 + 4)
    .attr("text-anchor", d => d.x > 5 ? "start" : d.x < -5 ? "end" : "middle")
    .attr("font-size", "9px").attr("fill", "#666").text(d => d.name);

  const dots = mainGroup.selectAll(".sc-dot").data(positions).enter().append("circle")
    .attr("class", "sc-dot").attr("cx", d => d.x).attr("cy", d => d.y)
    .attr("r", 3).attr("fill", d => State.DECADE_COLOR(d.d.decade)).attr("opacity", 0.7)

    .on("mouseover", (_event, d) => {
      tooltip.style.display = "block";
      tooltip.innerHTML = `<strong>${d.d.name}</strong><br>${d.d.artists}<br>
        Year: ${d.d.year} · ${d.d.decade}`;
    })

    .on("mousemove", event => {
      tooltip.style.left = (event.clientX + 12) + "px";
      tooltip.style.top = (event.clientY - 10) + "px";
    })

    .on("mouseout", () => { tooltip.style.display = "none"; });


  function redrawAxes() {
    axisLines.attr("x2", d => d.x).attr("y2", d => d.y);
    axisLabels.attr("x", d => d.x * 1.14).attr("y", d => d.y * 1.14 + 4).attr("text-anchor", d => d.x > 5 ? "start" : d.x < -5 ? "end" : "middle");
    handles.attr("cx", d => d.x).attr("cy", d => d.y);
  }

  function redrawPoints() {
    positions.forEach(point => {
      const pos = StarPos(point.d);
      point.x = pos.x; point.y = pos.y;
    });

    dots.attr("cx", d => d.x).attr("cy", d => d.y);
  }

  const drag = d3.drag().on("drag", function (event, d) {
    d.x = event.x;
    d.y = event.y;

    d3.select(this).attr("cx", d.x).attr("cy", d.y);
    redrawAxes();
    redrawPoints();
  });

  const handles = mainGroup.selectAll(".sc-handle").data(anchors).enter().append("circle")
    .attr("class", "sc-handle").attr("cx", d => d.x).attr("cy", d => d.y)
    .attr("r", 6).attr("fill", "#1db954").attr("opacity", 0.8)
    .attr("cursor", "grab").call(drag);

  document.getElementById("sc-reset").addEventListener("click", () => {
    DefaultAxes();
    redrawAxes();
    redrawPoints();
  });


  State.onChange(() => { dots.attr("opacity", d => State.isActive(d.d.id) ? 0.85 : 0.06).attr("r", d => State.isActive(d.d.id) ? 3 : 1.5) });
}

function ParallelCoords(data) {

  const Categories = ["Low", "Medium", "High", "Very High"];
  const container = document.getElementById("pc-container");

  const width = container.clientWidth;
  const height = container.clientHeight;
  const margin = { top: 30, right: 20, bottom: 10, left: 20 };

  const GraphWidth = width - margin.left - margin.right;
  const GraphHeight = height - margin.top - margin.bottom;

  const features = data.features;
  const records = data.data;
  const tooltip = document.getElementById("tooltip");

  const xScale = d3.scalePoint().domain(features).range([0, GraphWidth]).padding(0.1);
  const yScales = Object.fromEntries(features.map(feature => [feature, d3.scaleLinear().domain([0, 1]).range([GraphHeight, 0])]));

  function Line(record) { return d3.line()(features.map(feature => [xScale(feature), yScales[feature](record[feature] || 0)])) }


  const svg = d3.select("#pc-container").append("svg").attr("width", width).attr("height", height);
  const mainGroup = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const backgroundLines = mainGroup.append("g").attr("class", "bg-lines").selectAll("path").data(records).enter().append("path")
    .attr("d", Line).attr("fill", "none").attr("stroke", "#2a2a4a").attr("stroke-width", 0.5).attr("opacity", 0.4);

  const foregroundLines = mainGroup.append("g").attr("class", "fg-lines")
    .selectAll("path").data(records).enter().append("path").attr("d", Line)
    .attr("fill", "none").attr("stroke", d => State.POPULARITY_COLOR(d.popularity_type))
    .attr("stroke-width", 1).attr("opacity", 0.5)

    .on("mouseover", function (_event, d) {
      d3.select(this).attr("stroke-width", 2.5).attr("opacity", 1).raise();
      tooltip.style.display = "block";

      tooltip.innerHTML = `<strong>${d.name}</strong><br>${d.artists}<br>
        Year: ${d.year} · Popularity: ${d.popularity} (${d.popularity_type})`;
    })

    .on("mousemove", event => {
      tooltip.style.left = (event.clientX + 12) + "px"; tooltip.style.top = (event.clientY - 10) + "px";
    })

    .on("mouseout", function () {
      d3.select(this).attr("stroke-width", 1).attr("opacity", 0.5); tooltip.style.display = "none";
    });

  features.forEach(feature => {

    const axisGroup = mainGroup.append("g").attr("class", "pc-axis").attr("transform", `translate(${xScale(feature)},0)`);

    axisGroup.call(d3.axisLeft(yScales[feature]).ticks(5).tickSize(3));

    axisGroup.append("text").attr("y", -8).attr("text-anchor", "middle").attr("font-size", "9px").attr("fill", "#888").text(feature);
  });

  const legendGroup = svg.append("g").attr("transform", `translate(${width - 90}, 8)`);
  Categories.forEach((label, i) => {
    legendGroup.append("circle").attr("cx", 6).attr("cy", i * 13 + 6).attr("r", 4).attr("fill", State.POPULARITY_COLOR(label));
    legendGroup.append("text").attr("x", 14).attr("y", i * 13 + 10).attr("font-size", "8px").attr("fill", "#888").text(label);
  });

  document.getElementById("pc-reset").addEventListener("click", () => {
    mainGroup.selectAll(".brush").each(function () { d3.select(this).call(d3.brushY().move, null); });
    Object.keys(brushExtents).forEach(key => { brushExtents[key] = null; });
    State.clear();
  });


  State.onChange(() => { foregroundLines.attr("opacity", d => State.isActive(d.id) ? 0.75 : 0.04).attr("stroke-width", d => State.isActive(d.id) ? 1.2 : 0.5) });
}

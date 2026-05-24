
d3.json("/data").then(data => {
  RadViz(data); StarCoords(data);
  ParallelCoords(data); PCA(data)
})
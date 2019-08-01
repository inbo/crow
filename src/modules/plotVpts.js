function plotVpts() {
  // Options accessible to caller
  let width = 600;
  let height = 300;
  let data = [];
  let updateWidth;
  let updateHeight;
  let updateData;

  function chart(selection) {
    selection.each(function () {
      // Define chart dimensions
      let margin = { top: 20, right: 20, bottom: 30, left: 50 };
      let chartWidth = width - margin.left - margin.right;
      let chartHeight = height - margin.top - margin.bottom;
      let transitionDuration = 750;

      // TODO: test if these vars are necessary
      let gridSize = Math.floor(chartWidth / 24); // TODO: not 24 
      let buckets = 9;
      let colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"]; // alternatively colorbrewer.YlGnBu[9]
      let days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
      
      // Create svg and chart element
      let svg = d3.select(this)
        .append("svg")
        .attr("class", "vpts-plot")
        .attr('height', height)
        .attr('width', width)
        .append("g")
        .attr("class", "chart")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      
      // Properties below depend on data, even though data = [] on first call
      
      // Get unique heights https://codeburst.io/javascript-array-distinct-5edc93501dc4
      let heights = [...new Set(data.map(d => d.height))];
      console.log(heights)

      let yAxis = svg.selectAll(".y-axis")

      

  chart.width = function(value) {
    if (!arguments.length) return width;
    width = value;
    // if (typeof updateWidth === 'function') updateWidth(); // updateWidth() not implemented
    return chart;
  };

  chart.height = function(value) {
    if (!arguments.length) return height;
    height = value;
    // if (typeof updateHeight === 'function') updateHeight(); // updateHeight() not implemented
    return chart;
  };

  chart.data = function(value) {
    if (!arguments.length) return data;
    data = value;
    if (typeof updateData === 'function') updateData();
    return chart;
  };
  
  return chart;
}

}

export { plotVpts }

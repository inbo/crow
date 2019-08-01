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

      // Update functions
      updateData = function() {
        
      }
    });
  }

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





// TODO remove: barChart
function barChart() {

  // All options that should be accessible to caller
  var width = 500;
  var height = 300;
  var barPadding = 1;
  var fillColor = 'coral';
  var data = [];

  var updateWidth;
  var updateHeight;
  var updateFillColor;
  var updateData;

  function chart(selection){
      selection.each(function () {

          var barSpacing = height / data.length;
          var barHeight = barSpacing - barPadding;
          var maxValue = d3.max(data);
          var widthScale = width / maxValue;

          var dom = d3.select(this);
          var svg = dom.append('svg')
              .attr('class', 'bar-chart')
              .attr('height', height)
              .attr('width', width)
              .style('fill', fillColor);

          var bars = svg.selectAll('rect.display-bar')
              .data(data)
              .enter()
              .append('rect')
              .attr('class', 'display-bar')
              .attr('y', function (d, i) { return i * barSpacing;  })
              .attr('height', barHeight)
              .attr('x', 0)
              .attr('width', function (d) { return d * widthScale; });


          // update functions
          updateWidth = function() {
              widthScale = width / maxValue; // note from lynn: should use scales
              bars.transition().duration(1000).attr('width', function(d) { return d * widthScale; });
              svg.transition().duration(1000).attr('width', width);
          };

          updateHeight = function() {
              barSpacing = height / data.length; // note from lynn: should use scales
              barHeight = barSpacing - barPadding;
              bars.transition().duration(1000).attr('y', function(d, i) { return i * barSpacing; })
                  .attr('height', barHeight);
              svg.transition().duration(1000).attr('height', height);

          };

          updateFillColor = function() {
              svg.transition().duration(1000).style('fill', fillColor);
          };

          updateData = function() {
              console.log("update data");
              barSpacing = height / data.length;
              barHeight = barSpacing - barPadding;
              maxValue = d3.max(data);
              widthScale = width / maxValue;

              var update = svg.selectAll('rect.display-bar')
                  .data(data);

              update
                  .transition()
                  .duration(1000)
                  .attr('y', function(d, i) { return i * barSpacing; })
                  .attr('height', barHeight)
                  .attr('x', 0)
                  .attr('width', function(d) { return d * widthScale; });

              update.enter()
                  .append('rect')
                  .attr('class', 'display-bar')
                  .attr('y', function(d, i) { return i * barSpacing; })
                  .attr('height', barHeight)
                  .attr('x', 0)
                  .attr('width', 0)
                  .style('opacity', 0)
                  .transition()
                  .duration(1000)
                  .delay(function(d, i) { return (data.length - i) * 40; })
                  .attr('width', function(d) { return d * widthScale; })
                  .style('opacity', 1);

              update.exit()
                  .transition()
                  .duration(650)
                  .delay(function(d, i) { return (data.length - i) * 20; })
                  .style('opacity', 0)
                  .attr('height', 0)
                  .attr('x', 0)
                  .attr('width', 0)
                  .remove();
          }

      });
  }

  chart.width = function(value) {
      if (!arguments.length) return width;
      width = value;
      if (typeof updateWidth === 'function') updateWidth();
      return chart;
  };

  chart.height = function(value) {
      if (!arguments.length) return height;
      height = value;
      if (typeof updateHeight === 'function') updateHeight();
      return chart;
  };

  chart.fillColor = function(value) {
      if (!arguments.length) return fillColor;
      fillColor = value;
      if (typeof updateFillColor === 'function') updateFillColor();
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

export { plotVpts }

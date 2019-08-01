function plotVpi() {
  // Options accessible to caller
  let width = undefined;
  let height = undefined;
  let data = [];
  let updateData;

  function chart(selection) {
    // Set width and height if undefined
    if (width == undefined) {
      // Use parent container width
      width = selection.node().getBoundingClientRect().width;
    }
    if (height == undefined) {
      // Use parent container height (often collapsed) with minimum of 100
      height = Math.max(selection.node().getBoundingClientRect().height, 100);
    }

    selection.each(function () {
      // Define chart dimensions
      let margin = { top: 20, right: 20, bottom: 30, left: 50 };
      let chartWidth = width - margin.left - margin.right;
      let chartHeight = height - margin.top - margin.bottom;
      let transitionDuration = 750;

      // Create svg and chart element
      let svg = d3.select(this)
        .append("svg")
        .attr("class", "vpi-plot")
        .attr('height', height)
        .attr('width', width)
        .append("g")
        .attr("class", "chart")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Define ranges
      let xRange = d3.scaleTime().rangeRound([0, chartWidth]);
      let yRange = d3.scaleLinear().rangeRound([chartHeight, 0]);

      // Define axis
      var xAxis = d3.axisBottom(xRange);
      var yAxis = d3.axisLeft(yRange);

      // Properties below depend on data, even though data = [] on first call

      // Set value line
      let valueLine = d3.line()
        .defined(d => !isNaN(d.mtr))
        .x(d => xRange(d.datetime))
        .y(d => yRange(d.mtr));

      // Scale extend of the data
      xRange.domain(d3.extent(data, d => d.datetime ));
      yRange.domain(d3.extent(data, d => d.mtr ));

      // Add x axis
      svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + chartHeight + ")")
        .call(xAxis)
        .select(".domain")
        .remove();

      // Add y axis
      svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis)
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Number of individuals");
      
      // Add value line
      svg.append("path")
        .attr("class", "line")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", valueLine);

      // Update functions
      updateData = function() {
        // Scale extend of the data again
        xRange.domain(d3.extent(data, d => d.datetime ));
        yRange.domain(d3.extent(data, d => d.mtr ));

        // Make changes
        svg.select(".line")
          .transition()
          .duration(transitionDuration)
          .attr("d", valueLine(data))
        svg.select(".x-axis")
          .transition()
          .duration(transitionDuration)
          .call(xAxis)
        svg.select(".y-axis")
          .transition()
          .duration(transitionDuration)
          .call(yAxis)
      }
    });
  }

  chart.width = function(value) {
    if (!arguments.length) return width;
    width = value;
    return chart;
  };

  chart.height = function(value) {
    if (!arguments.length) return height;
    height = value;
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

export { plotVpi }

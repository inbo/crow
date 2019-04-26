function plotVpi() {
  console.log("plotVpi() called");

  let svgWidth = 600;
  let svgHeight = 300;

  function chart(selection) {
    console.log("chart() called");

    // Get data
    let data = selection.datum();

    // Set margin, height and width
    let margin = { top: 20, right: 20, bottom: 30, left: 50 };
    let width = svgWidth - margin.left - margin.right;
    let height = svgHeight - margin.top - margin.bottom;
    
    // Select or create svg element
    let svg = selection
      .selectAll("svg")
      .data([1])
      .enter()
      .append("svg");
    svg
      .attr("width", svgWidth)
      .attr("height", svgHeight);

    let g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    let xScale = d3.scaleTime()
      .domain(d3.extent(data, d =>  d.datetime ))
      .rangeRound([0, width]);

    let yScale = d3.scaleLinear()
      .domain(d3.extent(data, d =>  d.mtr))
      .rangeRound([height, 0]);

    let line = d3.line()
      .defined(d => !isNaN(d.mtr))
      .x(d => xScale(d.datetime))
      .y(d => yScale(d.mtr));

    g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale))
      .select(".domain")
      .remove();

    g.append("g")
      .call(d3.axisLeft(yScale))
      .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Number of individuals");

    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", line);
  }

  // Get/set width of svg
  chart.width = function(value) {
		if (!arguments.length) return svgWidth;
    svgWidth = value;
		return chart;
  };
  
  // Get/set height of svg
  chart.height = function(value) {
		if (!arguments.length) return svgHeight;
    svgHeight = value;
		return chart;
  };
  
  return chart;
}

export { plotVpi }

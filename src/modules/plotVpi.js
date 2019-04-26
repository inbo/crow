function plotVpi(vpiData, height = 300, width = 600, el = "#plotVpi") {
    const data = vpiData;
    // cfr. https://medium.freecodecamp.org/learn-to-create-a-line-chart-using-d3-js-4f43f1ee716b
    var svgWidth = 1000, svgHeight = 400;
    var margin = { top: 20, right: 20, bottom: 30, left: 50 };
    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    var svg = d3.select('svg')
        .attr("width", svgWidth)
        .attr("height", svgHeight)

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xScale = d3.scaleTime()
        .domain(d3.extent(data, d =>  d.datetime ))
        .rangeRound([0, width]);

    var yScale = d3.scaleLinear()
        .domain(d3.extent(data, d =>  d.mtr))
        .rangeRound([height, 0]);

    var line = d3.line()
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

export { plotVpi }

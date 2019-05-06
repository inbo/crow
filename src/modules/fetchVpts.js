function fetchVpts(dateMin = null, dateMax = null, directory = ".") {
    return "Called from fetchVptsData";
}

async function readVpts(file) {
  let response = await d3.csv(file, d => {
    return {
      datetime: Date.parse(d.datetime), // TODO: use new Date() to get actual dates rather than milliseconds since January 1, 1970
      height: +d.height,
      dd: +d.dd,
      ff: +d.ff,
      dens: +d.dens,
      sd_vvp: d.sd_vvp
    };
  });
  return response;
}

export { fetchVpts, readVpts }

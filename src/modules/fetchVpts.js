async function fetchVpts(dateMin = null, dateMax = null, directory = "./") {
    /*
    We assume files have daily frequency and the date is available
    in the file name (e.g. example_vpts_20160901.csv)

    Make sure to have the directory input ending with an "/"
    */

    // parse the datestrings
    dateMin = new Date(dateMin);
    dateMax = new Date(dateMax);

    if (dateMin > dateMax) {
      throw "dateMin need to be before dateMax"
    };

    // collect each day of the dates in between min and max date
    let dates = [];
    let filenames = [];
    dates.push(new Date(dateMin));
    while (dateMin < dateMax) {
        console.log(dateMin);
        dateMin.setDate(dateMin.getDate() + 1);
        dates.push(new Date(dateMin));
    }

    // compose filename string array with dates
    let pre_string = "example_vpts_"
    let post_string = ".csv"
    dates = dates.map(date => date.toISOString().split("T")[0].replace(/\D/g,''));
    filenames = dates.map(date => directory + pre_string + date + post_string);
    console.log(filenames);

    // get the files asynchronyous
    let data = filenames.map(filename => readVpts(filename));
    const flattened = await Promise.all(data);
    return flattened.reduce(function(a, b) {
      return a.concat(b);
    }, []);
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


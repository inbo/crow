async function fetchVpts(startDate = new Date(), endDate = new Date(), path = "", format = "", radar = "") {
    /*
    We assume files have daily frequency and the date is available
    in the file name (e.g. example_vpts_20160901.csv)
    */

    // Parse the datestrings
    startDate = new Date(startDate);
    endDate = new Date(endDate);
    if (startDate > endDate) {
      throw "startDate needs to be before endDate";
    };

    // Create range of days (YYYYMMDD) between min and max date
    let dates = [];
    dates.push(new Date(startDate));
    while (startDate < endDate) {
      startDate.setDate(startDate.getDate() + 1);
      dates.push(new Date(startDate));
    }
    dates = dates.map(date => date.toISOString().substring(0, 10).replace(/-/g,"")); // YYYYMMDD

    // Create filenames
    let filenames = [];
    if (format == "kmi") {
      filenames = dates.map(date => path + "/" + date + "00." + radar + ".vbrd.vpts")
    } else {
      filenames = dates.map(date => path + "/" + "example_vpts_" + date + ".csv");
    }
    console.log(filenames);

    // Get the files asynchronyously
    let data = []
    if (format == "kmi") {
      data = filenames.map(filename => readVpts(filename, "kmi"));
    } else {
      data = filenames.map(filename => readVpts(filename));
    }
    
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


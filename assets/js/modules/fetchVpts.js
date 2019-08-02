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

async function readVpts(file, format = "bioRad") {
  let data = [];

  if (format == "kmi") {
    // kmi vpts are formatted as fixed width data
    let rawData = await d3.text(file)
    data = d3.csvParseRows(rawData, d => {
      let row = d[0];
      return {
        datetime: Date.parse(
          row.substring(0, 4) + "-" + row.substring(4, 6) + "-" + row.substring(6, 8) + 
          "T" + row.substring(9, 11) + ":" + row.substring(11, 13)
        ),
        height: parseInt(row.substring(14, 18)),
        dd: parseFloat(row.substring(47, 52)),
        ff: parseFloat(row.substring(41, 46)),
        dens: parseFloat(row.substring(76, 82)),
        sd_vvp: parseFloat(row.substring(53, 59))
      };
    });
    data = data.slice(4); // Remove 4 header rows
  
  } else if (format == "bioRad") {
    // bioRad vpts are formatted as csv
    data = await d3.csv(file, d => {
      return {
        datetime: Date.parse(d.datetime), // TODO: use new Date() to get actual dates rather than milliseconds since January 1, 1970
        height: +d.height,
        dd: +d.dd,
        ff: +d.ff,
        dens: +d.dens,
        sd_vvp: d.sd_vvp
      };
    });
  
  } else {
    throw "Format " + format + " not recognized."
  }
  
  return data;
}

export { fetchVpts, readVpts }


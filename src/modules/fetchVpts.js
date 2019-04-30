function fetchVpts(dateMin = null, dateMax = null, directory = ".") {
    /*
    We assume files have a certain frequency, eg day and the date is available
    in the file name (e.g. example_vpts_20160901.csv)

    startDate - endDate
        => retrieve the different required files
        => compose the URLS
    */
    if (startDate > endDate) {throw "StartDate need to be before endDate"}
    // define each date within range with given resolution (e.g. day/month)
    let dates = []
    while (startDate < endDate) {
        dates.push(new Date(startDate));
        startDate.setMonth(startDate.getDay() + 1);
    }
    console.log(dates);

    // compose string array of dates
    //dates.map(date => date.)
}

async function readVpts(file) {
    let response = await d3.csv(file);
    return response;
}

export { fetchVpts, readVpts }


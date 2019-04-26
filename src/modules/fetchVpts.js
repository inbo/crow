function fetchVpts(dateMin = null, dateMax = null, directory = ".") {
    return "Called from fetchVptsData";
}

async function readVpts(file) {
    let response = await d3.csv(file);
    return response;
}

export { fetchVpts, readVpts }

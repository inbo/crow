
function calculateMtr(data, altMin = 0, altMax = Infinity,
    interval = 200, vvpThresh = 2, alpha = NaN) {
    // Note: interval and vvpThresh should actually be derived from data/metadata itself

    // extract the data - could be improved by using data itself as input
    //let date = data.key;
    //data = data.values;

    // check the input arguments
    if (!(typeof altMin == 'number') || !(typeof altMax == 'number' || altMax == Infinity)) {
        throw "Altitudes need to be nunmeric";
    }
    if (!(isNaN(alpha) || !(typeof alpha == 'number'))) {
        throw "Alpha need to be numeric or Nan";
    }
    if (altMax <= altMin) {
        console.log("'altMin' should be smaller than 'altMax'");
    }

    // get height ranges
    let altMinData = data.map(x => x.height).reduce((a, b) => Math.min(a, b));
    let altMaxData = data.map(x => x.height).reduce((a, b) => Math.max(a, b));
    altMin = Math.max(altMin, altMinData);
    altMax = Math.min(altMax, altMaxData + interval);
    // console.log(altMin, altMax)

    // filter only the requested heights
    data = data.filter(d => d.height >= altMin & d.height <= altMax);
    // console.log(data);

    // filter only sd_vvp values above sd_vvp threshold
    data = data.filter(d => d.sd_vvp >= vvpThresh);
    if (data.length == 0) {
        return NaN
    }

    // extract the dd, ff and dens values
    let dd = data.map(x => x.dd);
    let ff = data.map(x => x.ff);
    let dens = data.map(x => x.dens);

    // calculate the cosFactor
    let cosFactor = [];
    if (isNaN(alpha)) {
        cosFactor =  dd.map( x => 1. + 0. * x);
      } else {
        cosFactor = dd.map( x => Math.cos(x - alpha) * Math.PI / 180);
      }

    // calculate mtr
    let mtr = 0.001 * interval * cosFactor.map((e, i) => e * ff[i] * dens[i] * 3.6)
        .filter(x => !Number.isNaN(x))
        .reduce((a, b) => a + b, 0);

    return mtr
}


// first promise returns the dataset
var dataset = d3.csv("vpts_test.csv").then(data => data);

//this promise returns our parsed data
var csv_parsed = dataset.then(
    function(value) {
        return Promise.all(value.map(function(item){
            return {
                datetime: Date.parse(item.datetime), // cast to date
                height: parseInt(item.height), // cast to int
                dd: +item.dd
            };
        }))
    });

//print the object
csv_parsed.then(function(data) {

    var data_nested = d3.nest()
        .key(function(d) { return d.datetime}) // group data by datetime
        .entries(data);

    console.log(data_nested);
    let mtr = data_nested.map(date_values => calculate_vpi(date_values));
    console.log(data_nested);
});


/*
d3.csv("example_vpts.csv", function(error, csv) {
    if (error) throw error;

    // process vpts data
    var csv_parsed = csv.map(function(item) {
        return {
            datetime: new Date(item.date), // cast to date
            height: parseInt(item.height), // cast to int
            dd: +item.vp_files
        };
    });

    var data = d3.nest()
        .key(function(d) { return d.height}) // group data by height
        .map(csv_parsed);


    console.log(csv_parsed);

})
*/




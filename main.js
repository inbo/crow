
calculate_vpi = function(quantity, interval = 200, alpha = NaN) {
    let alt_min = 0;
    let alt_max = Infinity;

    if (alt_max <= alt_min) {
        console.log("'alt_min' should be smaller than 'alt_max'");
    }

    // TODO: met .filter custom hoogteklasses uitfilteren die van input komen

    let dd = quantity.values.map(x => x.dd);
    console.log(dd)

    let cosfactor = [];
    if (isNaN(alpha)) {
        cosfactor =  dd.map( x => 1. + 0. * x)
      } else {
        cosfactor = dd.map( x =>  Math.cos(x - alpha) * Math.PI / 180)
      }

    // colSums(cosfactor * get_quantity(x, "ff")[index, ] * 3.6 *
      // get_quantity(x, "dens")[index, ], na.rm = TRUE) * interval / 1000

    //console.log(cosfactor)
    //console.log(alt_min, alt_max, cosfactor)
    //return mtr
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




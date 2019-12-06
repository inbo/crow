// TODO: move field position (hardcoded constants) to config.js
import config from "./config";

function readVtps(responseString) {
    let d = responseString.split("\n");

    d = d.map(function (row) {
        return {
            datetime: Date.parse(
                row.substring(0, 4) +
                "-" +
                row.substring(4, 6) +
                "-" +
                row.substring(6, 8) +
                "T" +
                row.substring(9, 11) +
                ":" +
                row.substring(11, 13)
            ),
            height: parseInt(row.substring(14, 18)),
            dd: parseFloat(row.substring(47, 52)),
            ff: parseFloat(row.substring(41, 46)),
            dens: parseFloat(row.substring(76, 82)),
            sd_vvp: parseFloat(row.substring(53, 59))
        };
    });

    return d.splice(config.vtpsFormat.numHeaderLines); // Remove 4 header lines
}

export default { readVtps } 
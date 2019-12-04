function integrateProfile(data, altMin = 0, altMax = Infinity, interval = 200, vvpThresh = 2, alpha = NaN) {
  // TODO: interval and vvpThresh should actually be derived from data/metadata itself
  // TODO: extract the data - could be improved by using data itself as input
  // TODO: return other properties than mtr

  // Check input arguments
  if (!(typeof altMin == 'number') || !(typeof altMax == 'number' || altMax == Infinity)) {
      throw "'altMin'/'altMax' need to be nunmeric";
  }
  if (!(isNaN(alpha) || !(typeof alpha == 'number'))) {
      throw "'alpha' needs to be numeric or Nan";
  }
  if (altMax <= altMin) {
      console.log("'altMin' should be smaller than 'altMax'");
  }

  // Get height ranges
  const altMinMaxFromData = d3.extent(data, d => d.height );
  altMin = Math.max(altMin, altMinMaxFromData[0]);
  altMax = Math.min(altMax, altMinMaxFromData[1] + interval); // Interval added to get upper bound of height layer

  // Filter data on requested heights
  data = data.filter(d => d.height >= altMin & d.height <= altMax);

  // Filter data on sd_vvp values above sd_vvp threshold
  data = data.filter(d => d.sd_vvp >= vvpThresh);
  if (data.length == 0) {
      return NaN;
  }

  // Extract dd, ff and dens values
  let ff = data.map(x => x.ff);
  let dens = data.map(x => x.dens);

  // Calculate the cosFactor
  let cosFactor = [];
  if (isNaN(alpha)) {
    cosFactor =  data.map(x => 1. + 0. * x.dd);
  } else {
    cosFactor = data.map(x => Math.cos(x.dd - alpha) * Math.PI / 180);
  }

  // Calculate mtr
  let mtr = 0.001 * interval * cosFactor.map((e, i) => e * ff[i] * dens[i] * 3.6)
    .filter(x => !Number.isNaN(x))
    .reduce((a, b) => a + b, 0);

  return mtr
}

export { integrateProfile }

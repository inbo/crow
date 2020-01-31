# Sample data files

- `behel_vpts_20200129.truncated.txt`: Manually truncated file with 1 hour of VPTS data from the BEHEL radar.
- `behel_vpts_20200129.truncated.txt`: We used BioRAD to integrate profiles* from `behel_vpts_20200129.truncated.txt`, the results are stored in this file so we can use it as a reference to check our JS implementation of the profile integrations.

*: For reference: with R/BioRAD, we produced the integrated profiles like this:

``` 
> library(bioRad);
> ts <- read_vpts("./data/behel_vpts_20200129.truncated.txt", radar = "BEHEL", wavelength = "S")
> vpi <- integrate_profile(ts)
```

Then saved the file with:

```
> ts2csv <- function(x) {
     fname <- paste0(deparse(substitute(x)), ".csv")
     readr::write_csv(tsibble::as_tsibble(x, gather = FALSE), fname)}

> ts2csv(vpi)
```
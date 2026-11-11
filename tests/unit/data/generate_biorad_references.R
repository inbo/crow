# Generate independent bioRad reference outputs for the Wideumont (bewid)
# 12-14 October 2020 VPTS files, used by the characterisation tests.
#
# Scenario: the one validated against bioRad in tests/crow_biorad_comparison.Rmd
# (https://github.com/inbo/crow/issues/45), i.e. CROW at
# ?radar=bewid&date=2020-10-13&interval=72&timedisplay=UTC
#
# Run from the repository root:
#   Rscript tests/unit/data/generate_biorad_references.R

library(bioRad)

data_dir <- "tests/unit/data"
files <- file.path(data_dir, paste0("bewid_vpts_2020101", 2:4, ".txt"))

vpts <- do.call(bind_into_vpts, lapply(files, read_vpts, radar = "bewid", wavelength = "C"))

write_vpi <- function(vpi, fname) {
  out <- data.frame(
    datetime = format(vpi$datetime, "%Y-%m-%dT%H:%M:%SZ", tz = "UTC"),
    mtr = vpi$mtr, rtr = vpi$rtr, vid = vpi$vid, vir = vpi$vir, mt = vpi$mt
  )
  write.csv(out, file.path(data_dir, fname), row.names = FALSE)
}

# 1. Integrated profiles at the native (5 min) data resolution
write_vpi(integrate_profile(vpts), "bewid_20201012-14.biorad_vpi_5min.csv")

# 2. Profiles regularised to the app's 10 min resolution, and their integration
vpts10 <- regularize_vpts(vpts, interval = 10, units = "mins")
write_vpi(integrate_profile(vpts10), "bewid_20201012-14.biorad_vpi_10min.csv")

grid <- as.data.frame(vpts10, suntime = FALSE)
grid <- grid[, c("datetime", "height", "dens", "eta", "ff", "dd", "sd_vvp")]
grid$datetime <- format(grid$datetime, "%Y-%m-%dT%H:%M:%SZ", tz = "UTC")
write.csv(grid, file.path(data_dir, "bewid_20201012-14.biorad_vpts_10min.csv"), row.names = FALSE)

writeLines(paste("Generated with bioRad", packageVersion("bioRad"), "on", R.version.string),
           file.path(data_dir, "bewid_20201012-14.biorad_version.txt"))

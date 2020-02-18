// All is optional because we first populate the empty with only "noData". Should we split this (VTPSData as coming from source data, and ready to be visualized)
export interface VTPSDataRow {
    datetime?: number
    height?: number
    dd?: number
    ff?: number
    dens?: number
    sd_vvp?: number
    noData?: boolean // Field not in original data, but used to know if we have data loaded for the given datetime/height combination
}
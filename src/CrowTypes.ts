import moment from "moment-timezone";

export type ColorSchemeIdentifier = "biorad" | "birdtam" | "viridis";
export type IntegratedPropertyName = "mtr" | "rtr" | "vid" | "vir";

export interface ColorSchemeConfigEntry {
    text: string;
    value: ColorSchemeIdentifier;
    dailyLinesColor: string;

    // Color-scale related
    colorScale(): any; // TODO: give a proper function signature
    dynamicDomain: boolean; // Is the color scale domain fixed and preconfigured (false) or does it depend of the data (true)?
    dataPreprocessor?(d: number): number; // This optional function will be applied to the data before it's passed to the color scale
    colorScaleType: "ordinal" | "sequential";
}

export interface DayData {
    moment: moment.Moment;
    xPositionAtMidnight: number;
}

export interface Period {
    moment: moment.Moment;
    sunAltitude: number;
}

export interface Profiles {
    mtr: number;
    rtr: number;
    vid: number;
    vir: number;
}

export interface VPIEntry {
    // Data, as received via props
    moment: moment.Moment;
    integratedProfiles: Profiles;
}

export interface RadarInterface {
    value: string; // Odim code
    text: string;  // Location name
    country: string;
    latitude: number;
    longitude: number;
    timezone: string;
}

export interface GroupedRadarInterface {
    label: string;
    options: RadarInterface[];
}

export interface TimeInterval {
    text: string;
    value: number; // in hours
}

export interface VTPSDataRowFromFile {
    datetime: number;
    height: number;
    dd: number;
    ff: number;
    dens: number;
    sd_vvp: number;
    eta: number;
}

export interface VTPSDataRow {
    datetime?: number;
    height?: number;
    dd?: number;
    ff?: number;
    dens?: number;
    sd_vvp?: number;
    noData?: boolean; // Field not in original data, but used to know if we have data loaded for the given datetime/height combination
}

export interface VTPSEntry { // TODO: check: is it a duplicate of VTPSDataRow?
    dd: number;
    dens: number;
    ff: number;
    height: number;
    noData: boolean;
    sd_vvp: number;
    timestamp: number;
}
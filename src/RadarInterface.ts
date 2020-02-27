export interface RadarInterface {
    value: string, // Odim code
    text: string,  // Location name
    country: string,
    latitude: number,
    longitude: number,
    timezone: string
}

export interface GroupedRadarInterface {
    label: string,
    options: RadarInterface[]
}
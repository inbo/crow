import moment from "moment-timezone";

export interface Period {
    moment: moment.Moment,
    sunAltitude: number
  }
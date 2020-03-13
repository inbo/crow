import moment from "moment-timezone";

export interface DayData {
    moment: moment.Moment;
    xPositionAtMidnight: number;
}
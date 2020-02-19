import moment from "moment-timezone";
import { Profiles } from "./ProfilesInterface";

export interface VPIEntry {
    // Data, as received via props
    moment: moment.Moment;
    integratedProfiles: Profiles | number; // Number, because integratePrfile() will return NaN if no data left after filtering
}
import moment from "moment-timezone";
import { Profiles } from "./ProfilesInterface";

export interface VPIEntry {
    // Data, as received via props
    moment: moment.Moment;
    integratedProfiles: Profiles;
}
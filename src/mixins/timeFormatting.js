import moment from 'moment-timezone';
// TODO: deprecate this mixin in favor of helpers (already there), it creates issues with TS and makes code less readable

export const timeFormatting = {
    // This mixin export time formatting methods
    // !! It requires two properties in the implementing components:
    //  - showTimeAs
    //  - styleconfig.timeAxisFormat

    methods: {
         formatMoment(moment) {
            // Format the timestamp passed as argument, according to timezone (showTimeAs) and styleConfig.timeAxisFormat
            return moment.tz(this.showTimeAs).format(this.styleConfig.timeAxisFormat);
        },
        formatTimestamp(ts) {
            // Format the timestamp passed as argument, according to timezone (showTimeAs) and styleConfig.timeAxisFormat
            return this.formatMoment(moment(ts));
        },
    }
};
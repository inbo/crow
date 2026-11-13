// Time zone regression tests. Each one only means something with the browser in
// a given zone, and the zone cannot be changed from inside a test (Jest gives each
// file its own copy of process.env). So each describe runs only when the process
// is in its zone, and is skipped otherwise: npm run test:unit runs this file twice,
// in Europe/Brussels (the default from jest.config.js) and in America/New_York.
import { UserChoicesStoreModule } from "@/store/UserChoicesStore";
import { mockMeteoBe, mountHome, restoreMocks } from "./support";

/** `describe` when the tests run in time zone `tz`, `describe.skip` otherwise. */
function describeInZone(tz: string) {
  return Intl.DateTimeFormat().resolvedOptions().timeZone === tz ? describe : describe.skip;
}

describeInZone("America/New_York")("A6 - 'radar local' windows are centred on noon at the radar", () => {
  test("a browser in New York gets the same window as one in Brussels", () => {
    /*
    selectedDateNoon parsed the date in the browser's time zone, set 12:00 and
    only then switched to the radar's zone. A viewer outside CET/CEST therefore
    saw (and totalled) a different 24 h than the selected date, and a shared
    link showed different data per viewer. Noon must be 12:00 Europe/Brussels
    for Wideumont, whatever the browser's zone.
    */
    UserChoicesStoreModule.setSelectedRadarCode("bewid");
    UserChoicesStoreModule.setTimeDisplayedAs("radarLocal");
    UserChoicesStoreModule.setSelectedDate("2020-10-13");
    UserChoicesStoreModule.setSelectedIntervalInHours(24);

    expect(UserChoicesStoreModule.startMoment.toISOString()).toBe("2020-10-12T22:00:00.000Z");
    expect(UserChoicesStoreModule.endMoment.toISOString()).toBe("2020-10-13T22:00:00.000Z");
  });

  test("UTC mode is unaffected by the browser's time zone", () => {
    /*
    Guards the other branch of the same getter: UTC windows were already right
    and must stay so.
    */
    UserChoicesStoreModule.setTimeDisplayedAs("UTC");
    UserChoicesStoreModule.setSelectedDate("2020-10-13");
    UserChoicesStoreModule.setSelectedIntervalInHours(72);

    expect(UserChoicesStoreModule.startMoment.toISOString()).toBe("2020-10-12T00:00:00.000Z");
    expect(UserChoicesStoreModule.endMoment.toISOString()).toBe("2020-10-15T00:00:00.000Z");
  });
});

describeInZone("Europe/Brussels")("A8 - previous/next date buttons across DST changes", () => {
  function homeOn(date: string, interval: number) {
    mockMeteoBe(); // no file for these dates: empty data
    return mountHome({ radar: "bewid", date, interval, timeDisplay: "radarLocal" }).vm as any;
  }
  afterEach(restoreMocks);

  test("next/previous move by whole days on the 25 h and 23 h days", () => {
    /*
    The buttons added/subtracted the interval in hours to a local midnight and
    formatted the date: on the 25 h day of October, 'next' from 2020-10-25 stayed
    on the 25th, and on the 23 h day 'previous' from 2021-03-29 jumped to the 27th.
    */
    homeOn("2020-10-25", 24).incrementPeriod();
    expect(UserChoicesStoreModule.selectedDate).toBe("2020-10-26");

    homeOn("2021-03-29", 24).decrementPeriod();
    expect(UserChoicesStoreModule.selectedDate).toBe("2021-03-28");

    homeOn("2020-10-23", 72).incrementPeriod();
    expect(UserChoicesStoreModule.selectedDate).toBe("2020-10-26");
  });
});

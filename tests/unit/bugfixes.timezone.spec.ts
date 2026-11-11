// Time zone regression tests: they change process.env.TZ, so they live in their
// own file and restore it afterwards.
import { UserChoicesStoreModule } from "@/store/UserChoicesStore";

const originalTZ = process.env.TZ;
afterAll(() => { process.env.TZ = originalTZ; });

describe("A6 - 'radar local' windows are centred on noon at the radar", () => {
  test("a browser in New York gets the same window as one in Brussels", () => {
    /*
    selectedDateNoon parsed the date in the browser's time zone, set 12:00 and
    only then switched to the radar's zone. A viewer outside CET/CEST therefore
    saw (and totalled) a different 24 h than the selected date, and a shared
    link showed different data per viewer. Noon must be 12:00 Europe/Brussels
    for Wideumont, whatever the browser's zone.
    */
    process.env.TZ = "America/New_York";
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
    process.env.TZ = "America/New_York";
    UserChoicesStoreModule.setTimeDisplayedAs("UTC");
    UserChoicesStoreModule.setSelectedDate("2020-10-13");
    UserChoicesStoreModule.setSelectedIntervalInHours(72);

    expect(UserChoicesStoreModule.startMoment.toISOString()).toBe("2020-10-12T00:00:00.000Z");
    expect(UserChoicesStoreModule.endMoment.toISOString()).toBe("2020-10-15T00:00:00.000Z");
  });
});

// Runs before each spec file. Components and specs reach the stores through
// useXStore(), which needs an active Pinia. In the app it comes from main.ts;
// here each spec file gets its own, so store state carries over between the
// tests of a file but not between files (as the Vuex singleton did).
import { createPinia, setActivePinia } from "pinia";

setActivePinia(createPinia());

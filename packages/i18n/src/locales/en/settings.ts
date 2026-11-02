import type { Messages } from "../../translate.js";

export const settings: Messages["settings"] = {
  title: "Settings",
  description: "Application preferences in this browser.",
  appearance: {
    title: "Appearance",
    hint: "The theme is saved in this browser.",
    themeGroup: "Theme",
    light: "Light",
    lightDescription: "Bright background, ideal in plenty of light.",
    dark: "Dark",
    darkDescription: "Space-like background, easier on the eyes at night.",
  },
  language: {
    title: "Language",
    hint: "The language is saved in this browser and is also used for server messages.",
    group: "Application language",
    es: "Español",
    esDescription: "Toda la aplicación en español.",
    en: "English",
    enDescription: "The whole application in English.",
  },
};

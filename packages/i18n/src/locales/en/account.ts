import type { Messages } from "../../translate.js";

export const auth: Messages["auth"] = {
  login: {
    tagline: "Your team, in the same orbit.",
    intro:
      "Projects, boards and sprints in one place. Sign in with the account your administrator created for you.",
    title: "Sign in",
    welcomeBack: "Welcome back.",
    emailPlaceholder: "you@email.com",
    submit: "Sign in",
    noAccess:
      "No account or no access? Ask an administrator to create it.",
  },
  firstLogin: {
    welcome: "Welcome, {name}",
    intro:
      "This is your first sign-in. For security, replace the temporary password with your own to continue.",
    currentLabel: "Temporary password",
    differentRule: "Different from the temporary one",
    submit: "Save and enter",
    blocked: "You won't be able to use Orbit until you complete this step.",
  },
  passwordForm: {
    newPassword: "New password",
    ruleLength: "At least 8 characters",
    ruleUppercaseNumber: "Uppercase letter and number",
    confirm: "Confirm password",
    mismatch: "The passwords don't match.",
    met: "(met)",
    pending: "(pending)",
  },
};

export const profile: Messages["profile"] = {
  title: "My profile",
  description: "Your personal details and your account security.",
  personal: "Personal details",
  emailLocked: "Only an administrator can change the email.",
  saved: "Changes saved.",
  security: {
    section: "Security",
    title: "Password",
    hint: "Use a password you don't reuse on other sites.",
    currentLabel: "Current password",
    differentRule: "Different from the current one",
    submit: "Change password",
    success: "Password updated.",
  },
  photo: {
    chooseFile: "Choose profile photo",
    change: "Change photo",
    upload: "Upload photo",
    remove: "Remove photo",
    hint: "PNG, JPG or WebP · max. {size} MB",
    invalidType: "Choose a PNG, JPG or WebP image.",
    tooLarge: "The photo cannot exceed {size} MB.",
  },
};

export const auth = {
  login: {
    tagline: "Tu equipo, en la misma órbita.",
    intro:
      "Proyectos, tableros y sprints en un solo lugar. Inicia sesión con la cuenta que te creó tu administrador.",
    title: "Iniciar sesión",
    welcomeBack: "Bienvenido de vuelta.",
    emailPlaceholder: "tu@correo.com",
    submit: "Iniciar sesión",
    noAccess: "¿Sin cuenta o sin acceso? Pide a un administrador que la cree.",
  },
  firstLogin: {
    welcome: "Bienvenido, {name}",
    intro:
      "Es tu primer inicio de sesión. Por seguridad, cambia la contraseña temporal por una propia para continuar.",
    currentLabel: "Contraseña temporal",
    differentRule: "Distinta de la temporal",
    submit: "Guardar y entrar",
    blocked: "No podrás usar Orbit hasta completar este paso.",
  },
  passwordForm: {
    newPassword: "Nueva contraseña",
    ruleLength: "Al menos 8 caracteres",
    ruleUppercaseNumber: "Mayúscula y número",
    confirm: "Confirmar contraseña",
    mismatch: "Las contraseñas no coinciden.",
    met: "(cumplido)",
    pending: "(pendiente)",
  },
};

export const profile = {
  title: "Mi perfil",
  description: "Tus datos personales y la seguridad de tu cuenta.",
  personal: "Datos personales",
  emailLocked: "El correo solo lo cambia un administrador.",
  saved: "Cambios guardados.",
  security: {
    section: "Seguridad",
    title: "Contraseña",
    hint: "Usa una contraseña que no repitas en otros sitios.",
    currentLabel: "Contraseña actual",
    differentRule: "Distinta de la actual",
    submit: "Cambiar contraseña",
    success: "Contraseña actualizada.",
  },
  photo: {
    chooseFile: "Elegir foto de perfil",
    change: "Cambiar foto",
    upload: "Subir foto",
    remove: "Quitar foto",
    hint: "PNG, JPG o WebP · máx. {size} MB",
    invalidType: "Elige una imagen PNG, JPG o WebP.",
    tooLarge: "La foto no puede superar los {size} MB.",
  },
};

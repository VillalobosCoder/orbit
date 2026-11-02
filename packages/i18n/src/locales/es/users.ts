export const users = {
  title: "Usuarios",
  description: "Gestiona las cuentas y los permisos de acceso de tu equipo.",
  newUser: "Nuevo usuario",
  selfTag: "(tú)",
  search: {
    placeholder: "Buscar por nombre o correo",
    label: "Buscar usuarios",
    noMatches: "Ningún usuario coincide con la búsqueda.",
  },
  columns: {
    user: "Usuario",
  },
  actions: {
    edit: "Editar a {name}",
    editTitle: "Editar y permisos",
    reset: "Restablecer la contraseña de {name}",
    resetTitle: "Restablecer contraseña",
    delete: "Eliminar a {name}",
    deleteTitle: "Eliminar",
  },
  deleteDialog: {
    title: "¿Eliminar usuario?",
    before: "Se eliminará la cuenta de",
    after: ". Esta acción no se puede deshacer.",
    confirm: "Eliminar usuario",
  },
  resetDialog: {
    title: "¿Restablecer la contraseña?",
    before: "Se generará una contraseña temporal para",
    after:
      ". La actual dejará de funcionar y la persona deberá cambiarla al volver a entrar.",
    confirm: "Restablecer contraseña",
    pending: "Restableciendo...",
  },
  resetDone: {
    title: "Contraseña restablecida",
    description:
      "Comparte esta contraseña temporal con {name}. No se volverá a mostrar después de cerrar este diálogo.",
  },
  temporary: {
    label: "Contraseña temporal · se muestra una sola vez",
    copy: "Copiar",
    copied: "Copiado",
    hint: "La persona deberá cambiarla en su próximo inicio de sesión.",
    done: "Listo",
  },
  form: {
    createdTitle: "Usuario creado",
    createdDescription:
      "Comparte esta contraseña temporal con el usuario. No se volverá a mostrar después de cerrar este diálogo.",
    editTitle: "Editar usuario",
    newTitle: "Nuevo usuario",
    editDescription: "Modifica los datos y permisos de {name}.",
    newDescription:
      "Ingresa los datos de la persona. El sistema generará una contraseña temporal que verás una sola vez.",
    ownPermissions: "No puedes modificar tus propios permisos.",
    permissionsLegend: "Permisos por módulo",
    writeIncludesRead: "Escribir incluye leer",
    loadingModules: "Cargando módulos...",
    modulesError:
      "No se pudieron cargar los módulos. Intenta de nuevo antes de guardar.",
    moduleColumn: "Módulo",
    read: "Leer",
    write: "Escribir",
    readOf: "{label}: leer",
    writeOf: "{label}: escribir",
    subsectionsHint:
      "Las subsecciones de Proyectos solo se activan si la persona puede leer Proyectos. Editar proyectos y comentar requieren Escribir en Proyectos.",
    create: "Crear usuario",
    creating: "Creando usuario...",
  },
};

export const modules = {
  home: "Inicio",
  users: "Usuarios",
  projects: "Proyectos",
  projectsIssues: "Issues",
  projectsMoveIssues: "Mover issues",
  projectsSprints: "Sprints",
  projectsColumns: "Columnas",
};

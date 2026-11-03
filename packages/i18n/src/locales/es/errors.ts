export const errors = {
  http: {
    notAuthenticated: "No autenticado.",
    sessionInvalid: "La sesión ya no es válida.",
    sessionExpired: "Sesión inválida o expirada.",
    mustChangePassword: "Debes cambiar tu contraseña antes de continuar.",
    forbidden: "No tienes permiso para esta acción.",
    tooManyAttempts: "Demasiados intentos. Intenta de nuevo más tarde.",
    invalidData: "Datos inválidos",
    invalidJson: "El cuerpo JSON no es válido.",
    bodyTooLarge: "El cuerpo de la solicitud es demasiado grande.",
    unsupportedFormat: "Formato de solicitud no compatible.",
    internal: "Error interno del servidor.",
    technicalProblems:
      "Estamos experimentando problemas técnicos. Por favor, intenta nuevamente más tarde.",
    cannotEditOwnPermissions: "No puedes modificar tus propios permisos.",
    cannotDeleteOwnAccount: "No puedes eliminar tu propia cuenta.",
  },
  validation: {
    duplicateModule: "No se puede repetir un módulo.",
    needPermission: "Selecciona al menos un permiso para cada módulo.",
  },
  comment: {
    notFound: "No se encontró el comentario {commentId}.",
    onlyAuthor: "Solo el autor puede modificar o borrar su comentario.",
  },
  notification: {
    notFound: "No se encontró la notificación {notificationId}.",
  },
  attachment: {
    notFound: "No se encontró el adjunto {attachmentId}.",
    invalid: "El archivo debe ser una imagen (PNG, JPG, WebP, GIF) o un video (MP4, WebM) válido.",
    tooLarge: "El archivo no puede superar los {maxMegabytes} MB.",
    tooMany: "Un issue admite como máximo {max} adjuntos.",
  },
  boardColumn: {
    notFound: "No se encontró la columna {columnId}.",
    nameExists: 'Ya existe una columna llamada "{name}" en este proyecto.',
    reorderMismatch:
      "El orden debe incluir cada columna del proyecto exactamente una vez.",
    chooseTarget: "Elige otra columna del proyecto para recibir los issues.",
    needTodoAndDone:
      "El proyecto necesita al menos una columna 'Por hacer' y una 'Finalizada'.",
  },
  user: {
    invalidEmail: 'El correo "{raw}" no tiene un formato válido.',
    weakPassword: "La contraseña debe tener al menos 8 caracteres.",
    passwordTooLong: "La contraseña no puede superar 1024 bytes.",
    alreadyExists: "Ya existe un usuario con el correo {email}.",
    notFound: "No se encontró el usuario {id}.",
    invalidModule: 'El módulo "{module}" no existe.',
    initialAdminExists:
      "El administrador inicial solo puede configurarse si no existen usuarios.",
    invalidCredentials: "Correo o contraseña incorrectos.",
    passwordPolicy:
      "La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.",
    incorrectCurrentPassword: "La contraseña actual no es correcta.",
    samePassword: "La contraseña nueva debe ser distinta de la actual.",
    cannotResetOwnPassword:
      "No puedes restablecer tu propia contraseña; cámbiala desde tu perfil.",
    invalidAvatar: "La foto debe ser una imagen PNG, JPG o WebP válida.",
    avatarTooLarge: "La foto no puede superar los 2 MB.",
    avatarNotFound: "El usuario no tiene foto de perfil.",
    permissionRequiresParent:
      "Para dar acceso a «{module}» también se necesita acceso a «{parent}».",
  },
  issue: {
    notFound: "No se encontró el issue {issueId}.",
    invalidDates: "La fecha de inicio no puede ser posterior a la fecha de fin.",
    reference: {
      priority: "La prioridad no pertenece a este proyecto.",
      difficulty: "La dificultad no pertenece a este proyecto.",
      type: "El tipo de issue no pertenece a este proyecto.",
      parent: "El issue padre no pertenece a este proyecto.",
      column: "La columna no pertenece a este proyecto.",
      sprint: "El sprint no pertenece a este proyecto.",
      neighbor: "La tarjeta vecina no pertenece a este proyecto.",
    },
    parent: {
      onlySubtasks: "Solo las subtareas pueden tener un issue padre.",
      subtaskNeedsParent: "Una subtarea necesita un issue padre.",
      ownParent: "Un issue no puede ser su propio padre.",
      subtaskAsParent: "Una subtarea no puede ser el padre de otra subtarea.",
      withChildren:
        "Un issue con subtareas no puede convertirse en subtarea.",
      followsParentSprint: "Las subtareas siguen el sprint de su issue padre.",
    },
    assigneeNotMember: "El usuario {userId} no es miembro del proyecto.",
    actionNotAllowed: {
      move: "No tienes permiso para mover issues entre columnas.",
      changeSprint: "No tienes permiso para cambiar el sprint de un issue.",
    },
  },
  project: {
    invalidKey:
      'La clave "{raw}" no es válida: usa de 2 a 10 caracteres, letras mayúsculas o números, empezando por una letra.',
    notFound: "No se encontró el proyecto {id}.",
    keyExists: "Ya tienes un proyecto con la clave {projectKey}.",
    onlyOwner: "Solo el propietario del proyecto puede realizar esta acción.",
    alreadyMember: "El usuario ya es miembro del proyecto.",
    notMember: "El usuario {userId} no es miembro del proyecto.",
    cannotRemoveOwner: "No puedes quitar al propietario del proyecto.",
  },
  sprint: {
    notFound: "No se encontró el sprint {sprintId}.",
    endBeforeStart: "La fecha de fin no puede ser anterior a la de inicio.",
    nameExists: 'Ya existe un sprint llamado "{name}" en este proyecto.',
    alreadyActive:
      "El proyecto ya tiene un sprint activo. Complétalo antes de iniciar otro.",
    state: {
      closedNotEditable: "Un sprint cerrado no se puede editar.",
      onlyPlannedStart: "Solo se puede iniciar un sprint planeado.",
      onlyActiveClose: "Solo se puede completar un sprint activo.",
      onlyPlannedDelete: "Solo se puede eliminar un sprint que aún no empezó.",
      closedNoIssues: "No se pueden asignar issues a un sprint cerrado.",
    },
  },
};

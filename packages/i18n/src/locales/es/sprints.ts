export const dates = {
  noDates: "Sin fechas",
  noStart: "sin inicio",
  noEnd: "sin fin",
  endsToday: "termina hoy",
  overdue: "vencido",
  days: { one: "{count} día", other: "{count} días" },
  until: "hasta {date} · {remaining}",
};

export const sprints = {
  status: { planned: "Planeado", active: "Activo", closed: "Cerrado" },
  planning: {
    title: "Planificación",
    description: "Organiza los issues en sprints y mantén el backlog al día.",
    newSprint: "Nuevo sprint",
    newIssue: "Nuevo issue",
    moveTo: "Mover {key} a",
    progress: "{done} / {total} terminados",
    progressLabel: "Issues terminados",
    start: "Iniciar",
    complete: "Completar sprint",
    noIssues: "Sin issues.",
    backlog: "Backlog",
    issueCount: { one: "{count} issue", other: "{count} issues" },
    history: "Historial de sprints",
    closedBadge: "Cerrado",
    completeDialog: {
      title: "¿Completar {name}?",
      pending: {
        one: "{count} issue sin terminar volverá al backlog.",
        other: "{count} issues sin terminar volverán al backlog.",
      },
      allDone:
        "Todos sus issues están terminados. El sprint pasará al historial.",
      confirm: "Completar sprint",
    },
    deleteDialog: {
      title: "¿Eliminar {name}?",
      description: "Sus issues volverán al backlog.",
      confirm: "Eliminar sprint",
    },
  },
  form: {
    editTitle: "Editar sprint",
    newTitle: "Nuevo sprint",
    editDescription: "Modifica los datos de {name}.",
    newDescription:
      "Nace como «Planeado». Solo puede haber un sprint activo a la vez.",
    goal: "Objetivo",
    startDate: "Inicio",
    endDate: "Fin",
    invalidRange: "La fecha de fin no puede ser anterior a la de inicio.",
    duration: {
      one: "Duración: {count} día",
      other: "Duración: {count} días",
    },
    create: "Crear sprint",
  },
};

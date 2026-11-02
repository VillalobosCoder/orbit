export const home = {
  greeting: {
    morning: "Buenos días",
    afternoon: "Buenas tardes",
    evening: "Buenas noches",
  },
  noAccess:
    "Aquí aparecerá el resumen de tus proyectos cuando tengas acceso a ellos.",
  summary: {
    projects: "Proyectos",
    withActiveSprint: "{count} con sprint activo",
    assigned: "Asignados a ti",
    inProgress: "{count} en curso",
    closing: "Cierran esta semana",
    sprintToClose: { one: "sprint por cerrar", other: "sprints por cerrar" },
  },
  assigned: {
    title: "Asignados a ti",
    showing: "Mostrando {shown} de {total} issues asignados",
    count: { one: "{count} issue asignado", other: "{count} issues asignados" },
  },
  sprints: {
    title: "Sprints activos",
    noActive: {
      one: "Sin sprint activo · {count} issue en el backlog",
      other: "Sin sprint activo · {count} issues en el backlog",
    },
    progress: "Progreso de {name}",
    done: "{done} de {total} terminados",
  },
};

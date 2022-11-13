export default defineEventHandler(async (event) => {
  let db = globalThis.db;
  let body = await useBody(event);

  let project = await db.device.create({
    data: {
      name: body.name,
      projects: {
        connect: {
          id: body.projectId,
        },
      },
    },
  });

  return {
    project,
  };
});

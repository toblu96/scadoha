export default defineEventHandler(async (event) => {
  let db = globalThis.db;
  let body = await readBody(event);

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

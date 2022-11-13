export default defineEventHandler(async (event) => {
  let db = globalThis.db;
  let body = await useBody(event);

  console.log(body);
  let project = await db.project.create({
    data: {
      name: body.name,
    },
  });

  return {
    project,
  };
});

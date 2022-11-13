export default defineEventHandler(async (event) => {
  let db = globalThis.db;
  let params = getRouterParams(event);

  let project = await db.project.delete({
    where: {
      id: params.id,
    },
  });

  return {
    deleted: true,
    project,
  };
});

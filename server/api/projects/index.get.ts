export default defineEventHandler(async (event) => {
  let db = globalThis.db;

  let projects = await db.project.findMany();

  return {
    projects,
  };
});

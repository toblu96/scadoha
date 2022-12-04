export default defineEventHandler(async (event) => {
  let db = globalThis.db;

  let tags = await db.tag.findMany();

  return {
    tags,
  };
});

export default defineEventHandler(async (event) => {
  let db = globalThis.db;
  let query = useQuery(event);

  let tags = await db.tag.findMany();

  return {
    tags,
  };
});

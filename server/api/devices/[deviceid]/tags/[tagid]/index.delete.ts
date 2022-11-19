export default defineEventHandler(async (event) => {
  let db = globalThis.db;
  let params = getRouterParams(event);

  let tag = await db.tag.delete({
    where: {
      id: params.tagid,
    },
  });

  return {
    deleted: true,
    tag,
  };
});

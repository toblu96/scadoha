export default defineEventHandler(async (event) => {
  let db = globalThis.db;
  let params = getRouterParams(event);

  let tags = await db.tag.findMany({
    where: {
      deviceId: params.deviceid,
    },
  });

  return {
    tags,
  };
});

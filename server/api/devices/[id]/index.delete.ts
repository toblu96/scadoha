export default defineEventHandler(async (event) => {
  let db = globalThis.db;
  let params = getRouterParams(event);

  let device = await db.device.delete({
    where: {
      id: params.id,
    },
  });

  return {
    deleted: true,
    device,
  };
});

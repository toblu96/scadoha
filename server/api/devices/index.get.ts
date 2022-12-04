export default defineEventHandler(async (event) => {
  let db = globalThis.db;
  let { project } = getQuery(event);

  let devices = await db.device.findMany({
    where: {
      projects: {
        some: {
          id: project as string,
        },
      },
    },
  });

  return {
    devices,
  };
});

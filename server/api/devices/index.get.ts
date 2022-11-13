export default defineEventHandler(async (event) => {
  let db = globalThis.db;
  let query = useQuery(event);

  let devices = await db.device.findMany({
    where: {
      projects: {
        some: {
          id: query.project as string,
        },
      },
    },
  });

  return {
    devices,
  };
});

export default defineEventHandler(async (event) => {
  let db = globalThis.db;
  let body = await useBody(event);

  let tag = await db.tag.create({
    data: {
      name: body.name,
      type: "MQTT",
      devices: {
        connect: {
          id: body.deviceId,
        },
      },
    },
  });

  return {
    tag,
  };
});

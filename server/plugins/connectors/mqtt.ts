import { connect } from "mqtt"; // import connect from mqtt

export default defineNitroPlugin((nitroApp) => {
  let client = connect("mqtt://broker.emqx.io"); // create a client

  client.on("connect", function () {
    client.subscribe("tbl/nuxt/#", function (err) {
      if (!err) {
        client.publish(
          "tbl/nuxt/hello/test",
          "Hello mqtt from connector plugin!"
        );
      }
    });
  });

  client.on("message", async function (topic, message, packet) {
    let db = globalThis.db;

    // extract data from topic
    let [deviceId, tagId] = topic
      .replace("tbl/nuxt/", "")
      .split("/")
      .slice(0, 2);

    // check if device and tag exists - e.g. `clao804lj0002nvew7xfjqlt6/clao804lj0003nvewpsu2cj2h/`
    let device = await db.device.findFirst({
      include: { tags: true },
      where: {
        id: deviceId,
        tags: { some: { id: tagId } },
      },
    });
    if (!device) {
      console.log(
        `Got message which does not belong to device and tag combination. ${deviceId} - ${tagId}`
      );
      return;
    }

    // TODO: validate mqtt payload

    // build mqtt payload
    let payload = {
      timeUTC: Date.now().toString(),
      device: deviceId,
      tag: tagId,
      data: JSON.parse(message.toString()),
    };

    // send payload to interpreter service (nuxt hooks) e.g. `connector:mqtt:new-data` with payload {device: "", tag: "", timeUTC: "", data: {}}
    nitroApp.hooks.callHook("connector:mqtt:new-data", payload);
  });
});

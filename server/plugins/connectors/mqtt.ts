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

  client.on("message", function (topic, message) {
    // message is Buffer
    console.log(message.toString());
    // client.end()
  });
});

import { connect, MqttClient } from "mqtt"; // import connect from mqtt
import { z } from "zod";

interface IMqttConnection {
  /** Id of mqtt broker in DB. */
  id: string;
  /** Client instance for mqtt broker. */
  client: MqttClient;
  /** Timestamp of last reconnect try. */
  lastReconnectUTC: string;
  /** Connection state of broker. */
  connected: boolean;
  /** Latest error description */
  errorText?: string;
}
let mqttConnections: IMqttConnection[];

export default defineNitroPlugin(async (nitroApp) => {
  mqttConnections = [];
  try {
    // check db for all mqtt broker configurations
    let brokers = await globalThis.db.mqttBroker.findMany({
      include: {
        tags: true,
      },
    });

    // connect to brokers, loop through each for initial configuration
    for (const broker of brokers) {
      let client = connect(broker.url, {
        // TODO: Add more connection params to db schema for custom configuration.
        reconnectPeriod: 5000,
      }); // create a client

      // handle different events
      client.on("error", async (data) => {
        let locBroker: IMqttConnection | undefined = mqttConnections.find(
          (connection) => connection.id === broker.id
        );
        if (locBroker) {
          locBroker.errorText = data.message;
        }
        console.error(`Error on broker '${broker.name}': \t${data.message}`);
      });
      client.on("offline", async () => {
        let locBroker: IMqttConnection | undefined = mqttConnections.find(
          (connection) => connection.id === broker.id
        );
        if (locBroker) {
          locBroker.connected = client.connected;
        }
        console.error(`Broker '${broker.name}' is offline`);
      });
      client.on("reconnect", async () => {
        let locBroker: IMqttConnection | undefined = mqttConnections.find(
          (connection) => connection.id === broker.id
        );
        if (locBroker) {
          locBroker.connected = client.connected;
        }
        console.error(`Reconnect from broker '${broker.name}'`);
      });

      // connect to broker
      client.on("connect", function () {
        console.info(`[MQTT Plugin] Broker '${broker.name}' connected..`);

        // subscribe to all topics
        for (const tag of broker.tags) {
          client.subscribe(tag.topic, function (err) {
            if (err) {
              console.error(
                `Could not connect to topic ${tag.topic} from broker ${broker.name}`
              );
            }
          });
        }
      });

      // handle broker messages
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

        // validate mqtt payload
        const singleValueSchema = z.object({
          value: z.string(),
        });

        let parse = singleValueSchema.safeParse(JSON.parse(message.toString()));
        if (!parse.success) {
          console.log(
            `Received data does not match schema for device ${deviceId} and tag ${tagId}. \n ${parse.error}`
          );
          return;
        }

        // build mqtt payload
        let payload = {
          timeUTC: Date.now().toString(),
          device: deviceId,
          tag: tagId,
          schema: "singleValue",
          data: {
            value: parse.data.value,
          },
        };

        // send payload to interpreter service (nuxt hooks) e.g. `connector:mqtt:new-data:broker-id` with payload {device: "", tag: "", timeUTC: "", data: {}}
        nitroApp.hooks.callHook(
          `connector:mqtt:new-data:${broker.id}`,
          payload
        );
      });

      // store connection locally for later use
      let brokerConnection: IMqttConnection = {
        id: broker.id,
        client,
        connected: true,
        lastReconnectUTC: Date.now().toString(),
      };
      mqttConnections.push(brokerConnection);
    }
  } catch (error) {
    console.error(error);
  }
});

import PocketBase, { RecordAuthResponse, Record } from "pocketbase";
import eventsource from "eventsource"; // see https://github.com/pocketbase/js-sdk#nodejs-via-npm
import { Client, connect } from "mqtt";
import { getServiceLogger } from "../../modules/logger";
import { Logger } from "winston";

// @ts-ignore
globalThis.EventSource = eventsource;

// ---------------------------------------
// pocketbase types
// ---------------------------------------
interface IPBTag {
  collectionId: string;
  collectionName: string;
  broker: string;
  created: string;
  description: string;
  id: string;
  name: string;
  topic: string;
  updated: string;
}
interface IPBBroker {
  collectionId: string;
  collectionName: string;
  created: string;
  description: string;
  enabled: boolean;
  expand: { "mqtt_tag(broker)": IPBTag[] };
  host: string;
  id: string;
  name: string;
  port: number;
  project: string;
  updated: string;
}
type PBSubscriptionActions = "create" | "update" | "delete";

// ---------------------------------------
// local types
// ---------------------------------------
interface IBroker {
  client: Client;
  state: string;
  topics: Map<string, string>;
}
type IConnectedBrokers = Map<string, IBroker>; // key is id from database
interface IBrokerSettings {
  id: string;
  host: string;
  port: number;
}
interface ITagSettings {
  brokerId: string;
  tagId: string;
  topic: string;
}
type OnBrokerChangeCallback = (
  action: PBSubscriptionActions,
  broker: IPBBroker
) => void;
type OnTagChangeCallback = (action: PBSubscriptionActions, tag: IPBTag) => void;

// ---------------------------------------
// init plugin
// ---------------------------------------
interface IPluginState {
  pb: PocketBase;
  pbAuthData: RecordAuthResponse<Record>;
  connectedBrokers: IConnectedBrokers;
  logger: Logger;
}
export default defineNitroPlugin(async (nitroApp) => {
  // init service logger
  let logger = getServiceLogger("MQTT Connector");

  logger.info("Starting service..");

  // get pb auth
  let { pb, auth, error } = await getPBAuth();
  if (error) {
    logger.error(`Could not get PB auth: ${error}`);
    return;
  }

  // plugin state
  let pluginState: IPluginState = {
    pb: pb as PocketBase,
    pbAuthData: auth as RecordAuthResponse<Record>,
    connectedBrokers: new Map<string, IBroker>(),
    logger,
  };

  // init pb listeners
  onPBBrokerChange(pluginState, async (action, broker) => {
    switch (action) {
      case "create":
      case "update":
        // if updated broker is disabled
        if (!broker.enabled) {
          deleteMQTTBroker(pluginState, broker.id);
          break;
        }

        connectMQTTBroker(pluginState, {
          id: broker.id,
          host: broker.host,
          port: broker.port,
        });
        // connect to all topics from broker
        let tags = await pluginState.pb
          .collection("mqtt_tag")
          .getFullList<IPBTag>(undefined, {
            filter: `broker ~ '${broker.id}'`,
          });

        for (const tag of tags) {
          subscribeTopic(pluginState, {
            brokerId: broker.id,
            tagId: tag.id,
            topic: tag.topic,
          });
        }
        break;

      case "delete":
        deleteMQTTBroker(pluginState, broker.id);
        break;

      default:
        break;
    }
  });
  onPBTagChange(pluginState, async (action, tag) => {
    switch (action) {
      case "create":
      case "update":
        // create or update topic in broker - also handles special cases
        subscribeTopic(pluginState, {
          brokerId: tag.broker,
          tagId: tag.id,
          topic: tag.topic,
        });
        break;

      case "delete":
        unsubscribeTopic(pluginState, tag.broker, tag.id);
        break;

      default:
        break;
    }
  });

  // init broker connection
  await initMQTTBroker(pluginState);

  // define plugin specific inline routes
  nitroApp.router.add(
    "/api/connectors/mqtt",
    eventHandler(() => {
      const start = performance.now();
      let brokers = [];
      // get all brokers
      for (const [brokerId, broker] of pluginState.connectedBrokers) {
        // get all topics from one broker
        let topics = [];
        for (const [topicId, topic] of broker.topics) {
          topics.push({
            id: topicId,
            topic,
          });
        }
        brokers.push({
          id: brokerId,
          host: broker.client.options.host,
          port: broker.client.options.port,
          connected: broker.client.connected,
          state: broker.state,
          topics: topics,
        });
      }
      const end = performance.now();
      return {
        brokers,
        executionTime: `${end - start} ms`,
      };
    })
  );
});

// ---------------------------------------
// helper functions
// ---------------------------------------
const getPBAuth = async (): Promise<{
  pb?: PocketBase;
  auth?: RecordAuthResponse<Record>;
  error?: string;
}> => {
  try {
    const runtimeConfig = useRuntimeConfig();
    const pb = new PocketBase(runtimeConfig.public.pbBaseUrl);
    let auth = await pb
      .collection("service_users")
      .authWithPassword(
        runtimeConfig.pbMqttServiceAccountUsername,
        runtimeConfig.pbMqttServiceAccountPassword
      ); // auto-catch if not valid
    return {
      pb,
      auth,
      error: undefined,
    };
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
};

const onPBBrokerChange = (
  pluginState: IPluginState,
  cb: OnBrokerChangeCallback
) => {
  pluginState.pb
    .collection("mqtt_brokers")
    .subscribe<IPBBroker>("*", async function (e) {
      cb(e.action as PBSubscriptionActions, e.record);
    });
};

const onPBTagChange = (pluginState: IPluginState, cb: OnTagChangeCallback) => {
  pluginState.pb
    .collection("mqtt_tag")
    .subscribe<IPBTag>("*", async function (e) {
      cb(e.action as PBSubscriptionActions, e.record);
    });
};

const initMQTTBroker = async (pluginState: IPluginState) => {
  // get enabled brokers from pb (must be enabled)
  const brokers = await pluginState.pb
    .collection("mqtt_brokers")
    .getFullList<IPBBroker>(undefined, {
      expand: "mqtt_tag(broker)",
      filter: "enabled = true",
    });

  // init brokers and subscriptions
  for (const broker of brokers) {
    connectMQTTBroker(pluginState, {
      id: broker.id,
      host: broker.host,
      port: broker.port,
    });

    // connect to all topics from each broker
    for (const tag of broker.expand["mqtt_tag(broker)"] || []) {
      subscribeTopic(pluginState, {
        brokerId: broker.id,
        tagId: tag.id,
        topic: tag.topic,
      });
    }
  }
};
const connectMQTTBroker = (
  pluginState: IPluginState,
  brokerSettings: IBrokerSettings
) => {
  // disconnect if connection exists
  const currentClient = pluginState.connectedBrokers.get(brokerSettings.id);
  if (currentClient) {
    currentClient.client.end();
    pluginState.logger.info(
      `Broker connection '${brokerSettings.id}' ended, start reconnecting with new settings..`
    );
  }

  // connect to broker
  let client = connect({
    clientId: `scadoha-client-${brokerSettings.id}`,
    host: brokerSettings.host,
    port: brokerSettings.port,
    protocol: "tcp",
    reconnectPeriod: 10000, // 0 to disable auto reconnect
  });

  // add client handlers
  client.on("connect", (data) => {
    // connection successful
    pluginState.connectedBrokers.get(brokerSettings.id)!.state = "Connected";
  });
  client.on("message", (topic, payload, packet) => {
    pluginState.logger.info(
      `Got message from broker '${brokerSettings.host} - ${
        brokerSettings.id
      }' on topic '${topic}': ${payload.toString()}`
    );

    // TODO: Pass data to incoming values queue (with project id for identification and other metadata)
  });

  client.on("error", (err) => {
    pluginState.logger.error(err.message);
    pluginState.connectedBrokers.get(brokerSettings.id)!.state = err.message;
  });

  client.on("end", () => {
    pluginState.logger.info("Connection ended");
    pluginState.connectedBrokers.get(brokerSettings.id)!.state =
      "Connection ended";
  });

  // store to plugin state
  pluginState.connectedBrokers.set(brokerSettings.id, {
    client: client,
    state: "",
    topics: new Map(),
  });
};
const deleteMQTTBroker = (pluginState: IPluginState, brokerId: string) => {
  const broker = pluginState.connectedBrokers.get(brokerId);
  if (broker) {
    broker.client.end();
    broker.client.once("end", () => {
      // wait until broker is disconnected before removing local state
      pluginState.connectedBrokers.delete(brokerId);
      pluginState.logger.info(`Broker '${brokerId}' disconnected`);
    });
  }
};

const subscribeTopic = (pluginState: IPluginState, tag: ITagSettings) => {
  // unsubscribe and delete topic in other brokers if they were moved from there
  for (const [brokerId, broker] of pluginState.connectedBrokers) {
    if (broker.topics.has(tag.tagId)) {
      // handle if broker reference has changed (delete topic in previous broker) or if topic has changed
      unsubscribeTopic(pluginState, brokerId, tag.tagId);
      pluginState.logger.info(
        `Tag '${tag.topic}' deleted from broker: ${broker.client.options.host}`
      );
    }
  }
  // add topic to current broker
  const broker = pluginState.connectedBrokers.get(tag.brokerId);
  if (broker) {
    broker.client.subscribe(tag.topic);
    broker.topics.set(tag.tagId, tag.topic);
    pluginState.logger.info(
      `Tag '${tag.topic}' added/updated on broker: ${broker.client.options.host}`
    );
  }
};
const unsubscribeTopic = (
  pluginState: IPluginState,
  brokerId: string,
  tagId: string
) => {
  const broker = pluginState.connectedBrokers.get(brokerId);
  if (broker) {
    let topic = broker.topics.get(tagId) || "";
    broker.client.unsubscribe(topic);
    broker.topics.delete(tagId);
  }
};

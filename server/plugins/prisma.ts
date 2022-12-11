import { PrismaClient } from "@prisma/client";

declare global {
  var db: PrismaClient<any>;
}

export default defineNitroPlugin(async (nitroApp) => {
  if (!globalThis.db) {
    globalThis.db = new PrismaClient();
  }
  console.info(`[Prisma Plugin] Connected..`);

  // init admin user
  let user = await globalThis.db.user.findFirst({
    where: {
      name: {
        equals: "admin",
      },
    },
  });
  if (!user) {
    // create initial data
    let data = await globalThis.db.user.create({
      include: {
        projects: true,
      },
      data: {
        name: "admin",
        password: "admin",
        projects: {
          create: {
            name: "First Project",
            description: "This project got auto created.",
            devices: {
              create: {
                name: "My first device",
                tags: {
                  create: {
                    name: "First value",
                    type: "MQTT",
                  },
                },
              },
            },
            mqttBrokers: {
              create: {
                name: "EMQX Test Broker",
                description: "Initial test broker for connection tests.",
                url: "mqtt://broker.emqx.io",
                tags: {
                  create: {
                    name: "Test Tag",
                    topic: "tbl/nuxt/#",
                  },
                },
              },
            },
          },
        },
      },
    });
    console.info(`[Prisma Plugin] 🌱 Initial admin user with project created.`);
  }
});

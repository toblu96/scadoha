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
    await globalThis.db.user.create({
      data: {
        name: "admin",
        password: "admin",
        projects: {
          create: {
            name: "First Project",
            description: "This project got auto created.",
          },
        },
      },
    });
    console.info(`[Prisma Plugin] 🌱 Initial admin user with project created.`);
  }
});

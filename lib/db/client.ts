import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";
import { getServerEnvironment } from "@/lib/env/server";

const globalDatabase = globalThis as unknown as { database?: PrismaClient };

export function getDatabase(): PrismaClient {
  if (globalDatabase.database) return globalDatabase.database;

  const adapter = new PrismaPg({
    connectionString: getServerEnvironment().DATABASE_URL,
  });
  const database = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") globalDatabase.database = database;
  return database;
}

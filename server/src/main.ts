import { closeSqlServer, getSqlServerPool } from "./database/sqlServer.js";
import { databaseConfig } from "./config/env.js";

async function main() {
  try {
    const pool = await getSqlServerPool();
    console.log(`SQL Server connected: ${databaseConfig.server}:${databaseConfig.port}/${databaseConfig.database}`);
  } catch (error) {
    console.error("SQL Server connection failed.", error);
    process.exitCode = 1;
  }
}

process.once("SIGINT", async () => {
  await closeSqlServer();
  process.exit(0);
});

process.once("SIGTERM", async () => {
  await closeSqlServer();
  process.exit(0);
});

void main();

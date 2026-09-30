import sql from "mssql";
import { databaseConfig } from "../config/env.js";

let poolPromise: Promise<sql.ConnectionPool> | undefined;

export function getSqlServerPool() {
  poolPromise ??= new sql.ConnectionPool(databaseConfig).connect();
  return poolPromise;
}

export async function closeSqlServer() {
  if (!poolPromise) return;
  const pool = await poolPromise;
  await pool.close();
  poolPromise = undefined;
}

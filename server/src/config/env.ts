import "dotenv/config";

function required(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function booleanValue(name: string, fallback: boolean) {
  const value = process.env[name];
  return value === undefined ? fallback : value.toLowerCase() === "true";
}

export const databaseConfig = {
  server: required("DB_SERVER", "localhost"),
  port: Number(required("DB_PORT", "1433")),
  database: required("DB_NAME", "BrewLite"),
  user: required("DB_USER", "sa"),
  password: required("DB_PASSWORD"),
  options: {
    encrypt: booleanValue("DB_ENCRYPT", false),
    trustServerCertificate: booleanValue("DB_TRUST_SERVER_CERTIFICATE", true),
  },
};

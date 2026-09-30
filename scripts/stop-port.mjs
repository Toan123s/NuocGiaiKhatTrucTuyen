import { execFileSync } from "node:child_process";

const port = process.env.PORT || "8443";
const output = execFileSync("netstat", ["-ano", "-p", "tcp"], { encoding: "utf8" });
const processIds = new Set();

for (const line of output.split(/\r?\n/)) {
  const columns = line.trim().split(/\s+/);
  if (columns[1]?.endsWith(`:${port}`) && columns[3] === "LISTENING") {
    processIds.add(columns[4]);
  }
}

if (processIds.size === 0) {
  console.log(`Port ${port} is available.`);
  process.exit(0);
}

for (const processId of processIds) {
  try {
    execFileSync("taskkill", ["/PID", processId, "/T", "/F"], { stdio: "inherit" });
    console.log(`Stopped process ${processId} using port ${port}.`);
  } catch {
    console.warn(`Could not stop process ${processId}. Close it manually or run the terminal as permitted.`);
  }
}

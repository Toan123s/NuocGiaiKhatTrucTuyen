import { spawn } from "node:child_process";

const command = process.platform === "win32" ? "cmd.exe" : "pnpm";
const args = process.platform === "win32" ? ["/d", "/s", "/c", "pnpm dev:raw"] : ["dev:raw"];
const child = spawn(command, args, {
  detached: true,
  stdio: "ignore",
  windowsHide: true,
});

child.unref();
console.log("Vite is running in the background on http://localhost:8443/");

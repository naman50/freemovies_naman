import { execSync } from "node:child_process";

function run(command) {
  try {
    return execSync(command, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

const pids = new Set();

if (process.platform === "win32") {
  const output = run("netstat -ano | findstr :3000");
  for (const line of output.split(/\r?\n/)) {
    const parts = line.trim().split(/\s+/);
    const pid = parts.at(-1);
    if (pid && /^\d+$/.test(pid)) pids.add(pid);
  }
  for (const pid of pids) run(`taskkill /PID ${pid} /F`);
} else {
  const output = run("lsof -tiTCP:3000 -sTCP:LISTEN");
  for (const pid of output.split(/\s+/)) {
    if (pid && /^\d+$/.test(pid)) pids.add(pid);
  }
  for (const pid of pids) run(`kill ${pid}`);
}

console.log(pids.size ? `Stopped ${pids.size} process(es) on port 3000.` : "No process was listening on port 3000.");

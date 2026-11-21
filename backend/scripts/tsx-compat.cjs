// tsx asks Node for the current user ID when no POSIX geteuid() is available.
// Some Windows/container environments cannot resolve that account and Node
// throws from os.userInfo(). tsx only uses the value to name its temp folder.
if (typeof process.geteuid !== "function") {
  const os = require("node:os");
  try {
    os.userInfo();
  } catch {
    os.userInfo = () => ({
      username: process.env.USERNAME || process.env.USER || "velora",
    });
  }
}

// tsx watch starts another Node process. Keep the workaround active there too.
const preloadPath = __filename.replace(/\\/g, "/");
const preloadOption = `--require "${preloadPath}"`;
if (!process.env.NODE_OPTIONS?.includes(__filename)) {
  process.env.NODE_OPTIONS = [process.env.NODE_OPTIONS, preloadOption]
    .filter(Boolean)
    .join(" ");
}

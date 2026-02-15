#!/usr/bin/env -S deno run -A

type Proc = {
  name: string;
  child: Deno.ChildProcess;
};

const HOST = "127.0.0.1";
const LANDING_PORT = 4300;

const sites = [
  { name: "uta8a.net", port: 4321, dir: "site/uta8a.net" },
  { name: "chotto.uta8a.net", port: 4322, dir: "site/chotto.uta8a.net" },
  { name: "generated.uta8a.net", port: 4323, dir: "site/generated.uta8a.net" },
] as const;

const running: Proc[] = [];
let shuttingDown = false;

function spawnProcess(name: string, cmd: string[], cwd?: string): Proc {
  const child = new Deno.Command(cmd[0], {
    args: cmd.slice(1),
    cwd,
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
    env: {
      ...Deno.env.toObject(),
      ASTRO_TELEMETRY_DISABLED: "1",
    },
  }).spawn();

  const proc = { name, child };
  running.push(proc);

  child.status.then((status) => {
    if (!status.success && !shuttingDown) {
      console.error(`[dev-all] process failed: ${name} (code=${status.code})`);
      void shutdown(1);
    }
  });

  return proc;
}

function landingHtml(): string {
  const links = sites
    .map((site) => `<li><a href=\"http://${HOST}:${site.port}\">${site.name}</a> <small>(${site.port})</small></li>`)
    .join("\n");

  return `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>website local dev</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, sans-serif; margin: 2rem auto; max-width: 720px; line-height: 1.7; }
      h1 { margin-bottom: 0.5rem; }
      ul { padding-left: 1.2rem; }
      a { color: #0d63a5; text-decoration: none; }
      a:hover { text-decoration: underline; }
      code { background: #f3f4f6; padding: 0.15rem 0.3rem; border-radius: 0.25rem; }
    </style>
  </head>
  <body>
    <h1>Local Development</h1>
    <p>Open each site from this landing page.</p>
    <ul>
      ${links}
    </ul>
    <p><code>sync:watch</code> is running in background.</p>
  </body>
</html>`;
}

async function shutdown(code = 0): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const proc of running) {
    try {
      proc.child.kill("SIGTERM");
    } catch {
      // ignore
    }
  }

  await Promise.allSettled(running.map((proc) => proc.child.status));
  Deno.exit(code);
}

Deno.addSignalListener("SIGINT", () => {
  void shutdown(0);
});
Deno.addSignalListener("SIGTERM", () => {
  void shutdown(0);
});

spawnProcess("sync:watch", ["deno", "run", "-A", "scripts/inotify-sync.ts", "--watch"]);
for (const site of sites) {
  spawnProcess(`dev:${site.name}`, ["pnpm", "--dir", site.dir, "dev", "--host", HOST, "--port", String(site.port)]);
}

Deno.serve({ hostname: HOST, port: LANDING_PORT }, () => {
  return new Response(landingHtml(), {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
});

console.log(`[dev-all] landing page: http://${HOST}:${LANDING_PORT}`);
console.log(`[dev-all] press Ctrl+C to stop all processes`);

await new Promise(() => {
  // keep alive
});

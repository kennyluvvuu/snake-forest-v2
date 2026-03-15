const REBUILD_SECRET = process.env.REBUILD_SECRET ?? "";
const FRONTEND_DIR = process.env.FRONTEND_DIR ?? "/app/frontend";
const PORT = Number(process.env.PORT ?? 3001);

function unauthorized(): Response {
  return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

async function runProcess(
  cmd: string[],
  label: string
): Promise<{ success: boolean; output: string }> {
  console.log(`[rebuilder] ${label}: ${cmd.join(" ")} in ${FRONTEND_DIR}`);

  const proc = Bun.spawn(cmd, {
    cwd: FRONTEND_DIR,
    stdout: "pipe",
    stderr: "pipe",
  });

  const [stdoutText, stderrText] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);

  const exitCode = await proc.exited;
  const output = [stdoutText, stderrText].filter(Boolean).join("\n");
  console.log(`[rebuilder] ${label} finished (exit ${exitCode}):\n${output}`);

  return { success: exitCode === 0, output };
}

async function runBuild(): Promise<{ success: boolean; output: string }> {
  // Step 1: install deps for the current platform (linux musl)
  const install = await runProcess(
    ["bun", "install", "--frozen-lockfile"],
    "bun install"
  );
  if (!install.success) return install;

  // Step 2: build
  return runProcess(["bun", "run", "build"], "bun build");
}

Bun.serve({
  port: PORT,
  async fetch(req: Request) {
    const url = new URL(req.url);

    // Health check
    if (req.method === "GET" && url.pathname === "/health") {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Rebuild endpoint
    if (req.method === "POST" && url.pathname === "/rebuild") {
      // Auth check
      const authHeader = req.headers.get("Authorization") ?? "";
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : "";
      if (!REBUILD_SECRET || token !== REBUILD_SECRET) {
        return unauthorized();
      }

      try {
        const { success, output } = await runBuild();
        if (success) {
          return new Response(JSON.stringify({ ok: true }), {
            headers: { "Content-Type": "application/json" },
          });
        } else {
          return new Response(
            JSON.stringify({ ok: false, error: output.slice(-2000) }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[rebuilder] Unexpected error:", message);
        return new Response(
          JSON.stringify({ ok: false, error: message }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`[rebuilder] Listening on port ${PORT}`);

import http from "http";
import { URL } from "url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const PORT = Number(process.env.PLAYGROUND_PORT || 4389);

async function createClient() {
  const transport = new StdioClientTransport({
    command: "node",
    args: ["dist/index.js"],
    env: process.env as Record<string, string>,
    cwd: process.cwd(),
  });

  const client = new Client({ name: "line-bot-ui", version: "0.1.0" });
  await client.connect(transport);
  return client;
}

function renderHTML() {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>LINE Bot MCP UI</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font-family: system-ui, sans-serif; margin: 20px; }
      header { margin-bottom: 12px; }
      label { display:block; margin: 8px 0 4px; font-weight: 600; }
      select, textarea, input { width: 100%; padding: 8px; box-sizing: border-box; }
      textarea { min-height: 140px; }
      .row { display: grid; grid-template-columns: 1fr; gap: 12px; }
      .actions { margin-top: 12px; }
      pre { background: #f6f6f6; padding: 8px; overflow: auto; }
      .small { color:#666; font-size: 12px; }
    </style>
  </head>
  <body>
    <header>
      <h2>LINE Bot MCP – Minimal UI</h2>
      <div class="small">Connected via stdio. Env must be set in your shell (or .env loaded by the server).</div>
    </header>

    <section class="row">
      <div>
        <label>Tool</label>
        <select id="tool"></select>
      </div>
      <div>
        <label>Arguments (JSON)</label>
        <textarea id="args" placeholder='{"prompt":"Hello"}'></textarea>
      </div>
      <div class="actions">
        <button id="run">Run</button>
        <button id="loadSample">Load sample for push_gemini_text</button>
      </div>
      <div>
        <label>Result</label>
        <pre id="out"></pre>
      </div>
    </section>

    <script>
      async function loadTools() {
        const res = await fetch('/api/tools');
        const data = await res.json();
        const sel = document.getElementById('tool');
        sel.innerHTML = '';
        for (const t of data.tools || []) {
          const opt = document.createElement('option');
          opt.value = t.name;
          opt.textContent = t.name;
          sel.appendChild(opt);
        }
      }

      async function callTool() {
        const name = (document.getElementById('tool')).value;
        let argsText = (document.getElementById('args')).value;
        let args = {};
        try { args = argsText ? JSON.parse(argsText) : {}; } catch (e) {
          document.getElementById('out').textContent = 'Invalid JSON: ' + e.message;
          return;
        }
        const res = await fetch('/api/call', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, args })
        });
        const data = await res.json();
        document.getElementById('out').textContent = JSON.stringify(data, null, 2);
      }

      function loadSample() {
        (document.getElementById('tool')).value = 'push_gemini_text';
        (document.getElementById('args')).value = JSON.stringify({ prompt: 'สรุปข่าววันนี้ 3 ข้อ ภาษาไทย' }, null, 2);
      }

      document.getElementById('run').addEventListener('click', callTool);
      document.getElementById('loadSample').addEventListener('click', loadSample);
      loadTools();
    </script>
  </body>
</html>`;
}

async function main() {
  const client = await createClient();

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url || '/', 'http://localhost');
      // Basic CORS for local Next.js or other frontends
      const setCORS = () => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
      };

      if (req.method === 'OPTIONS') {
        setCORS();
        res.writeHead(204);
        res.end();
        return;
      }
      if (req.method === 'GET' && url.pathname === '/') {
        const html = renderHTML();
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/tools') {
        const tools = await client.listTools();
        setCORS();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(tools));
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/call') {
        let body = '';
        req.on('data', chunk => (body += chunk));
        req.on('end', async () => {
          try {
            const { name, args } = JSON.parse(body || '{}');
            const result = await client.callTool({ name, arguments: args || {} });
            setCORS();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
          } catch (e: any) {
            setCORS();
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e?.message || String(e) }));
          }
        });
        return;
      }

      res.writeHead(404);
      res.end('Not Found');
    } catch (e: any) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal error: ' + (e?.message || String(e)));
    }
  });

  server.listen(PORT, () => {
    console.log(`MCP UI ready at http://localhost:${PORT}`);
  });
}

main().catch((e) => {
  console.error('Failed to start MCP UI:', e);
  process.exit(1);
});

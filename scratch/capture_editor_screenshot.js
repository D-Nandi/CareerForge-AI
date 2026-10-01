const http = require('http');
const fs = require('fs');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function capture() {
  const targets = await fetchJson('http://127.0.0.1:9222/json');
  const page = targets.find(t => t.type === 'page' && t.url.includes('preview.html'));
  if (!page) process.exit(1);

  const WebSocket = require('ws');
  const ws = new WebSocket(page.webSocketDebuggerUrl);

  let id = 1;
  const pending = new Map();

  ws.on('open', async () => {
    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const msgId = id++;
        pending.set(msgId, { resolve, reject });
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    ws.on('message', (data) => {
      const msg = JSON.parse(data);
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    });

    await send('Page.reload');
    await new Promise(r => setTimeout(r, 1200));

    // Switch to Editor mode and select name
    await send('Runtime.evaluate', {
      expression: `
        document.getElementById('btnModeEditor').click();
        const panel = document.getElementById('previewPanel');
        if (panel) panel.scrollTop = 0;
        const nameEl = document.getElementById('cl_name');
        if (nameEl) nameEl.click();
      `
    });
    await new Promise(r => setTimeout(r, 600));

    // Capture screenshot
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(shot.data, 'base64');
    fs.writeFileSync('scratch/editor_canvas_top.png', buffer);
    console.log('Saved screenshot to scratch/editor_canvas_top.png. Size:', buffer.length);
    ws.close();
  });
}

capture().catch(console.error);

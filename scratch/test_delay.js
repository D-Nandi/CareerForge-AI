const WebSocket = globalThis.WebSocket || require('ws');

async function test() {
  const targets = await (await fetch('http://127.0.0.1:9222/json')).json();
  const t = targets.find(t => t.type === 'page' && t.url.includes('3000'));
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  const send = (method, params = {}) => new Promise(res => {
    const id = Math.floor(Math.random() * 1000000);
    const h = (e) => {
      const d = JSON.parse(e.data);
      if (d.id === id) { ws.removeEventListener('message', h); res(d.result); }
    };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ id, method, params }));
  });

  const res = await send('Runtime.evaluate', {
    expression: `new Promise(resolve => {
      const t = document.querySelector(".theme-toggle");
      const b1 = getComputedStyle(document.body).backgroundColor;
      t.click();
      setTimeout(() => {
        const b2 = getComputedStyle(document.body).backgroundColor;
        const theme = document.documentElement.getAttribute("data-theme");
        resolve({ b1, b2, theme });
      }, 400);
    })`,
    awaitPromise: true,
    returnByValue: true
  });

  console.log(JSON.stringify(res.result?.value, null, 2));
  ws.close();
}
test();

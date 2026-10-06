const WebSocket = globalThis.WebSocket || require('ws');

async function test() {
  const targets = await (await fetch('http://127.0.0.1:9222/json')).json();
  const t = targets.find(t => t.type === 'page' && t.url.includes('3000'));
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  ws.send(JSON.stringify({
    id: 1,
    method: 'Runtime.evaluate',
    params: {
      expression: `(() => {
        const m = document.getElementById("mobileMenu");
        m.classList.add("open");
        const r = m.getBoundingClientRect();
        const nav = document.getElementById("navbar").getBoundingClientRect();
        const navStyle = getComputedStyle(document.getElementById("navbar"));
        return {
          navDisplay: navStyle.display,
          navFlexDir: navStyle.flexDirection,
          navH: navStyle.height,
          mRect: { x: r.x, y: r.y, w: r.width, h: r.height },
          navRect: { x: nav.x, y: nav.y, w: nav.width, h: nav.height }
        };
      })()`,
      returnByValue: true
    }
  }));

  ws.onmessage = e => {
    console.log(JSON.stringify(JSON.parse(e.data).result?.result?.value, null, 2));
    process.exit(0);
  };
}
test();

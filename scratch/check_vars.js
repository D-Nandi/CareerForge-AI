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
        document.documentElement.setAttribute("data-theme", "dark");
        return {
          htmlBgVar: getComputedStyle(document.documentElement).getPropertyValue("--bg").trim(),
          bodyBgVar: getComputedStyle(document.body).getPropertyValue("--bg").trim(),
          htmlTextVar: getComputedStyle(document.documentElement).getPropertyValue("--text").trim(),
          bodyTextVar: getComputedStyle(document.body).getPropertyValue("--text").trim(),
          bodyBgColor: getComputedStyle(document.body).backgroundColor,
          bodyTextColor: getComputedStyle(document.body).color
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

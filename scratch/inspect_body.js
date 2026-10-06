const WebSocket = globalThis.WebSocket || require('ws');

async function run() {
  const targetsRes = await fetch("http://127.0.0.1:9222/json");
  const targets = await targetsRes.json();
  const pageTarget = targets.find(t => t.type === 'page' && t.url.includes('3000'));
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  let id = 1;
  const callbacks = new Map();
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && callbacks.has(data.id)) {
      callbacks.get(data.id)(data);
      callbacks.delete(data.id);
    }
  };

  const send = (method, params = {}) => {
    return new Promise((resolve) => {
      const msgId = id++;
      callbacks.set(msgId, resolve);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  };

  await new Promise((res) => (ws.onopen = res));

  const res = await send("Runtime.evaluate", {
    expression: `(() => {
      const doc = document.documentElement;
      const b = document.body;
      const themeAttr = doc.getAttribute('data-theme');
      const bgVar = getComputedStyle(doc).getPropertyValue('--bg');
      const textVar = getComputedStyle(doc).getPropertyValue('--text');
      const bodyComputedBg = getComputedStyle(b).backgroundColor;
      const bodyComputedColor = getComputedStyle(b).color;
      
      const matched = [];
      for (const s of document.styleSheets) {
        try {
          for (const r of s.cssRules) {
            if (r.selectorText && b.matches(r.selectorText)) {
              matched.push({ sel: r.selectorText, css: r.cssText });
            }
          }
        } catch(e) {}
      }

      return {
        themeAttr,
        bgVar,
        textVar,
        bodyComputedBg,
        bodyComputedColor,
        matched
      };
    })()`,
    returnByValue: true
  });

  console.log(JSON.stringify(res.result?.result?.value, null, 2));
  ws.close();
}

run().catch(console.error);

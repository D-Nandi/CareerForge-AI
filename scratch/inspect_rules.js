const WebSocket = globalThis.WebSocket || require('ws');

async function run() {
  const wsUrl = "ws://127.0.0.1:9222/devtools/page/6B25433E061E5FF918437ABFC6CAEEA2";
  const ws = new WebSocket(wsUrl);

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

  await send("Runtime.enable");

  const evalResult = await send("Runtime.evaluate", {
    expression: `(() => {
      const m = document.getElementById('mobileMenu');
      const h = document.getElementById('hamburger');
      
      // Check viewport size
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Find all rules matching #mobileMenu
      const matched = [];
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.selectorText && m.matches(rule.selectorText)) {
              matched.push({ selector: rule.selectorText, cssText: rule.cssText });
            }
          }
        } catch(e) {}
      }

      return {
        vw, vh,
        matched,
        menuDisplay: getComputedStyle(m).display,
        menuRect: m.getBoundingClientRect(),
        hRect: h.getBoundingClientRect()
      };
    })()`,
    returnByValue: true
  });

  console.log(JSON.stringify(evalResult.result?.result?.value, null, 2));
  ws.close();
}

run().catch(console.error);

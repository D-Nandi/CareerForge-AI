const WebSocket = globalThis.WebSocket || require('ws');

async function run() {
  const targetsRes = await fetch("http://127.0.0.1:9222/json");
  const targets = await targetsRes.json();
  const pageTarget = targets.find(t => t.type === 'page' && t.url.includes('3000'));
  if (!pageTarget) {
    console.error("No 3000 page target found! Targets:", targets);
    return;
  }
  console.log("Found page target:", pageTarget.url, pageTarget.id);

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

  await send("Runtime.enable");
  await send("Page.enable");
  
  // Reload the page ignoring cache
  await send("Page.reload", { ignoreCache: true });
  await new Promise(r => setTimeout(r, 1000));

  const result = await send("Runtime.evaluate", {
    expression: `(() => {
      const m = document.getElementById('mobileMenu');
      const h = document.getElementById('hamburger');
      const t = document.getElementById('themeToggle');
      const sheets = Array.from(document.styleSheets).map(s => {
        try {
          return { href: s.href, count: s.cssRules.length };
        } catch(e) {
          return { href: s.href, err: e.message };
        }
      });
      return {
        sheets,
        mStyle: m ? { display: getComputedStyle(m).display, pos: getComputedStyle(m).position } : null,
        hStyle: h ? { display: getComputedStyle(h).display } : null,
        tStyle: t ? { display: getComputedStyle(t).display } : null,
        docTheme: document.documentElement.getAttribute('data-theme')
      };
    })()`,
    returnByValue: true
  });

  console.log("Result after hard reload:", JSON.stringify(result.result?.result?.value, null, 2));

  // Now click hamburger
  const hamClick = await send("Runtime.evaluate", {
    expression: `(() => {
      const h = document.getElementById('hamburger');
      const m = document.getElementById('mobileMenu');
      if (h) h.click();
      return {
        hClass: h ? h.className : null,
        mClass: m ? m.className : null,
        mDisplay: m ? getComputedStyle(m).display : null,
        mRect: m ? m.getBoundingClientRect() : null
      };
    })()`,
    returnByValue: true
  });
  console.log("Hamburger click result:", JSON.stringify(hamClick.result?.result?.value, null, 2));

  // Now click theme toggle
  const themeClick = await send("Runtime.evaluate", {
    expression: `(() => {
      const t = document.getElementById('themeToggle');
      if (t) t.click();
      return {
        themeAfter: document.documentElement.getAttribute('data-theme'),
        bodyBg: getComputedStyle(document.body).backgroundColor,
        bodyColor: getComputedStyle(document.body).color
      };
    })()`,
    returnByValue: true
  });
  console.log("Theme click result:", JSON.stringify(themeClick.result?.result?.value, null, 2));

  ws.close();
}

run().catch(console.error);

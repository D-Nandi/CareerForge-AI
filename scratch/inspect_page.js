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
  console.log("Connected to CDP");

  // Enable Console and Runtime
  await send("Runtime.enable");
  await send("Console.enable");

  // Evaluate state
  const evalResult = await send("Runtime.evaluate", {
    expression: `(() => {
      const docTheme = document.documentElement.getAttribute('data-theme');
      const themeToggle = document.getElementById('themeToggle');
      const hamburger = document.getElementById('hamburger');
      const mobileMenu = document.getElementById('mobileMenu');
      const styleSheets = Array.from(document.styleSheets).map(s => {
        try { return { href: s.href, rulesCount: s.cssRules.length }; }
        catch(e) { return { href: s.href, error: e.message }; }
      });
      return {
        docTheme,
        hasThemeToggle: !!themeToggle,
        hasHamburger: !!hamburger,
        hasMobileMenu: !!mobileMenu,
        mobileMenuDisplay: mobileMenu ? getComputedStyle(mobileMenu).display : null,
        mobileMenuPos: mobileMenu ? getComputedStyle(mobileMenu).position : null,
        hamburgerDisplay: hamburger ? getComputedStyle(hamburger).display : null,
        styleSheets
      };
    })()`,
    returnByValue: true
  });

  console.log("Evaluation Result:", JSON.stringify(evalResult.result?.result?.value, null, 2));

  // Now simulate click on themeToggle
  const clickTheme = await send("Runtime.evaluate", {
    expression: `(() => {
      const btn = document.getElementById('themeToggle');
      if (btn) btn.click();
      return {
        themeAfterClick: document.documentElement.getAttribute('data-theme'),
        boundTheme: btn ? btn.dataset.boundTheme : null
      };
    })()`,
    returnByValue: true
  });
  console.log("After clicking theme toggle:", clickTheme.result?.result?.value);

  // Now simulate click on hamburger
  const clickHamburger = await send("Runtime.evaluate", {
    expression: `(() => {
      const h = document.getElementById('hamburger');
      if (h) h.click();
      const m = document.getElementById('mobileMenu');
      return {
        hamburgerClass: h ? h.className : null,
        mobileMenuClass: m ? m.className : null,
        mobileMenuDisplay: m ? getComputedStyle(m).display : null,
        mobileMenuBoundingRect: m ? m.getBoundingClientRect() : null
      };
    })()`,
    returnByValue: true
  });
  console.log("After clicking hamburger:", clickHamburger.result?.result?.value);

  ws.close();
}

run().catch(console.error);

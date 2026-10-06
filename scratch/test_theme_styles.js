const WebSocket = globalThis.WebSocket || require('ws');

async function test() {
  const targets = await (await fetch('http://127.0.0.1:9222/json')).json();
  const t = targets.find(t => t.type === 'page' && t.url.includes('3000'));
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  const send = (method, params = {}) => new Promise(res => {
    const id = Math.floor(Math.random() * 100000);
    const handler = (e) => {
      const d = JSON.parse(e.data);
      if (d.id === id) {
        ws.removeEventListener('message', handler);
        res(d.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });

  const getSnapshot = async (theme) => {
    return await send("Runtime.evaluate", {
      expression: `(() => {
        if ('${theme}' === 'dark') {
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.documentElement.removeAttribute('data-theme');
        }
        const sections = Array.from(document.querySelectorAll('nav, section, footer, .feature-card, .step, .hero-heading, .pricing-card, body')).map(el => {
          const cs = getComputedStyle(el);
          return {
            tag: el.tagName,
            cls: el.className,
            bg: cs.backgroundColor,
            color: cs.color,
            border: cs.borderColor
          };
        });
        return {
          theme: document.documentElement.getAttribute('data-theme'),
          sections
        };
      })()`,
      returnByValue: true
    });
  };

  const light = await getSnapshot('light');
  const dark = await getSnapshot('dark');

  console.log("Light theme sample:", JSON.stringify(light.result?.value?.sections.slice(0, 8), null, 2));
  console.log("Dark theme sample:", JSON.stringify(dark.result?.value?.sections.slice(0, 8), null, 2));

  // Check what icon is visible
  const iconCheck = await send("Runtime.evaluate", {
    expression: `(() => {
      const sun = document.querySelector('.theme-toggle .icon-sun');
      const moon = document.querySelector('.theme-toggle .icon-moon');
      return {
        sunDisplay: getComputedStyle(sun).display,
        sunOpacity: getComputedStyle(sun).opacity,
        moonDisplay: getComputedStyle(moon).display,
        moonOpacity: getComputedStyle(moon).opacity
      };
    })()`,
    returnByValue: true
  });
  console.log("Icons in dark mode:", iconCheck.result?.value);

  ws.close();
}
test();

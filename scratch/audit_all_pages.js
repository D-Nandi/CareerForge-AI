const WebSocket = globalThis.WebSocket || require('ws');

const pages = [
  'index.html',
  'pricing.html',
  'ats-score-checker.html',
  'career-roadmap.html',
  'interview-prep.html',
  'salary-benchmark.html',
  'templates.html',
  'preview.html',
  'form-index.html',
  'dashboard.html'
];

async function run() {
  const targetsRes = await fetch("http://127.0.0.1:9222/json");
  const targets = await targetsRes.json();
  const pageTarget = targets.find(t => t.type === 'page' && t.url.includes('3000'));
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  const send = (method, params = {}) => new Promise(res => {
    const id = Math.floor(Math.random() * 1000000);
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

  await send("Page.enable");
  await send("Runtime.enable");

  const results = [];

  for (const p of pages) {
    await send("Page.navigate", { url: `http://localhost:3000/${p}` });
    await new Promise(r => setTimeout(r, 1200));

    const check = await send("Runtime.evaluate", {
      expression: `(() => {
        const toggle = document.querySelector('.theme-toggle') || document.getElementById('themeToggle');
        const initialTheme = document.documentElement.getAttribute('data-theme');
        let worked = false;
        let afterTheme = initialTheme;
        if (toggle) {
          toggle.click();
          afterTheme = document.documentElement.getAttribute('data-theme');
          worked = (afterTheme !== initialTheme);
        }
        const hamburger = document.querySelector('.hamburger') || document.getElementById('hamburger');
        const mobileMenu = document.querySelector('.mobile-menu') || document.getElementById('mobileMenu');
        
        return {
          page: '${p}',
          hasToggle: !!toggle,
          initialTheme,
          afterTheme,
          toggleWorked: worked,
          hasHamburger: !!hamburger,
          hamburgerVisible: hamburger ? getComputedStyle(hamburger).display : 'none',
          hasMobileMenu: !!mobileMenu
        };
      })()`,
      returnByValue: true
    });

    results.push(check.result?.value);
  }

  console.log(JSON.stringify(results, null, 2));
  ws.close();
}

run().catch(console.error);

const WebSocket = globalThis.WebSocket || require('ws');

const pages = [
  'index.html',
  'form-index.html',
  'preview.html',
  'ats-score-checker.html',
  'career-roadmap.html',
  'interview-prep.html',
  'salary-benchmark.html',
  'pricing.html',
  'cover-letter-generator.html',
  'templates.html',
  'dashboard.html',
  'blog.html',
  'blog-post.html',
  'resume-examples.html',
  'resume-example.html',
  'login.html',
  'signup.html',
  'growth-hub.html',
  '404.html'
];

async function run() {
  const targetsRes = await fetch("http://127.0.0.1:9222/json");
  const targets = await targetsRes.json();
  const pageTarget = targets.find(t => t.type === 'page' && t.url.includes('3000'));
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  const send = (method, params = {}) => new Promise(res => {
    const id = Math.floor(Math.random() * 10000000);
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
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    mobile: true
  });

  const auditReport = [];

  for (const page of pages) {
    await send("Page.navigate", { url: `http://localhost:3000/${page}` });
    await new Promise(r => setTimeout(r, 1200));

    const analysis = await send("Runtime.evaluate", {
      expression: `(() => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const docWidth = document.documentElement.scrollWidth;
        const bodyWidth = document.body.scrollWidth;
        const hasHorizontalOverflow = docWidth > vw || bodyWidth > vw;

        // Find elements overflowing the viewport horizontally
        const overflowingElements = [];
        const all = document.querySelectorAll('*');
        for (const el of all) {
          const r = el.getBoundingClientRect();
          if (r.right > vw + 2) {
            overflowingElements.push({
              tag: el.tagName,
              cls: el.className,
              id: el.id,
              right: Math.round(r.right),
              width: Math.round(r.width),
              overflowPx: Math.round(r.right - vw)
            });
          }
        }

        // Header and navigation audit
        const header = document.querySelector('header, nav.navbar, .dash-header, .form-header, .tool-header');
        const hamburger = document.querySelector('.hamburger, #hamburger, [aria-label*="menu" i]');
        const mobileMenu = document.querySelector('.mobile-menu, #mobileMenu, .mobile-nav');
        const desktopNavLinks = document.querySelectorAll('.nav-links li, .header-actions a, .breadcrumbs');
        const visibleDesktopLinks = Array.from(desktopNavLinks).filter(el => {
          const cs = getComputedStyle(el);
          return cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0';
        }).map(el => el.textContent.trim().substring(0, 30));

        let hamburgerClickResult = null;
        if (hamburger) {
          const initialDisplay = getComputedStyle(hamburger).display;
          hamburger.click();
          const menuAfter = mobileMenu ? {
            className: mobileMenu.className,
            display: getComputedStyle(mobileMenu).display,
            rect: mobileMenu.getBoundingClientRect()
          } : null;
          hamburgerClickResult = {
            hamburgerDisplay: initialDisplay,
            menuAfterClick: menuAfter
          };
          // reset
          hamburger.click();
        }

        // Theme toggle audit
        const themeToggle = document.querySelector('.theme-toggle, #themeToggle');
        let themeToggleResult = null;
        if (themeToggle) {
          const initTheme = document.documentElement.getAttribute('data-theme');
          const initBg = getComputedStyle(document.body).backgroundColor;
          const initColor = getComputedStyle(document.body).color;
          const sunIcon = themeToggle.querySelector('.icon-sun');
          const moonIcon = themeToggle.querySelector('.icon-moon');
          const sunVis = sunIcon ? { display: getComputedStyle(sunIcon).display, opacity: getComputedStyle(sunIcon).opacity } : null;
          const moonVis = moonIcon ? { display: getComputedStyle(moonIcon).display, opacity: getComputedStyle(moonIcon).opacity } : null;

          themeToggle.click();
          const afterTheme = document.documentElement.getAttribute('data-theme');
          const afterBg = getComputedStyle(document.body).backgroundColor;
          const afterColor = getComputedStyle(document.body).color;
          const sunVisAfter = sunIcon ? { display: getComputedStyle(sunIcon).display, opacity: getComputedStyle(sunIcon).opacity } : null;
          const moonVisAfter = moonIcon ? { display: getComputedStyle(moonIcon).display, opacity: getComputedStyle(moonIcon).opacity } : null;

          themeToggleResult = {
            present: true,
            display: getComputedStyle(themeToggle).display,
            initTheme,
            afterTheme,
            themeChanged: initTheme !== afterTheme,
            initBg,
            afterBg,
            bgChanged: initBg !== afterBg,
            initColor,
            afterColor,
            sunVis,
            sunVisAfter,
            moonVis,
            moonVisAfter
          };
          // toggle back
          themeToggle.click();
        } else {
          themeToggleResult = { present: false };
        }

        return {
          page: '${page}',
          viewport: { vw, vh },
          hasHorizontalOverflow,
          overflowDelta: Math.max(0, docWidth - vw, bodyWidth - vw),
          topOverflowingSample: overflowingElements.slice(0, 5),
          headerPresent: !!header,
          headerType: header ? header.className : null,
          hasHamburger: !!hamburger,
          hamburgerClickResult,
          hasMobileMenu: !!mobileMenu,
          visibleDesktopLinksCount: visibleDesktopLinks.length,
          visibleDesktopLinksSample: visibleDesktopLinks.slice(0, 6),
          themeToggleResult
        };
      })()`,
      returnByValue: true
    });

    auditReport.push(analysis.result?.value);
  }

  console.log(JSON.stringify(auditReport, null, 2));
  ws.close();
}

run().catch(console.error);

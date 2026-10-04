const http = require('http');

// Helper to make CDP requests to Chrome
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function run() {
  console.log('Connecting to browser CDP...');
  const targets = await fetchJson('http://127.0.0.1:9222/json');
  const page = targets.find(t => t.type === 'page' && t.url.includes('preview.html'));
  if (!page) {
    console.error('No preview.html page found in Chrome CDP!');
    console.log('Available targets:', targets.map(t => t.url));
    process.exit(1);
  }

  const wsUrl = page.webSocketDebuggerUrl;
  const WebSocket = require('ws');
  const ws = new WebSocket(wsUrl);

  let id = 1;
  const pending = new Map();

  ws.on('open', async () => {
    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const msgId = id++;
        pending.set(msgId, { resolve, reject });
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    ws.on('message', (data) => {
      const msg = JSON.parse(data);
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    });

    console.log('Connected to CDP! Reloading preview page...');
    await send('Page.reload');
    await new Promise(r => setTimeout(r, 1500));

    async function evalCode(expression) {
      const res = await send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true
      });
      if (res.exceptionDetails) {
        throw new Error(res.exceptionDetails.text || 'Eval error');
      }
      return res.result ? res.result.value : null;
    }

    // TEST 1: Check initial state (Preview Mode)
    const initialMode = await evalCode(`({
      modePreviewActive: document.getElementById('btnModePreview')?.classList.contains('active'),
      modeEditorActive: document.getElementById('btnModeEditor')?.classList.contains('active'),
      editorHeaderDisplay: window.getComputedStyle(document.getElementById('editorCanvasHeader')).display,
      splitScreenHasClass: document.querySelector('.split-screen')?.classList.contains('mode-editor-active')
    })`);
    console.log('--- TEST 1: Initial Preview Mode State ---');
    console.log(initialMode);

    // TEST 2: Switch to Editor Canvas Mode
    console.log('--- TEST 2: Switching to Editor Canvas Mode ---');
    await evalCode(`document.getElementById('btnModeEditor').click()`);
    await new Promise(r => setTimeout(r, 200));

    const editorState = await evalCode(`({
      btnEditorActive: document.getElementById('btnModeEditor').classList.contains('active'),
      btnPreviewActive: document.getElementById('btnModePreview').classList.contains('active'),
      editorHeaderDisplay: window.getComputedStyle(document.getElementById('editorCanvasHeader')).display,
      splitScreenHasClass: document.querySelector('.split-screen').classList.contains('mode-editor-active'),
      targetBadgeText: document.getElementById('echTargetText').innerText
    })`);
    console.log(editorState);

    // TEST 3: Click an element on the resume canvas (e.g. .cl-name)
    console.log('--- TEST 3: Element Selection (Click Candidate Name) ---');
    const selResult = await evalCode(`(() => {
      const nameEl = document.getElementById('cl_name');
      nameEl.click();
      return {
        hasSelectedClass: nameEl.classList.contains('editor-element-selected'),
        badgeText: document.getElementById('echTargetText').innerText
      };
    })()`);
    console.log(selResult);

    // TEST 4: Apply Font Family & Color to selected element from Editor Header
    console.log('--- TEST 4: Formatting Selected Element from Editor Header ---');
    const formatResult = await evalCode(`(() => {
      const nameEl = document.getElementById('cl_name');
      // Format with Playfair Display
      const ffSelect = document.getElementById('echFontFamily');
      ffSelect.value = "'Playfair Display', serif";
      ffSelect.dispatchEvent(new Event('change'));

      // Format with Emerald Color
      const emeraldSwatch = document.querySelector('.ech-swatch[data-color="#059669"]');
      emeraldSwatch.click();

      // Format font size 28px
      const fsSelect = document.getElementById('echFontSize');
      fsSelect.value = "28px";
      fsSelect.dispatchEvent(new Event('change'));

      return {
        computedFont: nameEl.style.fontFamily,
        computedColor: nameEl.style.color,
        computedSize: nameEl.style.fontSize
      };
    })()`);
    console.log(formatResult);

    // TEST 5: Add a new project from the dedicated editor header
    console.log('--- TEST 5: Add New Project via Header Action ---');
    const addProjResult = await evalCode(`(() => {
      const countBefore = (state.projects || []).length;
      document.getElementById('echAddProjectBtn').click();
      return {
        countBefore,
        countAfter: (state.projects || []).length
      };
    })()`);
    console.log(addProjResult);

    // TEST 6: Switch back to Preview Mode
    console.log('--- TEST 6: Switch Back to Clean Preview Mode ---');
    await evalCode(`document.getElementById('btnModePreview').click()`);
    await new Promise(r => setTimeout(r, 200));

    const finalPreviewState = await evalCode(`({
      btnPreviewActive: document.getElementById('btnModePreview').classList.contains('active'),
      btnEditorActive: document.getElementById('btnModeEditor').classList.contains('active'),
      editorHeaderDisplay: window.getComputedStyle(document.getElementById('editorCanvasHeader')).display,
      splitScreenHasClass: document.querySelector('.split-screen').classList.contains('mode-editor-active')
    })`);
    console.log(finalPreviewState);

    const success = editorState.editorHeaderDisplay === 'flex' &&
                    selResult.hasSelectedClass &&
                    formatResult.computedColor === 'rgb(5, 150, 105)' &&
                    addProjResult.countAfter === addProjResult.countBefore + 1 &&
                    finalPreviewState.editorHeaderDisplay === 'none';

    console.log('\nALL TESTS PASSED:', success);
    ws.close();
    process.exit(success ? 0 : 1);
  });
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});

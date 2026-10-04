const http = require('http');

async function run() {
  const targetRes = await fetch('http://127.0.0.1:9222/json/new?http://localhost:5000/preview.html', { method: 'PUT' });
  const target = await targetRes.json();

  const ws = new WebSocket(target.webSocketDebuggerUrl);

  let id = 1;
  const pending = new Map();
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      pending.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const p = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) p.reject(msg.error);
      else p.resolve(msg.result);
    }
  };

  await new Promise(r => ws.onopen = r);

  await send('Runtime.enable');
  await send('Page.enable');
  await send('DOM.enable');

  // Clear corrupted localStorage and reload
  await send('Runtime.evaluate', {
    expression: `
      localStorage.removeItem('resumatic_state');
      location.reload();
    `
  });

  // Wait for reload
  await new Promise(r => setTimeout(r, 1500));

  const evalResult = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const results = {};
        results.candidateName = document.getElementById('cl_name')?.innerText;
        results.candidateTitle = document.getElementById('cl_title')?.innerText;
        results.expCount = state.experience?.length;
        results.allEditables = Array.from(document.querySelectorAll('[data-canva-editable="true"]')).length;

        // Test selecting a phrase in the first job description
        const descEl = document.querySelector('.cl-entry-desc');
        results.descFound = !!descEl;
        if (descEl) {
          results.initialDesc = descEl.innerText.substring(0, 50);

          // Select first 25 characters
          const range = document.createRange();
          range.setStart(descEl.firstChild, 0);
          range.setEnd(descEl.firstChild, 25);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          document.dispatchEvent(new Event('selectionchange'));

          results.selectedText = sel.toString();
          const tb = document.getElementById('textSelectionToolbar');
          results.tbVisible = tb && tb.classList.contains('visible');
          results.tbTop = tb?.style.top;
          results.tbLeft = tb?.style.left;

          // Click emerald green swatch (#059669)
          const greenSwatch = document.querySelector('.tst-color-swatch[data-color="#059669"]');
          if (greenSwatch) greenSwatch.click();

          // Change font size to 16px
          const sizeSelect = document.getElementById('tstFontSize');
          if (sizeSelect) {
            sizeSelect.value = '16px';
            sizeSelect.dispatchEvent(new Event('change'));
          }

          results.descHtmlAfterStyle = descEl.innerHTML.substring(0, 150);

          // Test alignment
          const centerBtn = document.getElementById('tstAlignCenter');
          if (centerBtn) centerBtn.click();
          results.descTextAlign = descEl.style.textAlign;
        }

        return results;
      })()
    `,
    returnByValue: true
  });

  console.log('\n--- VERIFICATION WITH DEFAULT SAMPLE RESUME & EDITOR ---');
  console.log(JSON.stringify(evalResult.result.value, null, 2));

  await fetch(`http://127.0.0.1:9222/json/close/${target.id}`);
  ws.close();
}

run().catch(console.error);

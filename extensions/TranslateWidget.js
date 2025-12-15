/* TrixTech s.r.o. @2025 */

(function () {
  const deepQueryAll = (root, selector) => {
    const found = [];
    const stack = [root];
    while (stack.length) {
      const node = stack.pop();
      if (node instanceof HTMLIFrameElement && node.contentDocument) stack.push(node.contentDocument);
      if (node.querySelectorAll) found.push(...node.querySelectorAll(selector));
      if (node.shadowRoot) stack.push(node.shadowRoot);
      node.childNodes?.forEach(child => {
        if (child.nodeType === 1) stack.push(child);
      });
    }
    return found;
  };

  const translateButtons = () => {
    const sendSelector = [
      'button[title="Send"]',
      'button[aria-label="Send"]',
      'button[title*="Send"]',
      'button[aria-label*="Send"]',
      'button[title="Odeslat"]',
      'button[aria-label="Odeslat"]',
      'button[title*="Odeslat"]',
      'button[aria-label*="Odeslat"]'
    ].join(', ');
    const sendButtons = deepQueryAll(document, sendSelector);
    sendButtons.forEach(btn => {
      btn.title = 'Odeslat';
      btn.setAttribute('aria-label', 'Odeslat');
      if (btn.textContent?.trim()) btn.textContent = 'Odeslat';
      btn.setAttribute('data-balloon', 'Odeslat');
      btn.setAttribute('aria-live', 'polite');
    });

    const launcherSelector = [
      'button.vfrc-launcher',
      'button[title*="Open chat"]',
      'button[aria-label*="Open chat"]',
      'button[title*="chat agent"]',
      'button[aria-label*="chat agent"]',
      'button[title*="Otevřít chat"]',
      'button[aria-label*="Otevřít chat"]'
    ].join(', ');
    const launcherButtons = deepQueryAll(document, launcherSelector);
    launcherButtons.forEach(btn => {
      const label = 'Otevřít chat';
      btn.title = label;
      btn.setAttribute('aria-label', label);
      if (btn.textContent?.trim()) btn.textContent = label;
      btn.setAttribute('data-balloon', label);
      btn.setAttribute('aria-live', 'polite');
      btn.querySelectorAll('img, svg').forEach(icon => {
        icon.setAttribute('alt', label);
        icon.setAttribute('aria-label', label);
        icon.setAttribute('title', label);
      });
    });
  };

  const run = () => {
    translateButtons();
    let elapsed = 0;
    const timer = setInterval(() => {
      translateButtons();
      elapsed += 300;
      if (elapsed >= 10000) clearInterval(timer);
    }, 300);

    const observer = new MutationObserver(() => translateButtons());
    observer.observe(document, { childList: true, subtree: true, characterData: true, attributes: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
})();
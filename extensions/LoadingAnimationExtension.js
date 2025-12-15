/* TrixTech s.r.o. @2025 */

window.LoadingAnimationExtension = {
  name: 'LoadingAnimation',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_loadingAnimation' || trace.payload?.name === 'ext_loadingAnimation',
  render: ({ trace, element }) => {
    const payload = trace.payload || {};
    const phase = payload.phase || 'output';
    const incomingLang = (payload.lang || 'cs').toLowerCase().trim();
  
    let lang;
    if (incomingLang.includes('cs') || incomingLang.includes('czech')) lang = 'cs';
    else lang = 'cs';
  
    const type = (payload.type || 'SMT').toUpperCase();

    const messageSequences = {
      cs: {
        analysis: {
          DEFAULT: ['Chvilku strpení.'],
          SMT: ['Analyzuji váš dotaz.', 'Ještě moment, ověřuji detaily.'],
          SWEARS: ['Zpracovávám dotaz.', 'Chvilku prosím.'],
          OTHER: ['Procházím zadání.', 'Ještě okamžik.'],
          KB: ['Hledám souvislosti.', 'Zpracovávám informace.', 'Už to bude.'],
          KB_WS: ['Prohledávám databázi.', 'Ověřuji informace.', 'Chvilku prosím.']
        },
        rewrite: ['Přeformuluji odpověď, aby byla jasnější.'],
        output: {
          SMT: ['Píšu pro vás odpověď.'],
          KB_WS: [
            'Procházím databázi.',
            'Sbírám důležité informace.',
            'Formuluji finální odpověď.'
          ],
          OTHER: ['Kontroluji správnost odpovědi.'],
          SWEARS: ['Kontroluji jazyk a obsah.'],
          KB: [
            'Shromažďuji podklady.',
            'Zpracovávám odpověď.',
            'Formuluji výsledek.'
          ]
        },
        all: {
          KB: [
            'Procházím databázi.',
            'Ověřuji fakta.',
            'Připravuji odpověď.'
          ],
          KB_WS: [
            'Prohledávám.',
            'Analyzuji dostupné zdroje.',
            'Ověřuji kontext.',
            'Sepisuji odpověď.'
          ]
        }
      }
    };

    try {
      const customDurationSeconds = payload.duration;

      let messages;
      if (phase === 'all' && (type === 'KB' || type === 'KB_WS')) {
        messages = messageSequences[lang]?.all?.[type];
      } else if (phase === 'output') {
        messages = messageSequences[lang]?.output?.[type];
      } else if (phase === 'analysis') {
        messages = messageSequences[lang]?.[phase]?.[type] || messageSequences[lang]?.[phase]?.DEFAULT;
      } else {
        messages = messageSequences[lang]?.[phase];
      }

      if (!messages || messages.length === 0) return;

      let totalDuration;
      if (typeof customDurationSeconds === 'number' && customDurationSeconds > 0) {
        totalDuration = customDurationSeconds * 1000;
      } else {
        if (phase === 'analysis') {
          totalDuration = (type === 'KB' || type === 'KB_WS') ? 12000 : 4000;
        } else if (phase === 'output') {
          totalDuration = (type === 'KB_WS') ? 23000
                         : (type === 'KB')   ? 12000
                         : 4000;
        } else {
          totalDuration = 3000;
        }
      }

      const messageInterval = totalDuration / messages.length;

      const container = document.createElement('div');
      container.className = 'vfrc-message vfrc-message--extension LoadingAnimation';

      const style = document.createElement('style');
      style.textContent = `
        .vfrc-message.vfrc-message--extension.LoadingAnimation {
          opacity: 1;
          transition: opacity 0.3s ease-out;
          width: 100%;
          display: block;
        }

        .vfrc-message.vfrc-message--extension.LoadingAnimation.hide {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
        }

        .loading-box {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          margin: 0;
          width: 100%;
          box-sizing: border-box;
          background-color: #F9FAFB;
          border-radius: 12px;
          border: 1px solid #E5E7EB;
        }

        .loading-text {
          color: rgba(26, 30, 35, 0.7);
          font-size: 12px;
          line-height: 1.3;
          font-family: var(--_1bof89na);
          position: relative;
          display: flex;
          flex-direction: column;
          max-width: 100%;
          opacity: 1;
          transform: translateY(0);
          transition: opacity 0.3s ease-out, transform 0.3s ease-out;
          flex: 1;
          min-width: 0;
          font-style: italic;
        }

        .loading-text.changing {
          opacity: 0;
          transform: translateY(-5px);
        }

        .loading-text.entering {
          opacity: 0;
          transform: translateY(5px);
        }

        @keyframes loading-spinner-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .rotating-point-spinner {
          position: relative;
          width: 16px;
          height: 16px;
          animation: loading-spinner-spin 0.9s linear infinite;
          flex-shrink: 0;
          transition: opacity 0.3s ease-out, width 0.3s ease-out;
          opacity: 1;
        }

        .rotating-point-spinner::before {
          content: "";
          box-sizing: border-box;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 2px solid rgba(0, 0, 0, 0.12);
        }

        .rotating-point-spinner::after {
          content: "";
          box-sizing: border-box;
          position: absolute;
          width: 5px;
          height: 5px;
          background-color: var(--spinner-point-colour, #696969);
          border-radius: 50%;
          top: -1.5px; 
          left: calc(50% - 2.5px);
        }

        .spinner-point-colour {
          color: #006FB9;
        }

        .rotating-point-spinner.hide {
          opacity: 0;
          visibility: hidden;
          width: 0 !important;
          display: none;
          /* margin-right: 0 !important;
        }
      `;
      container.appendChild(style);

      const loadingBox = document.createElement('div');
      loadingBox.className = 'loading-box';

      const spinnerAnimationContainer = document.createElement('div');
      spinnerAnimationContainer.className = 'rotating-point-spinner';

      spinnerAnimationContainer.style.setProperty('--spinner-point-colour', '#00aced');

      loadingBox.appendChild(spinnerAnimationContainer);

      const textElement = document.createElement('span');
      textElement.className = 'loading-text';
      loadingBox.appendChild(textElement);

      container.appendChild(loadingBox);

      let currentIndex = 0;
      const updateText = (newText) => {
        const currentTextElement = loadingBox.querySelector('.loading-text');
        if (!currentTextElement) return;
        currentTextElement.classList.add('changing');
        setTimeout(() => {
          currentTextElement.textContent = newText;
          currentTextElement.classList.remove('changing');
          currentTextElement.classList.add('entering');
          requestAnimationFrame(() => {
            currentTextElement.classList.remove('entering');
          });
        }, 300);
      };
      updateText(messages[currentIndex]);

      let intervalId = null;
      if (messages.length > 1) {
        intervalId = setInterval(() => {
          if (currentIndex < messages.length - 1) {
            currentIndex++;
            updateText(messages[currentIndex]);
          } else {
            if (intervalId) {
              clearInterval(intervalId);
              intervalId = null;
            }
          }
        }, messageInterval);
      }

      const animationTimeoutId = setTimeout(() => {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        if (spinnerAnimationContainer) {
          spinnerAnimationContainer.classList.add('hide');
        }
      }, totalDuration);

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.removedNodes.forEach((node) => {
            if (node === container || node.contains(container)) {
              if (intervalId) clearInterval(intervalId);
              clearTimeout(animationTimeoutId);
              observer.disconnect();
            }
          });
        });
      });
      observer.observe(element.parentElement || document.body, {
        childList: true,
        subtree: true
      });

      const responseObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1 && node.classList.contains('vfrc-message--ai')) {
              if (intervalId) clearInterval(intervalId);
              clearTimeout(animationTimeoutId);
              spinnerAnimationContainer.classList.add('hide');
              responseObserver.disconnect();
            }
          });
        });
      });
      responseObserver.observe(document.body, {
        childList: true,
        subtree: true
      });

      if (element) {
        element.appendChild(container);
        void container.offsetHeight;
      }
    } catch (error) {
      console.error('LoadingAnimationExtension error:', error);
    }
  }
};

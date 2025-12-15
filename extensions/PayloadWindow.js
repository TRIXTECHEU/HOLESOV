/* TrixTech s.r.o. @2025 */

(function (window, document) {

  var UX = {
    dwellMs: 30000,
    longStayMs: 60000,
    minScrollPct: 30,
    showDelayMs: 400,
    bootWindowMs: 3000,
    closeCooldownMs: 10000,
    enforceEveryMs: 1000,
    autoHideMs: 90000,
    reShowDelayMs: 8000,
    sessionTimeoutMs: 300000,
    autoReShowMs: 180000,
    chatInteractDelayMs: 800,
    vfReadyDelayMs: 3000
  };

  var SS = {
    SUPPRESS: 'magichill_payload_suppressed_session',
    PAYLOAD_DISMISSED: 'magichill_payload_dismissed_by_user',
    CHAT_OPEN: 'magichill_chat_is_open',
    USER_OPENED_CHAT: 'magichill_user_opened_chat',
    CHAT_CLOSED_TIME: 'magichill_chat_closed_time',
    SHOW_COUNT: 'magichill_show_count',
    LAST_SHOW_TIME: 'magichill_last_show_time',
    SESSION_START: 'magichill_session_start'
  };

  var LS = {
    LAST_CLOSE: 'magichill_last_close_at',
    TOTAL_VISITS: 'magichill_total_visits',
    LAST_VISIT: 'magichill_last_visit'
  };

  var MSG = {
    default: {
      morning: 'Dobré ráno, jsem asistent školy. S čím vám mohu pomoci?',
      day: 'Dobrý den, jsem asistent školy. S čím vám mohu pomoci?',
      night: 'Dobrý večer, jsem asistent školy. S čím vám mohu pomoci?'
    },
    deep: {
      morning: 'Hledáte něco konkrétního? Pomohu vám to rychle najít.',
      day: 'Hledáte něco konkrétního? Pomohu vám to rychle najít.',
      night: 'Hledáte něco konkrétního? Pomohu vám to rychle najít.'
    },
    linger: {
      morning: 'Pořád jsem tu pro vás, pokud potřebujete s něčím poradit.',
      day: 'Pořád jsem tu pro vás, pokud potřebujete s něčím poradit.',
      night: 'Pořád jsem tu pro vás, pokud potřebujete s něčím poradit.'
    },
    return_short: {
      morning: 'Máte ještě nějaký další dotaz? Rád vám s ním pomohu.',
      day: 'Máte ještě nějaký další dotaz? Rád vám s ním pomohu.',
      night: 'Máte ještě nějaký další dotaz? Rád vám s ním pomohu.'
    },
    return_medium: {
      morning: 'Jste zpět? Klidně mi kdykoli můžete položit další dotazy!',
      day: 'Jste zpět? Klidně mi kdykoli můžete položit další dotazy!',
      night: 'Jste zpět? Klidně mi kdykoli můžete položit další dotazy!'
    },
    return_long: {
      morning: 'Vítejte zpět, potřebujete ještě něco zjistit k ZŠ nebo MŠ?',
      day: 'Vítejte zpět, potřebujete ještě něco zjistit k ZŠ nebo MŠ?',
      night: 'Vítejte zpět, potřebujete ještě něco zjistit k ZŠ nebo MŠ?'
    },
    session_expired: {
      morning: 'Dobré ráno, můžeme začít znovu. S čím vám pomohu?',
      day: 'Dobrý den, můžeme začít znovu. S čím vám pomohu?',
      night: 'Dobrý večer, můžeme začít znovu. S čím vám pomohu?'
    },
    idle_reminder: {
      morning: 'Jsem tu pro informace o škole, školce i kontaktech.',
      day: 'Jsem tu pro informace o škole, školce i kontaktech.',
      night: 'Jsem tu pro informace o škole, školce i kontaktech.'
    },
    final_attempt: {
      morning: 'Stále něco hledáte? Napište mi a zkusíme to spolu.',
      day: 'Stále něco hledáte? Napište mi a zkusíme to spolu.',
      night: 'Stále něco hledáte? Napište mi a zkusíme to spolu.'
    }
  };

  var CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

#magichill-cta,
#magichill-cta *,
#magichill-cta *::before,
#magichill-cta *::after {
  box-sizing: border-box !important;
  margin: 0 !important;
  padding: 0 !important;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  line-height: normal !important;
  letter-spacing: normal !important;
  text-transform: none !important;
  text-decoration: none !important;
  list-style: none !important;
  border-collapse: collapse !important;
  vertical-align: baseline !important;
  color: #FFF !important;
}

:root{
  --magichill-primary:#007ACC;
  --magichill-primary-hover:#005B99;
  --magichill-border:#deecf5;
  --magichill-text:#0b1720;
  --magichill-bg:#ffffff;
  --magichill-card-w:240px;
  --magichill-launcher-size:120px;
  --magichill-font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

#magichill-cta.magichill-cta{
  position: fixed !important;
  right: 18px !important;
  bottom: 100px !important;
  z-index: 999999 !important;
  opacity: 0 !important;
  transform: translateY(8px) scale(.98) !important;
  visibility: hidden !important;
  pointer-events: none !important;
  transition: opacity .2s ease, transform .2s ease, visibility 0s linear .2s !important;
  font-family: var(--magichill-font) !important;
  margin: 0 !important;
  padding: 0 !important;
  width: auto !important;
  height: auto !important;
  max-width: none !important;
  max-height: none !important;
  min-width: 0 !important;
  min-height: 0 !important;
  float: none !important;
  clear: both !important;
  display: block !important;
}

#magichill-cta.magichill-cta.is-in{ 
  opacity: 1 !important; 
  transform: translateY(0) scale(1) !important; 
  visibility: visible !important; 
  pointer-events: auto !important; 
}

#magichill-cta.magichill-cta.is-out{ 
  opacity: 0 !important; 
  transform: translateY(8px) scale(.98) !important; 
  visibility: hidden !important; 
  pointer-events: none !important; 
  transition: opacity .16s ease, transform .16s ease, visibility 0s linear .16s !important; 
}

#magichill-cta .magichill-card{
  position: relative !important;
  width: 240px !important;
  max-width: 240px !important;
  min-width: 240px !important;
  background: #ffffff !important;
  color: #0b1720 !important;
  border: 0 !important;
  border-radius: 16px !important;
  padding: 14px !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 10px !important;
  box-shadow: 0 16px 32px -16px rgba(0,0,0,.28) !important;
  font-family: var(--magichill-font) !important;
  margin: 0 !important;
  box-sizing: border-box !important;
  overflow: visible !important;
  float: none !important;
  clear: both !important;
}

#magichill-cta .magichill-header{ 
  display: flex !important; 
  align-items: center !important; 
  gap: 10px !important;
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

#magichill-cta .magichill-avatar{
  width: 32px !important;
  height: 32px !important;
  flex: 0 0 32px !important;
  max-width: 32px !important;
  max-height: 32px !important;
  min-width: 32px !important;
  min-height: 32px !important;
  object-fit: cover !important;
  border-radius: 50% !important;
  background: #ffffff !important;
  user-select: none !important;
  -webkit-user-drag: none !important;
  margin: 0 !important;
  padding: 0 !important;
  display: block !important;
}

#magichill-cta .magichill-title{ 
  font-size: 15px !important; 
  font-weight: 800 !important; 
  line-height: 1.1 !important; 
  white-space: nowrap !important; 
  overflow: hidden !important; 
  text-overflow: ellipsis !important;
  margin: 0 !important;
  padding: 0 !important;
  flex: 1 1 auto !important;
}

#magichill-cta .magichill-title-accent{ 
  color: #007ACC !important; 
  margin-right: 3px !important; 
}

#magichill-cta .magichill-title-rest{ 
  color: #0b1720 !important; 
}

#magichill-cta .magichill-desc{ 
  margin: 2px 0 4px !important; 
  font-size: 14px !important; 
  line-height: 1.35 !important; 
  color: #0b1720 !important;
  padding: 0 !important;
  width: 100% !important;
  box-sizing: border-box !important;
  font-weight: 400 !important;
}

#magichill-cta #magichill-open.magichill-btn{
  position: relative !important;
  overflow: hidden !important;
  padding: 10px 18px !important;
  border: 2px solid #deecf5 !important;
  border-radius: 15px !important;
  color: #fff !important;
  font-weight: 700 !important;
  letter-spacing: .05em !important;
  font-size: 15px !important;
  cursor: pointer !important;
  background: linear-gradient(120deg, #007ACC 0%, #005B99 50%, #003D66 100%) !important;
  transition: background .2s ease, color .2s ease !important;
  margin: 0 !important;
  width: 100% !important;
  box-sizing: border-box !important;
  display: inline-block !important;
  text-align: center !important;
  text-decoration: none !important;
  line-height: normal !important;
}

#magichill-cta #magichill-open.magichill-btn:active{ 
  transform: translateY(1px) !important; 
}

#magichill-cta #magichill-open.magichill-btn:hover{
  background: linear-gradient(120deg, #003D66 0%, #005B99 50%, #007ACC 100%) !important;
  border: 2px solid #deecf5 !important;
}

#magichill-cta #magichill-close.magichill-close{
  position: absolute !important;
  top: -10px !important;
  right: -10px !important;
  width: 24px !important;
  height: 24px !important;
  min-width: 24px !important;
  min-height: 24px !important;
  max-width: 24px !important;
  max-height: 24px !important;
  border-radius: 999px !important;
  border: 1px solid rgba(0,0,0,.15) !important;
  background: #fff !important;
  color: #0b1720 !important;
  cursor: pointer !important;
  font-size: 14px !important;
  line-height: 1 !important;
  display: grid !important;
  place-items: center !important;
  box-shadow: 0 8px 16px -10px rgba(0,0,0,.25) !important;
  margin: 0 !important;
  padding: 0 !important;
  box-sizing: border-box !important;
  text-align: center !important;
}

#magichill-cta .magichill-avatar, 
#magichill-cta .magichill-btn, 
#magichill-cta .magichill-close, 
#magichill-cta .magichill-card, 
#magichill-cta .magichill-cta, 
#magichill-cta img{ 
  -webkit-user-drag: none !important; 
  user-select: none !important; 
}

@media (max-width:768px){
  #magichill-cta.magichill-cta{ 
    right: 20px !important;
    left: auto !important;
    bottom: calc(80px + 20px) !important;
    transform: translateY(8px) scale(.98) !important;
  }
  #magichill-cta.magichill-cta.is-in{ 
    opacity: 1 !important; 
    transform: translateY(0) scale(1) !important; 
    visibility: visible !important; 
    pointer-events: auto !important; 
  }
  #magichill-cta.magichill-cta.is-out{ 
    opacity: 0 !important; 
    transform: translateY(8px) scale(.98) !important; 
    visibility: hidden !important; 
    pointer-events: none !important;
  }
  #magichill-cta .magichill-card{ 
    width: calc(100vw - 32px) !important; 
    max-width: 240px !important;
    min-width: auto !important;
    margin: 0 !important;
  }
  #magichill-cta .magichill-title{ font-size: 14px !important; }
  #magichill-cta .magichill-desc{ font-size: 13px !important; }
  #magichill-cta #magichill-open.magichill-btn{ 
    padding: 12px 20px !important; 
    font-size: 15px !important; 
  }
}

@media (max-width:480px){
  #magichill-cta.magichill-cta{ 
    right: 12px !important;
    left: auto !important;
    bottom: calc(70px + 16px) !important;
  }
  #magichill-cta .magichill-card{ 
    width: calc(100vw - 24px) !important;
    max-width: 100% !important;
    min-width: auto !important;
    padding: 12px !important;
    border-radius: 14px !important;
  }
  #magichill-cta .magichill-avatar{ 
    width: 28px !important; 
    height: 28px !important; 
    flex: 0 0 28px !important;
    max-width: 28px !important;
    max-height: 28px !important;
    min-width: 28px !important;
    min-height: 28px !important;
  }
  #magichill-cta .magichill-title{ font-size: 13px !important; }
  #magichill-cta .magichill-desc{ font-size: 12.5px !important; line-height: 1.4 !important; }
  #magichill-cta #magichill-open.magichill-btn{ 
    padding: 11px 18px !important; 
    font-size: 14px !important; 
    border-radius: 12px !important;
  }
}
  `.trim();

  var now = function() { return Date.now(); };
  var getSS = function(k) { return sessionStorage.getItem(k); };
  var setSS = function(k, v) { sessionStorage.setItem(k, String(v)); };
  var rmSS = function(k) { sessionStorage.removeItem(k); };
  var getLS = function(k) { return localStorage.getItem(k); };
  var setLS = function(k, v) { localStorage.setItem(k, String(v)); };
  var within = function(ts, ms) { return ts && (now() - Number(ts) < ms); };

  var ctaEl, btnOpenEl, btnCloseEl, descEl, visible = false;
  var metDwell = false, metScroll = false, deepScroll = false, longStay = false;
  var dwellTimer = null, longTimer = null, enforceTimer = null, boot = true, vfReady = false;
  var vfReadyTime = null;
  var chatOpen = false;
  var autoHideTimer = null, reShowTimer = null;
  var showCount = 0, sessionStart = now();
  var autoHideWasTimer = false;
  var currentMessageType = null;
  var messageLocked = false;

  function scheduleAutoReShow() {
    clearTimeout(reShowTimer);
    reShowTimer = setTimeout(function() {
      var sessionChatOpen = getSS(SS.CHAT_OPEN) === '1';
      var chatVisible = detectChatVisible();
      if (!chatOpen && !chatVisible && !sessionChatOpen) {
        rmSS(SS.SUPPRESS);
        updateMessage();
        var ctx = { deepScroll: deepScroll, longStay: longStay };
        showCTA(ctx);
      }
    }, UX.autoReShowMs);
  }

  function injectCSS() {
    if (document.querySelector('style[data-payloadwindow-style]')) return;
    var s = document.createElement('style');
    s.setAttribute('data-payloadwindow-style', '1');
    s.appendChild(document.createTextNode(CSS));
    document.head.appendChild(s);
  }

  function injectCTA() {
    if (document.getElementById('magichill-cta')) return;

    var timeOfDay = getTimeOfDay();
    var defaultMsg = MSG.default[timeOfDay] || MSG.default.day;

    var wrap = document.createElement('div');
    wrap.innerHTML = [
      '<div class="magichill-cta" id="magichill-cta" aria-live="polite" aria-hidden="true" style="display:none">',
      '  <div class="magichill-card">',
      '    <button class="magichill-close" id="magichill-close" aria-label="Skrýt">×</button>',
      '    <div class="magichill-header">',
      '      <img class="magichill-avatar" src="https://trixtecheu.github.io/HOLESOV/images/holesov-icon.jpg" alt="Holešov" draggable="false" ondragstart="return false;">',
      '      <strong class="magichill-title"><span class="magichill-title-accent">AI asistent</span><span class="magichill-title-rest">Holešov</span></strong>',
      '    </div>',
      '    <p class="magichill-desc" id="magichill-text">' + defaultMsg + '</p>',
      '    <button id="magichill-open" class="magichill-btn" aria-label="Otevřít AI asistenta Holešov"><span class="magichill-label">Poraď mi</span></button>',
      '  </div>',
      '</div>'
    ].join('\n');
    document.body.appendChild(wrap.firstChild);
  }

  function getTimeOfDay() {
    var hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'day';
    return 'night';
  }

  function pickMessage(ctx, forceUpdate) {
    if (messageLocked && !forceUpdate && currentMessageType) {
      var timeOfDay = getTimeOfDay();
      if (currentMessageType === 'default') return MSG.default[timeOfDay] || MSG.default.day;
      if (currentMessageType === 'deep') return MSG.deep[timeOfDay] || MSG.deep.day;
      if (currentMessageType === 'linger') return MSG.linger[timeOfDay] || MSG.linger.day;
      if (currentMessageType === 'return_short') return MSG.return_short[timeOfDay] || MSG.return_short.day;
      if (currentMessageType === 'return_medium') return MSG.return_medium[timeOfDay] || MSG.return_medium.day;
      if (currentMessageType === 'return_long') return MSG.return_long[timeOfDay] || MSG.return_long.day;
      if (currentMessageType === 'session_expired') return MSG.session_expired[timeOfDay] || MSG.session_expired.day;
      if (currentMessageType === 'idle_reminder') return MSG.idle_reminder[timeOfDay] || MSG.idle_reminder.day;
      if (currentMessageType === 'final_attempt') return MSG.final_attempt[timeOfDay] || MSG.final_attempt.day;
    }

    var timeOfDay = getTimeOfDay();
    var chatClosedTime = getSS(SS.CHAT_CLOSED_TIME);
    var hadChatInteraction = chatClosedTime ? true : false;
    var messageType = 'default';

    if (!hadChatInteraction) {
      if (showCount === 0) {
        messageType = 'default';
      } else if (ctx && ctx.deepScroll && !visible) {
        messageType = 'deep';
      } else if (ctx && ctx.longStay && !visible) {
        messageType = 'linger';
      } else {
        messageType = 'default';
      }
    } else {
      var timeSinceClose = now() - Number(chatClosedTime);

      if (timeSinceClose < 60000) {
        messageType = 'return_short';
      } else if (timeSinceClose < 300000) {
        messageType = 'return_medium';
      } else if (timeSinceClose < 600000) {
        messageType = 'return_long';
      } else {
        var sessionAge = now() - sessionStart;
        if (sessionAge > UX.sessionTimeoutMs) {
          messageType = 'session_expired';
        } else if (showCount > 3) {
          messageType = 'final_attempt';
        } else if (ctx && ctx.longStay) {
          messageType = 'idle_reminder';
        } else {
          messageType = 'return_medium';
        }
      }
    }

    if (!messageLocked || forceUpdate) {
      currentMessageType = messageType;
    }

    if (messageType === 'default') return MSG.default[timeOfDay] || MSG.default.day;
    if (messageType === 'deep') return MSG.deep[timeOfDay] || MSG.deep.day;
    if (messageType === 'linger') return MSG.linger[timeOfDay] || MSG.linger.day;
    if (messageType === 'return_short') return MSG.return_short[timeOfDay] || MSG.return_short.day;
    if (messageType === 'return_medium') return MSG.return_medium[timeOfDay] || MSG.return_medium.day;
    if (messageType === 'return_long') return MSG.return_long[timeOfDay] || MSG.return_long.day;
    if (messageType === 'session_expired') return MSG.session_expired[timeOfDay] || MSG.session_expired.day;
    if (messageType === 'idle_reminder') return MSG.idle_reminder[timeOfDay] || MSG.idle_reminder.day;
    if (messageType === 'final_attempt') return MSG.final_attempt[timeOfDay] || MSG.final_attempt.day;

    return MSG.default[timeOfDay] || MSG.default.day;
  }

  function updateMessage(forceUpdate) {
    if (!descEl) return;
    descEl.textContent = pickMessage({ deepScroll: deepScroll, longStay: longStay }, forceUpdate);
  }

  function detectChatVisible() {
    if (window.voiceflow?.chat && typeof window.voiceflow.chat.isOpen === 'function') {
      try {
        var isOpen = window.voiceflow.chat.isOpen();
        return isOpen;
      } catch (e) {
      }
    }

    var launcher = document.querySelector('.vfrc-launcher, button.vfrc-launcher');
    if (launcher) {
      var launcherCS = window.getComputedStyle(launcher);
      var launcherRect = launcher.getBoundingClientRect();
      var launcherVisible = launcherCS && launcherCS.display !== 'none' && launcherCS.visibility !== 'hidden' && launcherCS.opacity !== '0' && launcherRect.width > 10;
      return !launcherVisible;
    }

    return false;
  }

  function canShow() {
    var vfIsReady = vfReady && window.voiceflow && window.voiceflow.chat;
    if (!vfIsReady) return false;

    var chatVisible = detectChatVisible();
    var sessionOpen = getSS(SS.CHAT_OPEN) === '1';
    var suppressed = getSS(SS.SUPPRESS) === '1';
    var dismissed = getSS(SS.PAYLOAD_DISMISSED) === '1';
    var dwellMet = metDwell;
    var scrollMet = metScroll;
    var cooldownActive = within(getLS(LS.LAST_CLOSE), UX.closeCooldownMs);

    if (dismissed) return false;
    if (chatOpen) return false;
    if (chatVisible) return false;
    if (sessionOpen) return false;
    if (suppressed) return false;

    var chatClosedTime = getSS(SS.CHAT_CLOSED_TIME);
    var longClosed = chatClosedTime && (now() - Number(chatClosedTime) > 120000);

    if (!longClosed && !dwellMet && !scrollMet) return false;
    if (cooldownActive) return false;

    return true;
  }

  function showCTA(ctx) {
    if (chatOpen) return;
    if (detectChatVisible()) return;
    if (!ctaEl) return;
    if (visible) return;
    if (!canShow()) return;

    var chatCheck = detectChatVisible();
    if (chatCheck) {
      chatOpen = true;
      setSS(SS.CHAT_OPEN, '1');
      return;
    }

    visible = true;
    messageLocked = true;
    showCount++;
    setSS(SS.SHOW_COUNT, String(showCount));
    setSS(SS.LAST_SHOW_TIME, String(now()));

    ctaEl.style.display = '';
    ctaEl.classList.remove('is-out');
    ctaEl.classList.add('is-in');
    ctaEl.removeAttribute('aria-hidden');

    clearTimeout(autoHideTimer);
    autoHideTimer = setTimeout(function() {
      if (visible && !chatOpen && !detectChatVisible()) {
        autoHideWasTimer = true;
        hideCTA();
        setSS(SS.SUPPRESS, '1');
        scheduleAutoReShow();
      }
    }, UX.autoHideMs);
  }

  function hideCTA() {
    if (!ctaEl || !visible) return;
    visible = false;
    messageLocked = false;
    currentMessageType = null;
    clearTimeout(autoHideTimer);
    ctaEl.classList.add('is-out');
    var done = function() {
      ctaEl.style.display = 'none';
      ctaEl.setAttribute('aria-hidden', 'true');
      ctaEl.removeEventListener('transitionend', done);
    };
    ctaEl.addEventListener('transitionend', done);
    setTimeout(done, 160);
    if (!autoHideWasTimer) return;
    autoHideWasTimer = false;
  }

  function scheduleDwell() {
    clearTimeout(dwellTimer);
    dwellTimer = setTimeout(function() {
      metDwell = true;
      maybeShow();
    }, UX.dwellMs);
  }

  function scheduleLongStay() {
    clearTimeout(longTimer);
    longTimer = setTimeout(function() {
      longStay = true;
      if (!messageLocked) {
        updateMessage();
      }
      maybeShow();
    }, UX.longStayMs);
  }

  function watchScroll() {
    var onScroll = function() {
      var sc = (scrollY + innerHeight) / Math.max(1, document.documentElement.scrollHeight) * 100;
      if (sc >= UX.minScrollPct) metScroll = true;
      if (sc >= 65) deepScroll = true;
      if (metScroll) {
        removeEventListener('scroll', onScroll);
        maybeShow();
      }
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function maybeShow() {
    if (chatOpen || detectChatVisible()) {
      if (detectChatVisible()) {
        chatOpen = true;
        setSS(SS.CHAT_OPEN, '1');
      }
      return;
    }
    if (!canShow()) return;

    var ctx = { deepScroll: deepScroll, longStay: longStay };
    var messageType = 'default';
    var chatClosedTime = getSS(SS.CHAT_CLOSED_TIME);
    var hadChatInteraction = chatClosedTime ? true : false;

    if (!hadChatInteraction) {
      if (showCount === 0) {
        messageType = 'default';
      } else if (!visible && deepScroll) {
        messageType = 'deep';
      } else if (!visible && longStay) {
        messageType = 'linger';
      } else {
        messageType = 'default';
      }
    } else {
      var timeSinceClose = now() - Number(chatClosedTime);
      if (timeSinceClose < 60000) {
        messageType = 'return_short';
      } else if (timeSinceClose < 300000) {
        messageType = 'return_medium';
      } else if (timeSinceClose < 600000) {
        messageType = 'return_long';
      } else {
        var sessionAge = now() - sessionStart;
        if (sessionAge > UX.sessionTimeoutMs) {
          messageType = 'session_expired';
        } else if (showCount > 3) {
          messageType = 'final_attempt';
        } else if (longStay) {
          messageType = 'idle_reminder';
        } else {
          messageType = 'return_medium';
        }
      }
    }

    var delay = getDelayForMessageType(messageType, ctx);

    if (vfReadyTime) {
      var timeSinceVFReady = now() - vfReadyTime;
      var minDelayAfterVF = 5000;

      if (timeSinceVFReady < minDelayAfterVF) {
        var remainingDelay = minDelayAfterVF - timeSinceVFReady;
        setTimeout(function() {
          if (!chatOpen && !detectChatVisible() && canShow()) {
            updateMessage();
            setTimeout(function() {
              if (!chatOpen && !detectChatVisible()) {
                showCTA(ctx);
              }
            }, delay);
          }
        }, remainingDelay);
        return;
      }
    }

    updateMessage();
    setTimeout(function() {
      if (!chatOpen && !detectChatVisible()) {
        showCTA(ctx);
      }
    }, delay);
  }

  function startEnforcer() {
    clearInterval(enforceTimer);
    enforceTimer = setInterval(function() {
      var openNow = detectChatVisible();
      var wasChatOpen = chatOpen;
      var sessionChatOpen = getSS(SS.CHAT_OPEN) === '1';

      if (openNow || chatOpen || sessionChatOpen) {
        if (!chatOpen) {
          chatOpen = true;
          setSS(SS.CHAT_OPEN, '1');
        }
        if (visible) {
          hideCTA();
        }
        return;
      }

      if (!openNow && wasChatOpen) {
        chatOpen = false;
        setSS(SS.CHAT_OPEN, '0');
        setSS(SS.CHAT_CLOSED_TIME, String(now()));
        setLS(LS.LAST_CLOSE, String(now()));

        clearTimeout(reShowTimer);
        reShowTimer = setTimeout(function() {
          if (!chatOpen && !visible && !detectChatVisible() && getSS(SS.CHAT_OPEN) !== '1') {
            rmSS(SS.SUPPRESS);
            updateMessage();
            var ctx = { deepScroll: deepScroll, longStay: longStay };
            showCTA(ctx);
          }
        }, UX.reShowDelayMs);
        return;
      }

      if (!openNow && !chatOpen && !sessionChatOpen && !visible && canShow() && !detectChatVisible()) {
        updateMessage();
        var ctx = { deepScroll: deepScroll, longStay: longStay };
        showCTA(ctx);
      }
    }, UX.enforceEveryMs);
  }

  function observeVF() {
    var checkLauncher = function() {
      var launcher = document.querySelector('.vfrc-launcher, button.vfrc-launcher');
      if (!launcher) return;

      var launcherCS = window.getComputedStyle(launcher);
      var launcherVisible = launcherCS && launcherCS.display !== 'none' && launcherCS.visibility !== 'hidden' && launcherCS.opacity !== '0';

      if (!launcherVisible && !chatOpen) {
        chatOpen = true;
        setSS(SS.CHAT_OPEN, '1');
        if (visible) hideCTA();
      } else if (launcherVisible && chatOpen) {
        chatOpen = false;
        setSS(SS.CHAT_OPEN, '0');
        setSS(SS.CHAT_CLOSED_TIME, String(now()));
      }
    };

    var mo = new MutationObserver(checkLauncher);
    mo.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    var launcher = document.querySelector('.vfrc-launcher, button.vfrc-launcher');
    if (launcher) {
      var launcherMo = new MutationObserver(checkLauncher);
      launcherMo.observe(launcher, {
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    }
  }

  function markChatOpened() {
    setSS(SS.CHAT_OPEN, '1');
    setSS(SS.USER_OPENED_CHAT, '1');
    setSS(SS.SUPPRESS, '1');
    chatOpen = true;
    hideCTA();
  }

  function bindOpenChatButton() {
    var btn = document.getElementById('magichill-open');
    if (btn) {
      btn.addEventListener('click', function() {
        try {
          window.voiceflow.chat.open();
        } catch (_) {
        }
        setSS(SS.SUPPRESS, '1');
        markChatOpened();
      });
    }
  }

  function bindLauncherClick() {
    var LAUNCHER_SEL = '.vfrc-launcher__container, .vfrc-launcher__inner, .vfrc-widget__launcher, .vfrc-launcher, .vfrc-button[title="Open chat agent"], [data-testid="vfrc-launcher"], [data-voiceflow-launcher]';
    var HOST_SEL = '#voiceflow-chat, #voiceflow-chat-widget';

    document.addEventListener('click', function(e) {
      var target = e.target;
      if (!target) return;

      var path = (typeof e.composedPath === 'function') ? e.composedPath() : [];
      for (var i = 0; i < path.length; i++) {
        var n = path[i];
        if (n && n.matches && n.matches(LAUNCHER_SEL)) {
          markChatOpened();
          return;
        }
      }
      if (target.closest && target.closest(LAUNCHER_SEL)) {
        markChatOpened();
        return;
      }
      var hosts = document.querySelectorAll(HOST_SEL);
      for (var j = 0; j < hosts.length; j++) {
        var host = hosts[j];
        var sr = host && host.shadowRoot;
        if (!sr) continue;
        if (sr.contains(target)) {
          for (var k = 0; k < path.length; k++) {
            var sn = path[k];
            if (sn && sn.matches && sn.matches(LAUNCHER_SEL)) {
              markChatOpened();
              return;
            }
          }
        }
      }
    }, true);
  }

  function handleChatClosed() {
    rmSS(SS.CHAT_OPEN);
    chatOpen = false;
    rmSS(SS.USER_OPENED_CHAT);
    setSS(SS.CHAT_CLOSED_TIME, String(now()));
    setLS(LS.LAST_CLOSE, String(now()));
    clearTimeout(reShowTimer);
    reShowTimer = setTimeout(function() {
      if (!chatOpen && !detectChatVisible()) {
        rmSS(SS.SUPPRESS);
        updateMessage();
        var ctx = { deepScroll: deepScroll, longStay: longStay };
        showCTA(ctx);
      }
    }, UX.reShowDelayMs);
  }

  function bindCloseButtons() {
    var CLOSE_SEL = 'button[title="Close chat agent"], [aria-label="Close"], .vfrc-header__button, .vfrc-close, .vfrc-close-button, [data-testid="vfrc-header-close"]';
    var HOST_SEL = '#voiceflow-chat, #voiceflow-chat-widget';

    document.addEventListener('click', function(e) {
      var t = e.target;
      if (!t) return;
      var path = (typeof e.composedPath === 'function') ? e.composedPath() : [];
      for (var i = 0; i < path.length; i++) {
        var n = path[i];
        if (n && n.matches && n.matches(CLOSE_SEL)) {
          handleChatClosed();
          return;
        }
      }
      if (t.closest && t.closest(CLOSE_SEL)) {
        handleChatClosed();
        return;
      }
      var hosts = document.querySelectorAll(HOST_SEL);
      for (var j = 0; j < hosts.length; j++) {
        var host = hosts[j];
        var sr = host && host.shadowRoot;
        if (!sr) continue;
        if (sr.contains(t)) {
          for (var k = 0; k < path.length; k++) {
            var sn = path[k];
            if (sn && sn.matches && sn.matches(CLOSE_SEL)) {
              handleChatClosed();
              return;
            }
          }
        }
      }
    }, true);
  }

  setTimeout(function() { boot = false; }, UX.bootWindowMs);
  addEventListener('hashchange', updateMessage);

  addEventListener('message', function(evt) {
    var data = evt.data;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (_) {
      }
    }
    if (!data || typeof data.type !== 'string') return;

    if (data.type === 'voiceflow:open') {
      setSS(SS.CHAT_OPEN, '1');
      setSS(SS.USER_OPENED_CHAT, '1');
      setSS(SS.SUPPRESS, '1');
      chatOpen = true;
      hideCTA();
    }
    if (data.type === 'voiceflow:close') {
      rmSS(SS.CHAT_OPEN);
      chatOpen = false;
      rmSS(SS.USER_OPENED_CHAT);
      setSS(SS.CHAT_CLOSED_TIME, String(now()));
      setLS(LS.LAST_CLOSE, String(now()));

      clearTimeout(reShowTimer);
      reShowTimer = setTimeout(function() {
        var chatVisible = detectChatVisible();
        var sessionChatOpen = getSS(SS.CHAT_OPEN) === '1';
        if (!chatOpen && !visible && !chatVisible && !sessionChatOpen) {
          rmSS(SS.SUPPRESS);
          updateMessage();
          var ctx = { deepScroll: deepScroll, longStay: longStay };
          showCTA(ctx);
        }
      }, UX.reShowDelayMs);
    }
  });

  window.PayloadWindowOnReady = function(api) {
    vfReady = true;
    vfReadyTime = now();

    try {
      if (api?.proactive?.push) {
        var _orig = api.proactive.push.bind(api.proactive);
        api.proactive.push = function() {
          if (detectChatVisible() || chatOpen) return;
          return _orig.apply(api.proactive, arguments);
        };
      }
    } catch (_) {
    }

    if (detectChatVisible() || getSS(SS.CHAT_OPEN) === '1') {
      chatOpen = true;
      setSS(SS.CHAT_OPEN, '1');
      if (visible) hideCTA();
    }

    metDwell = false;
    metScroll = false;
    deepScroll = false;
    longStay = false;
    clearTimeout(dwellTimer);
    clearTimeout(longTimer);

    observeVF();
    startEnforcer();

    setTimeout(function() {
      scheduleDwell();
      scheduleLongStay();
      watchScroll();
    }, UX.vfReadyDelayMs);
  };

  function bindCTA() {
    ctaEl = document.getElementById('magichill-cta');
    btnOpenEl = document.getElementById('magichill-open');
    btnCloseEl = document.getElementById('magichill-close');
    descEl = document.getElementById('magichill-text');

    btnOpenEl?.addEventListener('click', function() {
      try {
        window.voiceflow.chat.open();
      } catch (_) {
      }
      setSS(SS.SUPPRESS, '1');
      markChatOpened();
    });

    btnCloseEl?.addEventListener('click', function() {
      setSS(SS.PAYLOAD_DISMISSED, '1');
      setSS(SS.SUPPRESS, '1');
      hideCTA();
    });
  }

  function checkChatOnLoad() {
    var checkAttempts = 0;
    var maxAttempts = 10;
    var checkInterval = 500;

    var checkChat = function() {
      checkAttempts++;
      var chatIsVisible = detectChatVisible();
      var sessionChatOpen = getSS(SS.CHAT_OPEN) === '1';

      if (chatIsVisible || sessionChatOpen) {
        chatOpen = true;
        setSS(SS.CHAT_OPEN, '1');
        if (visible) hideCTA();
        return true;
      }

      if (checkAttempts >= maxAttempts) {
        rmSS(SS.SUPPRESS);
        if (!sessionChatOpen) {
          rmSS(SS.CHAT_OPEN);
        }
        chatOpen = false;
        return false;
      }

      setTimeout(checkChat, checkInterval);
      return false;
    };

    setTimeout(checkChat, 1000);
  }

  function getDelayForMessageType(type, ctx) {
    var baseDelay = UX.showDelayMs;
    var timeOfDay = getTimeOfDay();

    if (type === 'default') {
      if (timeOfDay === 'morning') return baseDelay + 2000;
      if (timeOfDay === 'night') return baseDelay + 3000;
      return baseDelay + 1500;
    }

    if (type === 'deep' || ctx?.deepScroll) {
      return baseDelay + 4000;
    }

    if (type === 'linger' || ctx?.longStay) {
      return baseDelay + 5000;
    }

    if (type === 'return_short') {
      return baseDelay + 1000;
    }

    if (type === 'return_medium') {
      return baseDelay + 2000;
    }

    if (type === 'return_long') {
      return baseDelay + 2500;
    }

    if (type === 'idle_reminder') {
      return baseDelay + 6000;
    }

    if (type === 'final_attempt') {
      return baseDelay + 3500;
    }

    return baseDelay + 2000;
  }

  function init() {
    showCount = parseInt(getSS(SS.SHOW_COUNT) || '0');
    sessionStart = parseInt(getSS(SS.SESSION_START) || String(now()));
    setSS(SS.SESSION_START, String(sessionStart));

    injectCSS();
    injectCTA();
    bindCTA();
    bindOpenChatButton();
    bindLauncherClick();
    bindCloseButtons();

    startEnforcer();
    observeVF();

    document.addEventListener('visibilitychange', function() {
      if (document.visibilityState === 'visible' && !metDwell) scheduleDwell();
    });

    var sessionChatOpen = getSS(SS.CHAT_OPEN) === '1';

    if (sessionChatOpen) {
      chatOpen = true;
      setSS(SS.CHAT_OPEN, '1');
      if (visible) hideCTA();
    } else {
      checkChatOnLoad();
    }
  }

  window.PayloadWindow = { show: showCTA, hide: hideCTA };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window, document);
/*! PayloadWindow.js — Konior persona v2.6 (no-bleed) | (c) 2025 TrixTech s.r.o. */
(function (window, document) {
  var UX = {
    dwellMs: 3500,
    longStayMs: 45000,
    minScrollPct: 10,
    showDelayMs: 400,
    bootWindowMs: 900,
    closeCooldownMs: 15000,
    enforceEveryMs: 250,
    autoHideMs: 60000, // 60 sekund automatické skrytí
    reShowDelayMs: 2000, // 2 sekundy po zavření chatu
    sessionTimeoutMs: 300000, // 5 minut timeout pro session
    autoReShowMs: 120000 // 2 minuty po auto-skrýt znovu povolit CTA
  };

  // Přidal jsem nový klíč do objektu SS
  var SS = {
    SUPPRESS: 'vf_payload_suppressed_session',
    CHAT_OPEN: 'vf_chat_is_open',
    USER_OPENED_CHAT: 'vf_user_opened_chat', // flag, když uživatel otevřel chat
    CHAT_CLOSED_TIME: 'vf_chat_closed_time', // kdy byl chat zavřen
    SHOW_COUNT: 'vf_show_count', // kolikrát se zobrazil payload
    LAST_SHOW_TIME: 'vf_last_show_time', // kdy se naposledy zobrazil
    SESSION_START: 'vf_session_start' // kdy začala session
  };
  var LS = { 
    LAST_CLOSE: 'vf_last_close_at',
    TOTAL_VISITS: 'vf_total_visits',
    LAST_VISIT: 'vf_last_visit'
  };

  var MSG = {
    default:  '👋🏻 Ahoj! Jsem Tomáš Konior. S čím ti můžu pomoct?',
    bio:      'Zajímá tě něco o mně nebo mojí práci?',
    nabidka:  'Provedu tě aktuální nabídkou a ušetřím ti čas.',
    blog:     'Chceš shrnutí článku nebo tip, čím začít?',
    odhad:    'Spočítám orientační odhad ceny na pár otázek.',
    reference:'Pomůžu vybrat nejrelevantnější reference.',
    kontakt:  'Pošlu ti hned kontakt nebo zprávu.',
    deep:     'Dává smysl to probrat rychle<br>v chatu? Zkrátím ti cestu.',
    linger:   'Jsi tu delší dobu. Chceš s tím rychle pomoct v chatu?',
    // Nové typy zpráv podle situace
    return_short: 'Ještě něco potřebuješ? Rychle ti pomůžu!',
    return_medium: 'Vidím, že jsi se vrátil. Chceš pokračovat v rozhovoru?',
    return_long: 'Vítej zpět! Mám pro tebe nové tipy a informace.',
    session_expired: 'Ahoj znovu! Chceš se dozvědět něco nového?',
    idle_reminder: 'Jsem tu pro tebe, kdykoli budeš potřebovat pomoc.',
    final_attempt: 'Poslední šance - chcete se na něco zeptat?'
  };

  /* === tvoje původní vzhledovka (NEŠAHÁM) === */
  var CSS = `
:root{ --vf-brand:#eeb710; --vf-accent:#eeb710; --vf-text:#111; --vf-bg:#fff; --vf-card-w:200px; --vf-launcher-size:120px; }
.vf-cta{ position:fixed; right:18px; bottom:100px; z-index:900000; opacity:0; transform:translateY(8px) scale(.98); visibility:hidden; pointer-events:none; transition:opacity .2s ease, transform .2s ease, visibility 0s linear .2s; }
.vf-cta.is-in{ opacity:1; transform:translateY(0) scale(1); visibility:visible; pointer-events:auto; }
.vf-cta.is-out{ opacity:0; transform:translateY(8px) scale(.98); visibility:hidden; pointer-events:none; transition:opacity .16s ease, transform .16s ease, visibility 0s linear .16s; }
.vf-card{ position:relative; width:var(--vf-card-w); background:#fff; color:var(--vf-text); border:1px solid #111; border-radius:16px; padding:14px; display:flex; flex-direction:column; gap:10px; }
.vf-header{ display:flex; align-items:center; gap:8px; }
.vf-avatar{ width:32px; height:32px; flex:0 0 32px; border-radius:999px; object-fit:cover; background:#eeb710; user-select:none; -webkit-user-drag:none; }
.vf-title{ font-size:15px; font-weight:800; line-height:1.1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.vf-title-accent{ color:#eeb710; margin-right:6px; }
.vf-title-rest{ color:#111 }
.vf-desc{ margin:2px 0 4px; font-size:14px; line-height:1.35; color:#111; }
.vf-btn{ padding:10px 18px; border:0; border-radius:14px; background:#eeb710; color:#fff; font-weight:900; letter-spacing:.3px; font-size:14px; cursor:pointer; display:inline-block; }
.vf-btn:active{ transform:translateY(1px); }
.vf-close{ position:absolute; top:-10px; right:-10px; width:24px; height:24px; border-radius:999px; border:1px solid #111; background:#fff; color:#111; cursor:pointer; font-size:14px; line-height:1; display:grid; place-items:center; }
.vf-avatar, .vf-btn, .vf-close, .vf-card, .vf-cta, img{ -webkit-user-drag:none; user-select:none; }
@media (max-width:520px){ .vf-cta{ right:12px; bottom:calc(var(--vf-launcher-size) + 22px) } .vf-card{ width:86vw } }
  `.trim();

  var now = function(){ return Date.now(); };
  var getSS = function(k){ return sessionStorage.getItem(k); };
  var setSS = function(k,v){ sessionStorage.setItem(k, String(v)); };
  var rmSS = function(k){ sessionStorage.removeItem(k); };
  var getLS = function(k){ return localStorage.getItem(k); };
  var setLS = function(k,v){ localStorage.setItem(k, String(v)); };
  var within = function(ts, ms){ return ts && (now() - Number(ts) < ms); };

  var ctaEl, btnOpenEl, btnCloseEl, descEl, visible = false;
  var metDwell = false, metScroll = false, deepScroll = false, longStay = false;
  var dwellTimer = null, longTimer = null, enforceTimer = null, boot = true, vfReady = false;
  var chatOpen = false;
  var autoHideTimer = null, reShowTimer = null;
  var showCount = 0, sessionStart = now();
  var autoHideWasTimer = false; // indikace, že hideCTA bylo vyvoláno auto-hide
  function scheduleAutoReShow(){
    clearTimeout(reShowTimer);
    reShowTimer = setTimeout(function(){
      if (!chatOpen && !detectChatVisible()){
        rmSS(SS.SUPPRESS);
        updateMessage();
        showCTA();
      }
    }, UX.autoReShowMs);
  }

  function injectCSS(){
    if (document.querySelector('style[data-payloadwindow-style]')) return;
    var s = document.createElement('style');
    s.setAttribute('data-payloadwindow-style','1');
    s.appendChild(document.createTextNode(CSS));
    document.head.appendChild(s);
  }
  function injectCTA(){
    if (document.getElementById('vfCta')) return;
    var wrap = document.createElement('div');
    wrap.innerHTML = [
      '<div class="vf-cta" id="vfCta" aria-live="polite" aria-hidden="true" style="display:none">',
      '  <div class="vf-card">',
      '    <button class="vf-close" id="vfCtaClose" aria-label="Skrýt">×</button>',
      '    <div class="vf-header">',
      '      <img class="vf-avatar" src="https://i.imgur.com/qCFve64.png" alt="Tomáš Konior" draggable="false" ondragstart="return false;">',
      '      <strong class="vf-title"><span class="vf-title-accent">AI asistent</span><span class="vf-title-rest">Tomáš</span></strong>',
      '    </div>',
      '    <p class="vf-desc" id="vfCtaDesc">👋🏻 Ahoj! Jsem Tomáš Konior. S čím ti můžu pomoct?</p>',
      '    <button id="vfOpenChat" class="vf-btn" aria-label="Otevřít chatbota"><span class="vf-label">PORAĎ MI</span></button>',
      '  </div>',
      '</div>'
    ].join('\n');
    document.body.appendChild(wrap.firstChild);
  }

  function sectionFromHash(h){
    if (!h) return 'default';
    var x = h.replace('#','').toLowerCase();
    if (x.includes('bio')) return 'bio';
    if (x.includes('nabidka') || x.includes('nabídka')) return 'nabidka';
    if (x.includes('blog')) return 'blog';
    if (x.includes('odhad')) return 'odhad';
    if (x.includes('reference')) return 'reference';
    if (x.includes('kontakt') || x.includes('contact')) return 'kontakt';
    return 'default';
  }
  function pickMessage(ctx){
    // Pokud je to první zobrazení v session
    if (showCount === 0) {
      if (ctx.deepScroll) return MSG.deep;
      if (ctx.longStay) return MSG.linger;
      var sec = sectionFromHash(ctx.hash);
      return MSG[sec] || MSG.default;
    }
    
    // Pokud se uživatel vrátil po zavření chatu
    var chatClosedTime = getSS(SS.CHAT_CLOSED_TIME);
    var timeSinceClose = chatClosedTime ? (now() - Number(chatClosedTime)) : 0;
    
    // Různé zprávy podle času od zavření chatu
    if (timeSinceClose < 30000) { // méně než 30 sekund
      return MSG.return_short;
    } else if (timeSinceClose < 120000) { // méně než 2 minuty
      return MSG.return_medium;
    } else if (timeSinceClose < 300000) { // méně než 5 minut
      return MSG.return_long;
    }
    
    // Pokud je session starší než 5 minut
    var sessionAge = now() - sessionStart;
    if (sessionAge > UX.sessionTimeoutMs) {
      return MSG.session_expired;
    }
    
    // Pokud se zobrazilo už více než 3x
    if (showCount > 3) {
      return MSG.final_attempt;
    }
    
    // Pokud uživatel je na stránce dlouho bez akce
    if (ctx.longStay) {
      return MSG.idle_reminder;
    }
    
    // Výchozí zpráva pro návrat
    return MSG.return_medium;
  }
  function updateMessage(){
    if (!descEl) return;
    descEl.innerHTML = pickMessage({ hash: location.hash, deepScroll: deepScroll, longStay: longStay });
  }

  function detectChatVisible(){
    // Zkusit API metodu
    if (window.voiceflow?.chat && typeof window.voiceflow.chat.isOpen === 'function') {
      try { return !!window.voiceflow.chat.isOpen(); } catch(_) {}
    }
    
    // Hledat v Shadow DOM
    var shadowRoots = document.querySelectorAll('#voiceflow-chat-widget');
    for (var i = 0; i < shadowRoots.length; i++) {
      var shadow = shadowRoots[i].shadowRoot;
      if (shadow) {
        var chatEl = shadow.querySelector('.vfrc-widget, .vfrc-chat--overlay, [data-voiceflow-chat]');
        if (chatEl) {
          var cs = window.getComputedStyle(chatEl);
          if (cs && cs.visibility !== 'hidden' && cs.display !== 'none' && cs.opacity !== '0') {
            return true;
          }
        }
      }
    }
    
    // Fallback - hledat v běžném DOM
    var el = document.querySelector('.vfrc-widget, .vfrc-chat--overlay, #voiceflow-chat-widget, [data-voiceflow-chat]');
    if (!el) return false;
    var cs = window.getComputedStyle(el);
    return cs && cs.visibility !== 'hidden' && cs.display !== 'none' && cs.opacity !== '0';
  }

  function canShow(){
    // Povolit zobrazení i když VF ještě není plně načtený
    // if (!vfReady) return false;
    // Kontrola, jestli je chat viditelný - VŽDY skrýt pokud je chat otevřený
    if (detectChatVisible()) return false;
    // Kontrola, jestli je chat otevřený - VŽDY skrýt pokud je chat otevřený
    if (getSS(SS.CHAT_OPEN) === '1') return false;
    // Kontrola, jestli uživatel chat otevřel - stále můžeme znovu ukázat po zavření (resetujeme jinde)
    // if (getSS(SS.USER_OPENED_CHAT) === '1') return false;
    // Kontrola, jestli je suppress flag nastaven
    if (getSS(SS.SUPPRESS) === '1') return false;
    if (!metDwell || !metScroll) return false;
    if (within(getLS(LS.LAST_CLOSE), UX.closeCooldownMs)) return false;
    return true;
  }

  function showCTA(){
    if (!ctaEl || visible) return;
    if (!canShow()) return;
    
    visible = true;
    showCount++;
    setSS(SS.SHOW_COUNT, String(showCount));
    setSS(SS.LAST_SHOW_TIME, String(now()));
    
    ctaEl.style.display = '';
    ctaEl.classList.remove('is-out');
    ctaEl.classList.add('is-in');
    ctaEl.removeAttribute('aria-hidden');
    
    // Nastavit automatické skrytí po autoHideMs
    clearTimeout(autoHideTimer);
    autoHideTimer = setTimeout(function(){
      if (visible && !chatOpen) {
        autoHideWasTimer = true;
        hideCTA();
        setSS(SS.SUPPRESS, '1'); // Zakázat další zobrazení (do autoReShow)
        scheduleAutoReShow(); // po čase znovu povolit/zobrazit
      }
    }, UX.autoHideMs);
  }
  function hideCTA(){
    if (!ctaEl || !visible) return;
    visible = false;
    clearTimeout(autoHideTimer); // Vymazat automatický timer
    ctaEl.classList.add('is-out');
    var done = function(){ ctaEl.style.display='none'; ctaEl.setAttribute('aria-hidden','true'); ctaEl.removeEventListener('transitionend', done); };
    ctaEl.addEventListener('transitionend', done);
    setTimeout(done, 160);
    // Pokud skrytí nebylo vyvolané auto-hide časovačem (uživatel zavřel ručně nebo otevřel chat), nespouštěj autoReShow
    if (!autoHideWasTimer) return;
    autoHideWasTimer = false;
  }

  function scheduleDwell(){ clearTimeout(dwellTimer); dwellTimer = setTimeout(function(){ metDwell = true; maybeShow(); }, UX.dwellMs); }
  function scheduleLongStay(){ clearTimeout(longTimer); longTimer = setTimeout(function(){ longStay = true; updateMessage(); maybeShow(); }, UX.longStayMs); }
  function watchScroll(){
    var onScroll = function(){
      var sc = (scrollY + innerHeight) / Math.max(1, document.documentElement.scrollHeight) * 100;
      if (sc >= UX.minScrollPct) metScroll = true;
      if (sc >= 65) deepScroll = true;
      if (metScroll){ removeEventListener('scroll', onScroll); maybeShow(); }
    };
    addEventListener('scroll', onScroll, { passive:true }); onScroll();
  }

  function maybeShow(){ if (!canShow()) return; updateMessage(); setTimeout(showCTA, UX.showDelayMs); }

  function startEnforcer(){
    clearInterval(enforceTimer);
    enforceTimer = setInterval(function(){
      var openNow = detectChatVisible();
      
      // Debug logování
      if (window.location.search.includes('debug=1')) {
        console.log('Enforcer:', { openNow, chatOpen, visible, canShow: canShow() });
      }
      
      // Pokud je chat otevřený, VŽDY skryj CTA
      if (openNow){
        if (!chatOpen){
          chatOpen = true;
          setSS(SS.CHAT_OPEN,'1');
          if (window.location.search.includes('debug=1')) console.log('Chat opened, hiding CTA');
        }
        if (visible) {
          hideCTA();
          if (window.location.search.includes('debug=1')) console.log('Force hiding CTA');
        }
        return; // Nezkoumat další logiku pokud je chat otevřený
      }
      
      // Chat je zavřený - zkontrolovat přechod ze stavu "otevřený"
      if (!openNow && chatOpen){ 
        chatOpen = false; 
        setSS(SS.CHAT_OPEN, '0'); 
        setSS(SS.CHAT_CLOSED_TIME, String(now()));
        setLS(LS.LAST_CLOSE, String(now())); 
        
        if (window.location.search.includes('debug=1')) console.log('Chat closed, scheduling re-show');
        
        // Naplánovat znovu zobrazení po 2 sekundách
        clearTimeout(reShowTimer);
        reShowTimer = setTimeout(function(){
          if (!chatOpen && !visible && !detectChatVisible()) {
            rmSS(SS.SUPPRESS); // Povolit znovu zobrazení
            if (window.location.search.includes('debug=1')) console.log('Re-showing CTA after chat close');
            updateMessage();
            showCTA();
          }
        }, UX.reShowDelayMs);
      }
      
      // Zobrazit CTA pouze pokud chat NENÍ otevřený a splňuje podmínky
      if (!openNow && !visible && canShow()){ 
        updateMessage(); 
        showCTA(); 
      }
    }, UX.enforceEveryMs);
  }

  function observeVF(){
    var target = document.body;
    var mo = new MutationObserver(function(){
      if (detectChatVisible()){
        chatOpen = true; 
        setSS(SS.CHAT_OPEN,'1'); 
        if (visible) hideCTA(); // force hide i při opakovaných změnách DOMu
      }
    });
    mo.observe(target, { childList:true, subtree:true, attributes:true, attributeFilter:['style','class'] });
  }

  // Funkce, která zaznamená otevření chatbota a zakáže CTA
  function markChatOpened(){
    setSS(SS.CHAT_OPEN, '1');
    setSS(SS.USER_OPENED_CHAT, '1');
    setSS(SS.SUPPRESS, '1'); // přidání flagu, že uživatel otevřel chat nebo klikl na "PORAĎ MI"
    chatOpen = true;
    hideCTA();
  }

  // Příklad: pokud máš tlačítko nebo jinou událost, která spouští otevření
  // Uprav si podle svého
  function bindOpenChatButton(){
    var btn = document.getElementById('vfOpenChat');
    if (btn){
      btn.addEventListener('click', function(){
        try { window.voiceflow.chat.open(); } catch(_) {}
        markChatOpened(); // zaznamenat otevření a zakázat CTA
      });
    }
  }

  // Pokud máš jiný způsob otevření, přidej do něj volání markChatOpened()

  // Delegovaný listener: klik na launcher ikonu Voiceflow => otevřít chat a skrýt CTA
  function bindLauncherClick(){
    var LAUNCHER_SEL = '.vfrc-launcher__container, .vfrc-launcher__inner, .vfrc-widget__launcher, .vfrc-launcher, .vfrc-button[title="Open chat agent"], [data-testid="vfrc-launcher"], [data-voiceflow-launcher]';
    var HOST_SEL = '#voiceflow-chat, #voiceflow-chat-widget';

    document.addEventListener('click', function(e){
      var target = e.target;
      if (!target) return;

      // 1) composedPath – pokryje eventy z Shadow DOM
      var path = (typeof e.composedPath === 'function') ? e.composedPath() : [];
      for (var i = 0; i < path.length; i++){
        var n = path[i];
        if (n && n.matches && n.matches(LAUNCHER_SEL)){
          markChatOpened();
          return;
        }
      }

      // 2) Běžný DOM fallback
      if (target.closest && target.closest(LAUNCHER_SEL)){
        markChatOpened();
        return;
      }

      // 3) Shadow host fallback (#voiceflow-chat a #voiceflow-chat-widget)
      var hosts = document.querySelectorAll(HOST_SEL);
      for (var j = 0; j < hosts.length; j++){
        var host = hosts[j];
        var sr = host && host.shadowRoot;
        if (!sr) continue;
        if (sr.contains(target)){
          for (var k = 0; k < path.length; k++){
            var sn = path[k];
            if (sn && sn.matches && sn.matches(LAUNCHER_SEL)){
              markChatOpened();
              return;
            }
          }
        }
      }
    }, true);
  }

  // Pomocná funkce: sjednocené zpracování zavření chatu a naplánování re-zobrazení CTA
  function handleChatClosed(){
    rmSS(SS.CHAT_OPEN);
    chatOpen = false;
    rmSS(SS.USER_OPENED_CHAT);
    setSS(SS.CHAT_CLOSED_TIME, String(now()));
    setLS(LS.LAST_CLOSE, String(now()));
    clearTimeout(reShowTimer);
    reShowTimer = setTimeout(function(){
      if (!chatOpen && !detectChatVisible()){
        rmSS(SS.SUPPRESS);
        updateMessage();
        showCTA();
      }
    }, UX.reShowDelayMs);
  }

  // Delegovaný listener: klik na tlačítka pro zavření chatu (X v headeru, případně spodní close)
  function bindCloseButtons(){
    var CLOSE_SEL = 'button[title="Close chat agent"], [aria-label="Close"], .vfrc-header__button, .vfrc-close, .vfrc-close-button, [data-testid="vfrc-header-close"]';
    var HOST_SEL = '#voiceflow-chat, #voiceflow-chat-widget';

    document.addEventListener('click', function(e){
      var t = e.target; if (!t) return;
      var path = (typeof e.composedPath === 'function') ? e.composedPath() : [];
      // 1) composedPath
      for (var i = 0; i < path.length; i++){
        var n = path[i];
        if (n && n.matches && n.matches(CLOSE_SEL)){
          handleChatClosed();
          return;
        }
      }
      // 2) běžný DOM
      if (t.closest && t.closest(CLOSE_SEL)){
        handleChatClosed();
        return;
      }
      // 3) shadow host fallback
      var hosts = document.querySelectorAll(HOST_SEL);
      for (var j = 0; j < hosts.length; j++){
        var host = hosts[j]; var sr = host && host.shadowRoot; if (!sr) continue;
        if (sr.contains(t)){
          for (var k = 0; k < path.length; k++){
            var sn = path[k];
            if (sn && sn.matches && sn.matches(CLOSE_SEL)){
              handleChatClosed();
              return;
            }
          }
        }
      }
    }, true);
  }

  setTimeout(function(){ boot = false; }, UX.bootWindowMs);
  addEventListener('hashchange', updateMessage);

  addEventListener('message', function(evt){
    var data = evt.data;
    if (typeof data === 'string'){ try { data = JSON.parse(data); } catch{} }
    if (!data || typeof data.type !== 'string') return;

    if (data.type === 'voiceflow:open'){
      setSS(SS.CHAT_OPEN,'1');
      setSS(SS.USER_OPENED_CHAT,'1');
      setSS(SS.SUPPRESS, '1'); // při otevření chatu zakázat CTA
      chatOpen = true;
      hideCTA();
    }
    if (data.type === 'voiceflow:close'){
      rmSS(SS.CHAT_OPEN);
      chatOpen = false;
      rmSS(SS.USER_OPENED_CHAT);
      setSS(SS.CHAT_CLOSED_TIME, String(now()));
      setLS(LS.LAST_CLOSE, String(now()));
      
      // Naplánovat znovu zobrazení po 2 sekundách
      clearTimeout(reShowTimer);
      reShowTimer = setTimeout(function(){
        if (!chatOpen && !visible) {
          rmSS(SS.SUPPRESS); // Povolit znovu zobrazení
          updateMessage();
          showCTA();
        }
      }, UX.reShowDelayMs);
    }
  });

  window.PayloadWindowOnReady = function(api){
    vfReady = true;

    try{
      if (api?.proactive?.push){
        var _orig = api.proactive.push.bind(api.proactive);
        api.proactive.push = function(){ if (detectChatVisible() || chatOpen) return; return _orig.apply(api.proactive, arguments); };
      }
    }catch(_){}

    if (detectChatVisible() || getSS(SS.CHAT_OPEN)==='1'){ 
      chatOpen = true; 
      setSS(SS.CHAT_OPEN,'1'); 
      if (visible) hideCTA();
    }

    observeVF();
    startEnforcer();
    maybeShow();
  };

  function bindCTA(){
    ctaEl      = document.getElementById('vfCta');
    btnOpenEl  = document.getElementById('vfOpenChat');
    btnCloseEl = document.getElementById('vfCtaClose');
    descEl     = document.getElementById('vfCtaDesc');

    // Otevření chatbota tlačítkem
    btnOpenEl?.addEventListener('click', function(){
      try { window.voiceflow.chat.open(); } catch(_) {}
      setSS(SS.SUPPRESS, '1'); // zakázat znovu zobrazení CTA po kliknutí
      markChatOpened(); // zaznamenat otevření
    });

    // Zavření CTA
    btnCloseEl?.addEventListener('click', function(){ setSS(SS.SUPPRESS,'1'); hideCTA(); });
  }

  // Inicializace
  function init(){
    // Načíst stav z session storage
    showCount = parseInt(getSS(SS.SHOW_COUNT) || '0');
    sessionStart = parseInt(getSS(SS.SESSION_START) || String(now()));
    setSS(SS.SESSION_START, String(sessionStart));
    
    injectCSS();
    injectCTA();
    bindCTA();
    // Přidat také bind na tlačítko nebo událost, která otevře chat
    bindOpenChatButton();
    bindLauncherClick();
    bindCloseButtons();
    bindCloseButtons(); // Přidat nový bind

    scheduleDwell();
    scheduleLongStay();
    watchScroll();
    startEnforcer();
    observeVF();
    document.addEventListener('visibilitychange', function(){ if (document.visibilityState==='visible' && !metDwell) scheduleDwell(); });

    // Pokud je chat otevřen nebo flag, nezobrazuj zprávu - VŽDY skrýt
    if (detectChatVisible() || getSS(SS.CHAT_OPEN)==='1'){
      chatOpen = true;
      setSS(SS.CHAT_OPEN,'1');
      hideCTA(); // OKAMŽITĚ skrýt CTA pokud je chat otevřený
    } else {
      // Resetuj SUPPRESS pokud vypršel cooldown a chat není otevřený
      if (!within(getLS(LS.LAST_CLOSE), UX.closeCooldownMs)){
        rmSS(SS.SUPPRESS);
      }
      maybeShow();
    }
  }

  window.PayloadWindow = { show: showCTA, hide: hideCTA };
  if (document.readyState === 'loading'){ document.addEventListener('DOMContentLoaded', init); } else { init(); }

})(window, document);
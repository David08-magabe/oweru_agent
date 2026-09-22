/**
 * Oweru AI Agent — Embeddable Chat Widget
 * ==========================================
 * Drop this on oweru.com with a single <script> tag — no build step,
 * no framework dependency. It injects a floating chat launcher in the
 * bottom-right corner that talks to the Oweru agent backend.
 *
 * USAGE (paste this into the site, e.g. before </body>):
 *
 *   <script>
 *     window.OWERU_AGENT_CONFIG = {
 *       apiBaseUrl: "https://your-backend-domain.com" // no trailing slash
 *     };
 *   </script>
 *   <script src="https://your-cdn-or-host.com/oweru-widget.js"></script>
 *
 * During local testing, apiBaseUrl can be "http://localhost:4000".
 */
(function () {
  "use strict";

  const config = window.OWERU_AGENT_CONFIG || {};
  const API_BASE = config.apiBaseUrl || "http://localhost:4000";
  const AGENT_NAME = config.agentName || "Oweru Agent";
  // "full": full property-search assistant (default, used on the rental
  // platform). "general": lightweight company/area-info-only assistant,
  // for embedding on the main oweru.com corporate site.
  // This build only talks to the general-assistant backend — no mode
  // toggle needed.
  const GREETING =
    config.greeting ||
    "Habari! Karibu Oweru. Nikusaidieje leo — unatafuta kununua, kukodi, au kuuza mali?";

  // ---------------------------------------------------------------
  // Colors — matches Oweru brand (gold gradient + navy + cream)
  // ---------------------------------------------------------------
  const LOGO_DATA_URI = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADcAAAAsCAYAAADByiAeAAALoUlEQVRoQ92aCXAcxbnHf3PsrnZXK60syZIt4yMmYIxlsF12IFy2ceJnjhheeGeuygGpOEmFBBNSSZEKR1EFPJJK5QQeSXipR/FIwkuA8jMVKmCIQ8UOjiXbsmVZRtLKuo9dSXvMzpXqWc1qNFpZSuykePmVdvv7vu7p6f90b3fPjKS6petsJvmPB+5gx7ZNqKFqlGAlklLmZr2jsc0cZj6FoQ3zf68cYPe9TzjtlVxxzzzxZdZvWE8gsvQdLWQu9EwXh946xL/f8UhBnOixm27Y+v9emFfgS3t+g3TrbR+yn/z2lyiLry5mehlLjSJJkvORZRlJAkmSnTw3Lj5+vxDy+lNl5pMWbOfbdX15BTuT1SYj08klW5B++vQP7Jtv3IEaritmeHHFyZKMJE9vrHsCb+r/TOULf3rZs6UuXr9U3mzijGw/0tG39tjL3n3lrJPH+FjSqWT2jyg15QtkWaRTvjdvvqnfFpTyZxMnJhmpv3O/Ha1ZXwz6mVvcVKP8tt937bOlfltwNj+byxdtP9JQ4k27bMHlxYCfv5U4QSmhLv6Y678jxLkNKrTJI8L5Ky1qLl+Q0/Si7ee89JzbYGE71mS8lO1P3WO9cRe/7+KN/9XFFSg0tNBgb+O9tmMWyjldNrWkeFM//rjXPydxE+MpXwOnf9y4Nx8sMV8VfMQSItbHgrhCfsG3sRETq1hmrMlNYCHfh2fourjlzklcYVi6i/dMUV7fiWGjhiLIStARaZs6tqUXywkxEmZBvBxEN4UlE1QVFFnCtm1syxZHTqtX4PcFWt4o2n7mFDdbz83wbQtFVVECEbL9TUwkXiM7cITKZZuobrwdU88iByL0778fJdNEJF6DXv9PPPLzQfJKGQtra6lSNX7bmaa2ZiG7/mE1qy6oRNNNZO/F8wk87+Jceyq1UNUAlp6n/8A3GWv7BbaeATPNoo0fJb7hfgwtja6b9L56JxXKaaoXL+PNxCoe+8UotUuWI359HZ3ddBIlFovz1Fc+whVrFpPTDEecX5RLXnT9LPzZ4tzUsYQvekyRyed1ht68Dy2xB5QokqyQHBikfMUWFl37IEY+x9vH/oDU+n0qo3nUWA2vtgTZe3oxtSsuI6qY/P63+7h43UbCqsq/7ryW66/dSE7Lo8iFiadwyuki/yriCthin0Nel0ieeJbI6PNMpNJo6QzHW9N0papYc80trN1yG4NnOmj7436WZV9BCcoEymI8/7tRmswraLjoMlRTY98re1l/zTZq4nE+uH0DV25Y7Qw7sZ3zivLa5yRu2jonAh5htmViWhadrUeot/cS1NqZGBpiqC9EInAVyy+/loblFzKRHKa3o5Xu1iaWG6874mLVNfzXyz00aRtZtnodkp7l13t+xXU7bqUqFuXW92/g6o2NaHnduRtx8QoT6IaYmUvzZ4kTFBIJyzKwTJ3h4RRdzXu5es0w4z3H0LUKkqEtVF74XqLhoDNVp8dS9HWe5MzJJhpyrxEIB4jV1PDDX3Zxwt7ExY0bMHJjvPzSC2zb+S9Ux6J8YNs6rvKI84ry2udFnMBNxXRtmjp6XuPkiZPoPa+x9T02w12tENmEdMEthMIRTFtCy2mkx5P0dbZx5sRbNGj70CWTeE0NT+4Z5I3+FZQvWk59PErzgTdYuWEzFdEIn//IDja/51Ln4hSHpWe9c9ty3sS52LaJruukx1M0H26mLHWA912tMpw4RdniD6Au2i7WaQzDIpfLOeUGutroOnqAWvN3xEMDVNcv5pHnNV44sQA9XMHFSxtItB4mtLQR5CCPf2MXW9YvJ63pxQnFf5EFhll8BDSDeYkTTPWahWma5PMayeFBjh1tgcE/cNOWAOP9bYTqriO68mMYRt65qrlslvRYkt6Ok7Q37Wdl5CBhe4jymkXsfmKEluyF6OEYNeEAw30JosvWECuv4KkHdrFmZT0534TiT8+LOJfCkDTIazlGhgZpPdHCaMcxtm+cIB4ZIzU8wcJN96BUXk4+N042PcHY2AQnDh/E7P5fFgfaKAvKHO8LcN/PDCbKVyBFFqD1nSK6oBYzupB1jWv4yYO3UxYKONsydxH3CxOYs4/KucW5jxkEztZoUpym5UiOjnCypZmh/iEWW3/k+s1VDLQfx5KjVF70j6gVl5DLSwyfOUGy9VcEJo5iGgaRaJTdT/bRo1zCkBVDwUAf7KR+9RUMTOg8fPcn+dRtWxhP55w1VJzfK8jrn7M4L1PiNNIT47QdP8rAwACZgS4aq9tYdVGI4cRptPQYEMImgJFLYRk6thx09pDfe2GYfYlapAXLGZnIwchp6lc20puRuWnrVfznQ5/3bLadTa0zjfgFCix7KubnLxJnWZbzm8tmM/R0J2hvbSGTt0i9fZgVoeO8a1Ee2dIwjTyWYWLZMpYF4+MaLx7Q2Nddg125lM7+FDFjkGhVHUkq2XbVOr77wJ1UVVVgWfa0JaAozF1vJxGb7tmYU1wqOTLtirniDKMwNMdSSbo63uZMopNMziTVcxp16CBxpZ94xCKgSgQCYUbSKi1DcQ72BelNWmR0ibqYjW4plFUtYef297Lr47c5Q9a2QVGUGcL8qeCcxQnc+sSJC0OzsByI3kulUvT29NDf20M6qzGWGmd8qBtjfBBVtghE4kRql1O+YCGn2toYn8iy6t0rMC0dwwqwbes1rLl0FUgKiqKiqqLBs8+QXnHimNmYtzg/ovcKS0KebDaLoecZHU0yNpZCz+cRa6th2QSDIaLRKLFo2OllQV1drTOF67pBQ0M9sViFMwRlWSEQUJ0L6N1yCWYKE+LPp7jJ8e7Omq5AQUeil4ryMIoM6UzOGTChoLhhBVVVnA1wJFyGqqoMjIzRUFdNQFWRFdXZn5qWzYJ4BXndIBQMOL64efX20kyB4kmFWrT9zCkuOTo8VZlHnEAIE1f60e/8iP959jmu2Xw9X/3i7byx/01OdY9QHlZIjudZWF3Bwtpqbth6JQ9+6wn2vLSXG3fewn1338Ghw8088L3n+PSHd7L96st49PGf8+kP38yTz7zIro//M7VV5RimNfnMxW3GlDhZCRRtP/MTJwxPhQLRayJy/GQ7d937KDs3r+X1Q23csGMHi+IqP/7Zr3m7sxNZDrDkggt47BtfoK9/kM/svo/ygIUaifPTxx/jN6++xu+PdfH4w/fQ3NzED595mXt2/Rv3f/MpHvr6bpbUxdENc0avuek5ixMU6ipU6Ewolkkum6Op+Qg/euZFopEwnd1nuOtzn6IirPL0s7+kp3eAeCxM/dIL+eqdn2Df62/w9HN7yaTTNK5t5N677uDp/36OvqTGQ1/7LIcPHXLya+oaONWZ4LsP3U15JOQsC0KMt8dcW1ELQ78Uc4obHRmaVqnAnS0zmSwdHR20nz5N87E2rt96HRvXryXRfYbuMz3OxCDu1FdfcgmRSJi2U6dob2+nu3eEnTfvYMmihRx86xBV1TWsvXQViUSCI0eO0HKqhw/eciOXrnqXc4fvTi6lxKmB0GRkJvMS5+JW6E4mYq1LZzLO7BiPVxIKhdC0vCNcvBEST7GCoRABRSGnaeS0HHpep7a22nnmIi6O+M1GwmGyOc1ZWvK6TnVVJYFA8Kx34edF3MjwoJN6TyBwZ0x3chGIMv6GeH1RVvSCSEXc3YGIKtxiri9E+XvMnwoCwdJvpwRzihseGphWmWu7DfTiP7k/38Wf7y3njZWMF5xCEAiGwkXbz7zECUo1xKVU3my2i4jNVsa1/ceVKnNO4oYG+2ecrNRJ5ooJSpWZYXvWM8Fs5VxCZZGi7WfOl4/zF+d8+2JT5QSljvPbLvPNP6u4uV4bC3HO9XRuqyZPMrlTcfHHz9aw+eZ5ceMi9f/Wy8LRou3FeW081wv/grjpJ/CmLjPinidVjuspP5st8PuCUjGXcKS8aHtxXvjP9a8aU+Kc70l7euoifG9sNtvb8/46XPxxv+8ymzjnXzX+nv/J5k8g/a7qCYs1ygAAAABJRU5ErkJggg==";
  const PROACTIVE_GREETING =
    config.proactiveGreeting ||
    "Habari! Naweza kukusaidia kupata mali unayoitafuta. Bofya hapa kuanza.";
  const COLORS = {
    goldStart: "#A97C1E",
    goldMid: "#D4A836",
    goldEnd: "#F2C94C",
    navy: "#14213D",
    navySoft: "#2A3A5C",
    cream: "#F9F8F6",
    white: "#FFFFFF",
    borderGray: "#E7E3DB",
  };

  // ---------------------------------------------------------------
  // Session ID — persists per browser so the agent keeps context
  // across page reloads within the same visit.
  // ---------------------------------------------------------------
  function getSessionId() {
    const key = "oweru_agent_session_id";
    let id = localStorage.getItem(key);
    if (!id) {
      id =
        "web-" +
        Date.now().toString(36) +
        "-" +
        Math.random().toString(36).slice(2, 10);
      localStorage.setItem(key, id);
    }
    return id;
  }

  let sessionId = getSessionId();

  // ---------------------------------------------------------------
  // Styles
  // ---------------------------------------------------------------
  const style = document.createElement("style");
  style.textContent = `
    #oweru-widget-root * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    #oweru-widget-root { position: fixed; bottom: 20px; right: 20px; z-index: 999999; }

    #oweru-launcher {
      width: 60px; height: 60px; border-radius: 50%;
      background: linear-gradient(135deg, ${COLORS.goldStart}, ${COLORS.goldMid}, ${COLORS.goldEnd});
      box-shadow: 0 4px 16px rgba(20, 33, 61, 0.35);
      border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s ease;
    }
    #oweru-launcher:hover { transform: scale(1.06); }
    #oweru-launcher svg { width: 28px; height: 28px; }

    #oweru-panel {
      display: none;
      flex-direction: column;
      position: absolute; bottom: 76px; right: 0;
      width: 360px; max-width: calc(100vw - 32px);
      height: 520px; max-height: calc(100vh - 120px);
      background: ${COLORS.cream};
      border-radius: 16px;
      box-shadow: 0 12px 36px rgba(20, 33, 61, 0.28);
      overflow: hidden;
      border: 1px solid ${COLORS.borderGray};
    }
    #oweru-panel.open { display: flex; }

    #oweru-header {
      background: linear-gradient(120deg, ${COLORS.goldStart}, ${COLORS.goldMid} 55%, ${COLORS.goldEnd});
      padding: 16px 16px;
      display: flex; align-items: center; justify-content: space-between;
      flex-shrink: 0;
    }
    #oweru-header-info { display: flex; align-items: center; gap: 10px; }
    #oweru-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: ${COLORS.white};
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; overflow: hidden;
    }
    #oweru-avatar img { width: 100%; height: 100%; object-fit: cover; }
    #oweru-header-text { color: ${COLORS.navy}; }
    #oweru-header-name { font-weight: 700; font-size: 15px; line-height: 1.2; }
    #oweru-header-status { font-size: 12px; opacity: 0.85; display: flex; align-items: center; gap: 4px; }
    #oweru-header-status::before {
      content: ""; width: 7px; height: 7px; border-radius: 50%;
      background: #2E7D32; display: inline-block;
    }
    #oweru-header-actions { display: flex; align-items: center; gap: 2px; flex-shrink: 0; }
    #oweru-new-chat {
      background: none; border: none; cursor: pointer; color: ${COLORS.navy};
      width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
      border-radius: 50%; opacity: 0.75;
    }
    #oweru-new-chat:hover { opacity: 1; background: rgba(20,33,61,0.08); }
    #oweru-close {
      background: none; border: none; cursor: pointer; color: ${COLORS.navy};
      width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
      border-radius: 50%; opacity: 0.75;
    }
    #oweru-close:hover { opacity: 1; background: rgba(20,33,61,0.08); }

    #oweru-messages {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 10px;
      background: ${COLORS.cream};
    }
    .oweru-msg { max-width: 82%; padding: 10px 13px; border-radius: 14px; font-size: 13.5px; line-height: 1.45; white-space: pre-wrap; }
    .oweru-msg-row { display: flex; align-items: flex-end; gap: 6px; align-self: flex-start; max-width: 88%; }
    .oweru-msg-avatar { width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0; object-fit: cover; background: ${COLORS.white}; }
    .oweru-msg-row .oweru-msg.agent { max-width: none; flex: 1; min-width: 0; align-self: auto; }
    .oweru-msg.agent {
      align-self: flex-start;
      background: ${COLORS.white};
      color: ${COLORS.navy};
      border: 1px solid ${COLORS.borderGray};
      border-bottom-left-radius: 4px;
    }
    .oweru-msg.user {
      align-self: flex-end;
      background: ${COLORS.navy};
      color: ${COLORS.white};
      border-bottom-right-radius: 4px;
    }
    .oweru-msg.typing { align-self: flex-start; display: flex; gap: 4px; padding: 12px 14px; }
    .oweru-msg.typing span {
      width: 6px; height: 6px; border-radius: 50%; background: ${COLORS.navySoft};
      opacity: 0.4; animation: oweru-bounce 1.2s infinite;
    }
    .oweru-msg.typing span:nth-child(2) { animation-delay: 0.15s; }
    .oweru-msg.typing span:nth-child(3) { animation-delay: 0.3s; }
    @keyframes oweru-bounce { 0%, 60%, 100% { opacity: 0.4; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-3px); } }

    .oweru-feedback { display: flex; gap: 4px; margin-top: 2px; align-self: flex-start; }
    .oweru-feedback-btn {
      background: none; border: none; cursor: pointer; padding: 4px;
      border-radius: 6px; display: flex; align-items: center; justify-content: center;
      color: ${COLORS.navySoft}; opacity: 0.55;
    }
    .oweru-feedback-btn:hover { opacity: 0.9; background: rgba(20,33,61,0.06); }
    .oweru-feedback-btn.active.up { opacity: 1; color: #2E7D32; }
    .oweru-feedback-btn.active.down { opacity: 1; color: #B00020; }
    .oweru-feedback-btn:disabled { cursor: default; }
    .oweru-feedback-btn svg { width: 14px; height: 14px; }

    .oweru-property-card {
      display: flex; flex-direction: column; width: 220px; max-width: 78%;
      background: ${COLORS.white}; border: 1px solid ${COLORS.borderGray};
      border-radius: 12px; overflow: hidden; align-self: flex-start; margin-top: 2px;
    }
    .oweru-property-card img {
      width: 100%; height: 120px; object-fit: cover; display: block; background: ${COLORS.borderGray};
    }
    .oweru-property-card-body { padding: 8px 10px; }
    .oweru-property-card-title {
      font-size: 12.5px; font-weight: 700; color: ${COLORS.navy}; line-height: 1.3;
      margin-bottom: 3px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .oweru-property-card-meta { font-size: 11.5px; color: #777; margin-bottom: 3px; }
    .oweru-property-card-price { font-size: 13px; font-weight: 700; color: ${COLORS.goldStart}; }
    .oweru-property-cards-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 2px; }

    .oweru-msg.agent .oweru-link {
      color: ${COLORS.goldStart}; font-weight: 600; text-decoration: underline;
      word-break: break-word;
    }
    .oweru-msg.agent .oweru-link:hover { color: ${COLORS.goldEnd}; }

    #oweru-input-row {
      display: flex; align-items: center; gap: 8px;
      padding: 12px; border-top: 1px solid ${COLORS.borderGray};
      background: ${COLORS.white}; flex-shrink: 0;
    }
    #oweru-input {
      flex: 1; border: 1px solid ${COLORS.borderGray}; border-radius: 20px;
      padding: 10px 14px; font-size: 13.5px; outline: none; color: ${COLORS.navy};
    }
    #oweru-input:focus { border-color: ${COLORS.goldMid}; }
    #oweru-send {
      width: 38px; height: 38px; border-radius: 50%; border: none; cursor: pointer;
      background: linear-gradient(135deg, ${COLORS.goldStart}, ${COLORS.goldEnd});
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    #oweru-send:disabled { opacity: 0.5; cursor: default; }
    #oweru-send svg { width: 16px; height: 16px; }

    @media (max-width: 420px) {
      #oweru-panel { width: calc(100vw - 32px); }
    }

    #oweru-greeting-bubble {
      display: none;
      position: absolute; bottom: 76px; right: 0;
      max-width: 240px;
      background: ${COLORS.navy};
      color: ${COLORS.white};
      padding: 12px 28px 12px 14px;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(20, 33, 61, 0.3);
      font-size: 13px; line-height: 1.45;
      cursor: pointer;
    }
    #oweru-greeting-bubble.show { display: block; animation: oweru-greeting-in 0.25s ease; }
    @keyframes oweru-greeting-in {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    #oweru-greeting-close {
      position: absolute; top: 6px; right: 6px;
      background: none; border: none; cursor: pointer; color: rgba(255,255,255,0.7);
      width: 18px; height: 18px; display: flex; align-items: center; justify-content: center;
      border-radius: 50%;
    }
    #oweru-greeting-close:hover { color: white; background: rgba(255,255,255,0.15); }
  `;
  document.head.appendChild(style);

  // ---------------------------------------------------------------
  // DOM structure
  // ---------------------------------------------------------------
  const root = document.createElement("div");
  root.id = "oweru-widget-root";
  root.innerHTML = `
    <div id="oweru-panel">
      <div id="oweru-header">
        <div id="oweru-header-info">
          <div id="oweru-avatar"><img src="${LOGO_DATA_URI}" alt="Oweru" /></div>
          <div id="oweru-header-text">
            <div id="oweru-header-name">${AGENT_NAME}</div>
            <div id="oweru-header-status">Iko mtandaoni</div>
          </div>
        </div>
        <div id="oweru-header-actions">
          <button id="oweru-new-chat" aria-label="Anza mazungumzo mapya" title="Anza mazungumzo mapya">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
              <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
              <path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
            </svg>
          </button>
          <button id="oweru-close" aria-label="Funga">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
      <div id="oweru-messages"></div>
      <div id="oweru-input-row">
        <input id="oweru-input" type="text" placeholder="Andika ujumbe wako..." autocomplete="off" />
        <button id="oweru-send" aria-label="Tuma">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/>
          </svg>
        </button>
      </div>
    </div>
    <div id="oweru-greeting-bubble">
      <button id="oweru-greeting-close" aria-label="Funga ujumbe">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
          <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
      </button>
      <div id="oweru-greeting-text">${PROACTIVE_GREETING}</div>
    </div>
    <button id="oweru-launcher" aria-label="Fungua mazungumzo">
      <svg viewBox="0 0 24 24" fill="none" stroke="#14213D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
      </svg>
    </button>
  `;
  document.body.appendChild(root);

  const panel = root.querySelector("#oweru-panel");
  const launcher = root.querySelector("#oweru-launcher");
  const closeBtn = root.querySelector("#oweru-close");
  const newChatBtn = root.querySelector("#oweru-new-chat");
  const messagesEl = root.querySelector("#oweru-messages");
  const inputEl = root.querySelector("#oweru-input");
  const sendBtn = root.querySelector("#oweru-send");
  const greetingBubble = root.querySelector("#oweru-greeting-bubble");
  const greetingCloseBtn = root.querySelector("#oweru-greeting-close");
  const greetingText = root.querySelector("#oweru-greeting-text");

  let hasOpenedOnce = false;

  function formatPrice(amount, currency) {
    const num = Number(amount);
    if (Number.isNaN(num)) return amount + " " + currency;
    return num.toLocaleString("en-US") + " " + currency;
  }

  function addPropertyCards(properties) {
    if (!properties || properties.length === 0) return;

    const row = document.createElement("div");
    row.className = "oweru-property-cards-row";

    properties.forEach((p) => {
      const card = document.createElement("div");
      card.className = "oweru-property-card";

      const img = document.createElement("img");
      img.src = (p.imageUrls && p.imageUrls[0]) || "";
      img.alt = p.title || "Property photo";
      img.loading = "lazy";
      img.onerror = function () {
        this.style.display = "none";
      };

      const body = document.createElement("div");
      body.className = "oweru-property-card-body";

      const title = document.createElement("div");
      title.className = "oweru-property-card-title";
      title.textContent = p.title || "";

      const meta = document.createElement("div");
      meta.className = "oweru-property-card-meta";
      const bits = [];
      if (p.bedrooms) bits.push(p.bedrooms + " BR");
      if (p.neighborhood) bits.push(p.neighborhood);
      else if (p.region) bits.push(p.region);
      meta.textContent = bits.join(" · ");

      const price = document.createElement("div");
      price.className = "oweru-property-card-price";
      price.textContent = formatPrice(p.priceAmount, p.priceCurrency);

      body.appendChild(title);
      body.appendChild(meta);
      body.appendChild(price);
      card.appendChild(img);
      card.appendChild(body);
      row.appendChild(card);
    });

    messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function formatMessage(text) {
    const escaped = escapeHtml(text);

    // Convert **bold** markdown into real <strong> tags — the model
    // sometimes emits this syntax despite instructions not to, so instead
    // of fighting it, we render it properly rather than showing raw
    // asterisks to the visitor.
    const bolded = escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

    const urlPattern = /(https?:\/\/[^\s<]+[^\s<.,;:!?)\]'"])/g;
    const linked = bolded.replace(
      urlPattern,
      (url) =>
        `<a href="${url}" target="_blank" rel="noopener noreferrer" class="oweru-link">${url}</a>`
    );

    // Preserve line breaks the model uses to separate list items/paragraphs
    return linked.replace(/\n/g, "<br>");
  }

  function addMessage(role, text, messageId) {
    const el = document.createElement("div");
    el.className = "oweru-msg " + role;
    if (role === "agent") {
      el.innerHTML = formatMessage(text);
    } else {
      el.textContent = text;
    }

    if (role === "agent") {
      const row = document.createElement("div");
      row.className = "oweru-msg-row";
      const avatar = document.createElement("img");
      avatar.className = "oweru-msg-avatar";
      avatar.src = LOGO_DATA_URI;
      avatar.alt = "Oweru";
      row.appendChild(avatar);
      row.appendChild(el);
      messagesEl.appendChild(row);
    } else {
      messagesEl.appendChild(el);
    }

    if (role === "agent" && messageId) {
      messagesEl.appendChild(buildFeedbackRow(messageId));
    }

    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
  }

  function buildFeedbackRow(messageId) {
    const row = document.createElement("div");
    row.className = "oweru-feedback";

    const upBtn = document.createElement("button");
    upBtn.className = "oweru-feedback-btn up";
    upBtn.setAttribute("aria-label", "Jibu zuri");
    upBtn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/></svg>';

    const downBtn = document.createElement("button");
    downBtn.className = "oweru-feedback-btn down";
    downBtn.setAttribute("aria-label", "Jibu si zuri");
    downBtn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z"/></svg>';

    function choose(rating, chosenBtn, otherBtn) {
      chosenBtn.classList.add("active");
      chosenBtn.disabled = true;
      otherBtn.disabled = true;
      sendFeedback(messageId, rating);
    }

    upBtn.addEventListener("click", () => choose("up", upBtn, downBtn));
    downBtn.addEventListener("click", () => choose("down", downBtn, upBtn));

    row.appendChild(upBtn);
    row.appendChild(downBtn);
    return row;
  }

  async function sendFeedback(messageId, rating) {
    try {
      await fetch(API_BASE + "/agent/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, feedback: rating }),
      });
    } catch (err) {
      console.error("Oweru widget feedback error:", err);
    }
  }

  function addHandoffButton(handoff) {
    if (!handoff) return;
    const wrapper = document.createElement("div");
    wrapper.className = "oweru-msg agent";
    wrapper.style.padding = "10px";

    const link = document.createElement("a");
    link.style.cssText =
      "display:flex;align-items:center;justify-content:center;gap:8px;" +
      "padding:10px 14px;border-radius:20px;text-decoration:none;" +
      "font-size:13.5px;font-weight:600;color:" +
      COLORS.navy +
      ";background:linear-gradient(135deg," +
      COLORS.goldStart +
      "," +
      COLORS.goldEnd +
      ");";

    if (handoff.channel === "whatsapp" && handoff.whatsappUrl) {
      link.href = handoff.whatsappUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Fungua WhatsApp";
    } else if (handoff.phoneNumber) {
      link.href = "tel:" + handoff.phoneNumber;
      link.textContent = "Piga simu: " + handoff.phoneNumber;
    } else {
      return;
    }

    wrapper.appendChild(link);
    messagesEl.appendChild(wrapper);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    const el = document.createElement("div");
    el.className = "oweru-msg typing";
    el.innerHTML = "<span></span><span></span><span></span>";
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
  }

  function openPanel() {
    panel.classList.add("open");
    hideGreetingBubble();
    if (!hasOpenedOnce) {
      hasOpenedOnce = true;
      addMessage("agent", GREETING);
    }
    inputEl.focus();
  }

  function closePanel() {
    panel.classList.remove("open");
    if (hasOpenedOnce) {
      // Visitor already engaged with the chat this session — hide the
      // teaser for the rest of THIS visit, but it's free to appear again
      // on their next page load (no permanent localStorage dismissal here).
      hideGreetingBubble();
    }
  }

  launcher.addEventListener("click", () => {
    if (panel.classList.contains("open")) {
      closePanel();
    } else {
      openPanel();
    }
  });
  closeBtn.addEventListener("click", closePanel);

  // -----------------------------------------------------------
  // Proactive greeting bubble — pops up near the launcher after a
  // short delay to invite the visitor in, like a typical chat-widget
  // teaser. Dismissed permanently (this browser) if the visitor closes
  // it with the × instead of engaging.
  // -----------------------------------------------------------
  const GREETING_DISMISSED_KEY = "oweru_greeting_dismissed";

  function hideGreetingBubble() {
    greetingBubble.classList.remove("show");
  }

  function showGreetingBubbleIfEligible() {
    if (hasOpenedOnce) return; // don't show once a conversation has started
    if (localStorage.getItem(GREETING_DISMISSED_KEY)) return;
    if (panel.classList.contains("open")) return;
    greetingBubble.classList.add("show");
  }

  if (greetingText.textContent.trim()) {
    setTimeout(showGreetingBubbleIfEligible, 2500);
  }

  greetingBubble.addEventListener("click", () => {
    openPanel();
  });

  greetingCloseBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // don't also trigger the bubble's own "open chat" click
    hideGreetingBubble();
    localStorage.setItem(GREETING_DISMISSED_KEY, "1");
  });

  function startNewConversation() {
    sessionId =
      "web-" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2, 10);
    localStorage.setItem("oweru_agent_session_id", sessionId);
    messagesEl.innerHTML = "";
    addMessage("agent", GREETING);
  }

  newChatBtn.addEventListener("click", startNewConversation);

  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text) return;

    addMessage("user", text);
    inputEl.value = "";
    sendBtn.disabled = true;
    const typingEl = showTyping();

    try {
      const res = await fetch(API_BASE + "/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: text }),
      });

      if (!res.ok) throw new Error("Request failed: " + res.status);
      const data = await res.json();

      typingEl.remove();
      addMessage("agent", data.reply || "Samahani, sikuweza kupata jibu.", data.messageId);
      addPropertyCards(data.properties);

      if (data.escalated) {
        addMessage(
          "agent",
          "Nakuunganisha na mwanachama wa timu yetu kwa msaada zaidi:"
        );
        addHandoffButton(data.handoff);
      }
    } catch (err) {
      typingEl.remove();
      addMessage(
        "agent",
        "Samahani, kuna tatizo la muunganisho kwa sasa. Tafadhali jaribu tena baadaye, au wasiliana nasi moja kwa moja."
      );
      console.error("Oweru widget error:", err);
    } finally {
      sendBtn.disabled = false;
      inputEl.focus();
    }
  }

  sendBtn.addEventListener("click", sendMessage);
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
})();

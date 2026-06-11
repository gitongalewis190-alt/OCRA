/* ============================================================
   NOTIFICATIONS MODULE
   In-app notification queue, toast renderer, badge counter.
   ============================================================ */
window.OCRA = window.OCRA || {};
(function (O) {
  "use strict";

  var N = (O.notifications = {});

  N.queue = [];
  N.unreadCount = 0;

  N.TYPES = { INFO: "info", SUCCESS: "success", WARNING: "warning", ERROR: "error" };

  N.push = function (message, type, options) {
    type = type || N.TYPES.INFO;
    options = options || {};
    var note = {
      id: Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      message: message,
      type: type,
      timestamp: new Date().toISOString(),
      read: false,
      persistent: !!options.persistent,
      action: options.action || null,
      actionLabel: options.actionLabel || null,
    };
    N.queue.unshift(note);
    if (N.queue.length > 50) N.queue.pop();
    N.unreadCount++;
    N.showToast(note);
    N.updateBadge();
    return note.id;
  };

  N.markRead = function (id) {
    N.queue.forEach(function (n) {
      if (n.id === id && !n.read) { n.read = true; N.unreadCount = Math.max(0, N.unreadCount - 1); }
    });
    N.updateBadge();
  };

  N.markAllRead = function () {
    N.queue.forEach(function (n) { n.read = true; });
    N.unreadCount = 0;
    N.updateBadge();
  };

  N.updateBadge = function () {
    var el = document.getElementById("nBadge");
    if (!el) return;
    el.textContent = N.unreadCount;
    el.style.display = N.unreadCount > 0 ? "flex" : "none";
  };

  N.showToast = function (note) {
    if (O.state && O.state.phase === "intro") return;
    var container = document.getElementById("toastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.style.cssText = "position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;max-width:340px;pointer-events:none";
      document.body.appendChild(container);
    }

    var colors = { info: "#0E6BA8", success: "#34C759", warning: "#F5B301", error: "#FF3B30" };
    var icons  = { info: "&#9432;", success: "&#10003;", warning: "&#9888;", error: "&#9888;" };

    var toast = document.createElement("div");
    toast.style.cssText = "background:#fff;border-left:4px solid " + (colors[note.type] || colors.info) + ";" +
      "border-radius:12px;padding:12px 16px;box-shadow:0 4px 18px rgba(16,58,85,.18);" +
      "font-family:-apple-system,system-ui,sans-serif;font-size:13px;color:#103A55;" +
      "pointer-events:all;display:flex;align-items:flex-start;gap:10px;transition:opacity .3s";
    toast.innerHTML =
      '<span style="font-size:16px;color:' + (colors[note.type] || colors.info) + '">' + (icons[note.type] || icons.info) + '</span>' +
      '<div style="flex:1">' + String(note.message).replace(/</g, "&lt;").replace(/>/g, "&gt;") + '</div>' +
      '<button onclick="this.closest(\'div\').remove()" style="background:none;border:none;cursor:pointer;font-size:16px;color:#5B7689;line-height:1;padding:0">&times;</button>';

    container.appendChild(toast);

    if (!note.persistent) {
      setTimeout(function () {
        toast.style.opacity = "0";
        setTimeout(function () { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
      }, 4000);
    }
  };

  N.renderPanel = function () {
    N.markAllRead();
    if (N.queue.length === 0) {
      return '<div class="muted" style="text-align:center;padding:20px;font-size:13px">No notifications yet.</div>';
    }
    return N.queue.map(function (n) {
      var colors = { info: "var(--ocean)", success: "var(--green)", warning: "var(--amber)", error: "var(--red)" };
      return '<div style="padding:12px 0;border-bottom:1px solid rgba(16,58,85,.07);' + (n.read ? "opacity:.65" : "") + '">' +
        '<div style="font-size:13px;color:var(--ink);margin-bottom:4px">' + O.esc(n.message) + '</div>' +
        '<div class="muted" style="font-size:10px">' + new Date(n.timestamp).toLocaleTimeString() + '</div>' +
      '</div>';
    }).join("");
  };

  // Pre-seed a welcome notification
  setTimeout(function () {
    N.push("Welcome to OCRA. Your session is secure and ready.", N.TYPES.INFO);
  }, 1500);

  console.log("✅ Notifications Module Loaded — toast + queue + badges");

})(window.OCRA);

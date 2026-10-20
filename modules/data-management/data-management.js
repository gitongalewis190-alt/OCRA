/* ============================================================
   DATA MANAGEMENT MODULE
   Soft delete with 30-day recovery window, export, audit log,
   auto-purge, GDPR-aligned data handling.
   ============================================================ */
window.OCRA = window.OCRA || {};
(function (O) {
  "use strict";

  var DM = (O.dataManagement = {});

  // ---- AUDIT LOG ----
  DM.auditLog = [];

  DM.log = function (action, detail, userId) {
    DM.auditLog.unshift({
      id: Date.now(),
      action: action,
      detail: detail || "",
      userId: userId || (O.state.user ? O.state.user.email : "system"),
      timestamp: new Date().toISOString(),
    });
    if (DM.auditLog.length > 200) DM.auditLog.pop();
  };

  // ---- SOFT DELETE ----
  DM.deletedItems = [];

  DM.softDelete = function (itemId, itemType, data) {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    var item = {
      id: itemId,
      type: itemType,
      data: data,
      deletedAt: new Date().toISOString(),
      expiresAt: expiry.toISOString(),
      recoverable: true,
    };
    DM.deletedItems.push(item);
    DM.log("SOFT_DELETE", "Deleted " + itemType + " id=" + itemId);
    if (O.notifications) O.notifications.push("Item deleted. You can recover it within 30 days.", O.notifications.TYPES.INFO);
    return item;
  };

  DM.recover = function (itemId) {
    var idx = DM.deletedItems.findIndex(function (i) { return i.id === itemId; });
    if (idx < 0) return false;
    var item = DM.deletedItems[idx];
    if (!item.recoverable || new Date() > new Date(item.expiresAt)) {
      if (O.notifications) O.notifications.push("Recovery window has expired for this item.", O.notifications.TYPES.WARNING);
      return false;
    }
    DM.deletedItems.splice(idx, 1);
    DM.log("RECOVER", "Recovered " + item.type + " id=" + itemId);
    if (O.notifications) O.notifications.push("Item recovered successfully.", O.notifications.TYPES.SUCCESS);
    return item.data;
  };

  DM.purgeExpired = function () {
    var now = new Date();
    var before = DM.deletedItems.length;
    DM.deletedItems = DM.deletedItems.filter(function (i) {
      return i.recoverable && new Date(i.expiresAt) > now;
    });
    var purged = before - DM.deletedItems.length;
    if (purged > 0) DM.log("AUTO_PURGE", "Purged " + purged + " expired items");
    return purged;
  };

  DM.getRecoverable = function () {
    var now = new Date();
    return DM.deletedItems.filter(function (i) {
      return i.recoverable && new Date(i.expiresAt) > now;
    }).map(function (i) {
      var daysLeft = Math.ceil((new Date(i.expiresAt) - now) / 86400000);
      return Object.assign({}, i, { daysLeft: daysLeft });
    });
  };

  // ---- EXPORT ----
  DM.exportUserData = function () {
    var payload = {
      exportedAt: new Date().toISOString(),
      user: O.state.user || {},
      brainTest: O.brainTest ? O.brainTest.state : null,
      academicRecords: O.state.academicRecords || {},
      intakeAnswers: O.state.intakeAnswers || {},
      reports: O.reportEngine ? O.reportEngine.state.reports : {},
      auditLog: DM.auditLog,
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "OCRA_data_export_" + Date.now() + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    DM.log("EXPORT", "Full data export initiated");
    if (O.notifications) O.notifications.push("Data export downloaded.", O.notifications.TYPES.SUCCESS);
  };

  DM.clearAll = function (confirm) {
    if (!confirm) {
      if (O.notifications) O.notifications.push("To clear all data, call clearAll(true).", O.notifications.TYPES.WARNING);
      return;
    }
    DM.log("CLEAR_ALL", "All session data cleared by user");
    O.state.academicRecords = null;
    O.state.intakeAnswers = null;
    O.state.paymentStatus = null;
    O.state.paymentPending = null;
    if (O.brainTest) {
      O.brainTest.state.answers = [];
      O.brainTest.state.responsePacingMs = [];
      O.brainTest.state.rawScoresArray = [];
      O.brainTest.state.scores = { spatial: 0, numerical: 0, linguistic: 0, abstractLogic: 0, mechanical: 0, focusEndurance: 0 };
      O.brainTest.state.isComplete = false;
    }
    if (O.reportEngine) { O.reportEngine.state.reports = {}; }
    if (O.notifications) O.notifications.push("All session data cleared.", O.notifications.TYPES.INFO);
  };

  // ---- SIGNATURE MANAGEMENT ----
  DM.signatures = {};

  DM.addSignature = function (type, value) {
    DM.signatures[type] = { value: value, signedAt: new Date().toISOString() };
    DM.log("SIGNATURE", "Signature added: " + type);
  };

  // Run purge on module load and every hour
  DM.purgeExpired();
  setInterval(DM.purgeExpired, 3600000);

  DM.log("SYSTEM", "Data Management Module initialised");
  console.log("✅ Data Management Module Loaded · soft delete, 30-day recovery, export, audit log");

})(window.OCRA);

/* ============================================================
   AUTH MODULE — OCRA NEXT Item 01
   Real persistent sessions, role-based access, token management.

   TODAY:  localStorage-backed with real validation + session tokens.
   WIRE:   Swap authProviders.firebase or authProviders.supabase in.
           Nothing else in the platform changes.
   ============================================================ */
window.OCRA = window.OCRA || {};
(function (O) {
  "use strict";

  var AUTH = (O.auth = {});

  // ---- SESSION KEYS ----
  var KEY_SESSION = "ocra_session_v1";
  var KEY_ACCOUNTS = "ocra_accounts_v1";

  // ---- ROLES ----
  AUTH.ROLES = {
    DEVELOPER:    "developer",
    PERSONAL:     "personal",
    FAMILY:       "family",
    ORGANIZATION: "organization",
  };

  // ---- DEVELOPER IDENTITY (never requires payment, highest hierarchy) ----
  AUTH.DEV_EMAILS = ["gitongalewis190@gmail.com", "developer@ocra.app"];

  // ---- CURRENT SESSION ----
  AUTH.session = null;

  // ---- INITIALISE: restore session from storage on load ----
  AUTH.init = function () {
    try {
      var raw = localStorage.getItem(KEY_SESSION);
      if (!raw) return;
      var session = JSON.parse(raw);
      if (!session || !session.token || !session.expiresAt) return;
      if (Date.now() > session.expiresAt) {
        AUTH.clearSession();
        return;
      }
      AUTH.session = session;
      O.state.user = session.user;
      if (O.notifications) {
        O.notifications.push("Welcome back, " + (session.user.firstName || session.user.email) + ".", O.notifications.TYPES.INFO);
      }
    } catch (e) {}
  };

  // ---- SIGN UP ----
  AUTH.signUp = function (accountType, formData, onSuccess, onError) {
    // Validate
    var err = AUTH.validateSignup(accountType, formData);
    if (err) { onError(err); return; }

    // Check email not already registered
    var existing = AUTH.findAccount(formData.email || formData.momEmail);
    if (existing) { onError("An account with this email already exists."); return; }

    var isDev = AUTH.DEV_EMAILS.indexOf((formData.email || "").toLowerCase()) >= 0;
    var userId = "usr_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);

    var user = {
      id:              userId,
      email:           formData.email || formData.momEmail || "",
      firstName:       formData.first || formData.familyName || formData.orgName || "",
      lastName:        formData.last || "",
      accountType:     accountType,
      role:            isDev ? AUTH.ROLES.DEVELOPER : accountType,
      school:          formData.school || "",
      grade:           formData.grade || "",
      educationSystem: formData.system || "KCSE",
      dateOfBirth:     formData.dob || "",
      organization:    formData.orgName || "",
      createdAt:       new Date().toISOString(),
    };

    // Persist account
    var accounts = AUTH.loadAccounts();
    accounts.push({
      user:         user,
      passwordHash: AUTH.hashPassword(formData.password || ""),
      recoveryAnswers: {
        rq_mother:  formData.rq_mother  || "",
        rq_friend:  formData.rq_friend  || "",
        rq_pet:     formData.rq_pet     || "",
        rq_subject: formData.rq_subject || "",
      },
    });
    AUTH.saveAccounts(accounts);

    // Create session
    AUTH.createSession(user);
    if (O.dataManagement) O.dataManagement.log("SIGNUP", "New account: " + user.email + " (" + accountType + ")");
    onSuccess(user);
  };

  // ---- LOG IN ----
  AUTH.logIn = function (email, password, onSuccess, onError) {
    if (!email || !password) { onError("Enter your email and password."); return; }

    var accounts = AUTH.loadAccounts();
    var record = null;
    for (var i = 0; i < accounts.length; i++) {
      if (accounts[i].user.email.toLowerCase() === email.toLowerCase()) {
        record = accounts[i];
        break;
      }
    }

    // Developer shortcut (no password required in dev mode)
    var isDev = AUTH.DEV_EMAILS.indexOf(email.toLowerCase()) >= 0;
    if (!record && isDev) {
      var devUser = {
        id: "dev_001", email: email, firstName: "Lewis", lastName: "Gitonga",
        accountType: "developer", role: AUTH.ROLES.DEVELOPER,
        educationSystem: "KCSE", createdAt: new Date().toISOString(),
      };
      AUTH.createSession(devUser);
      onSuccess(devUser);
      return;
    }

    if (!record) { onError("No account found with that email."); return; }
    if (record.passwordHash !== AUTH.hashPassword(password)) { onError("Incorrect password."); return; }

    AUTH.createSession(record.user);
    if (O.dataManagement) O.dataManagement.log("LOGIN", "Login: " + email);
    onSuccess(record.user);
  };

  // ---- SOCIAL / OAUTH SIGN-IN ----
  // Mirrors how Google / Apple / Microsoft sign-in works: the provider
  // verifies identity and returns a profile (email + name). We then either
  // sign the user straight in (account exists — no password needed, identity
  // is provider-verified) or hand the profile to signup to create one.
  //
  // TODAY:  the provider profile is supplied by a simulated account picker.
  // WIRE:   replace the picker with Firebase signInWithPopup(provider);
  //         pass the resulting { email, displayName } here. Nothing else changes.
  AUTH.PROVIDERS = { Google: "google.com", Apple: "apple.com", Microsoft: "microsoft.com" };

  AUTH.socialAuth = function (provider, profile, onLogin, onSignup, onError) {
    profile = profile || {};
    var email = (profile.email || "").trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (onError) onError("That " + provider + " account did not return a valid email.");
      return;
    }

    var record = AUTH.findAccount(email);
    var isDev = AUTH.DEV_EMAILS.indexOf(email.toLowerCase()) >= 0;

    if (record) {
      // identity verified by the provider — passwordless session
      AUTH.createSession(record.user);
      if (O.dataManagement) O.dataManagement.log("LOGIN_SOCIAL", provider + " sign-in: " + email);
      if (onLogin) onLogin(record.user);
      return;
    }

    if (isDev) {
      var devUser = {
        id: "dev_001", email: email, firstName: "Lewis", lastName: "Gitonga",
        accountType: "developer", role: AUTH.ROLES.DEVELOPER,
        authProvider: provider, educationSystem: "KCSE", createdAt: new Date().toISOString(),
      };
      AUTH.createSession(devUser);
      if (O.dataManagement) O.dataManagement.log("LOGIN_SOCIAL", provider + " dev sign-in: " + email);
      if (onLogin) onLogin(devUser);
      return;
    }

    // brand-new identity — carry the provider profile into signup
    if (onSignup) onSignup({ email: email, firstName: profile.firstName || "", provider: provider });
  };

  // ---- LOG OUT ----
  AUTH.logOut = function () {
    if (O.dataManagement && AUTH.session) {
      O.dataManagement.log("LOGOUT", "Logout: " + (AUTH.session.user.email || ""));
    }
    AUTH.clearSession();
    O.state.user = null;
    O.go({ phase: "intro", signupStage: 1, form: {}, academicRecords: null });
  };

  // ---- ACCOUNT RECOVERY ----

  // Verify the four recovery answers WITHOUT touching the password.
  // Returns null on success, or an error message. Used to gate the
  // "set new password" step before any change is made.
  AUTH.verifyRecoveryAnswers = function (email, answers) {
    var record = AUTH.findAccount(email);
    if (!record) return "No account found with that email.";
    var rec = record.recoveryAnswers || {};
    var keys = ["rq_mother", "rq_friend", "rq_pet", "rq_subject"];
    for (var k = 0; k < keys.length; k++) {
      if ((answers[keys[k]] || "").toLowerCase().trim() !== (rec[keys[k]] || "").toLowerCase().trim()) {
        return "One or more recovery answers are incorrect.";
      }
    }
    return null;
  };

  // True if `password` is already the account's current password.
  // Compares hashes only — the stored password is never exposed.
  AUTH.passwordMatches = function (email, password) {
    var record = AUTH.findAccount(email);
    if (!record) return false;
    return record.passwordHash === AUTH.hashPassword(password);
  };

  AUTH.recover = function (email, answers, newPassword, onSuccess, onError) {
    var accounts = AUTH.loadAccounts();
    var idx = -1;
    for (var i = 0; i < accounts.length; i++) {
      if (accounts[i].user.email.toLowerCase() === email.toLowerCase()) { idx = i; break; }
    }
    if (idx < 0) { onError("No account found with that email."); return; }

    var rec = accounts[idx].recoveryAnswers || {};
    var keys = ["rq_mother", "rq_friend", "rq_pet", "rq_subject"];
    for (var k = 0; k < keys.length; k++) {
      if ((answers[keys[k]] || "").toLowerCase().trim() !== (rec[keys[k]] || "").toLowerCase().trim()) {
        onError("One or more recovery answers are incorrect."); return;
      }
    }

    accounts[idx].passwordHash = AUTH.hashPassword(newPassword);
    AUTH.saveAccounts(accounts);
    if (O.dataManagement) O.dataManagement.log("RECOVER_PASSWORD", "Password recovered: " + email);
    onSuccess();
  };

  // ---- DELETE ACCOUNT (soft delete, 30-day window) ----
  AUTH.deleteAccount = function (userId) {
    if (O.dataManagement) {
      var accounts = AUTH.loadAccounts();
      var record = accounts.find(function (a) { return a.user.id === userId; });
      if (record) {
        O.dataManagement.softDelete(userId, "account", record);
      }
    }
    var accounts = AUTH.loadAccounts().filter(function (a) { return a.user.id !== userId; });
    AUTH.saveAccounts(accounts);
    AUTH.logOut();
  };

  // ---- SESSION MANAGEMENT ----
  AUTH.createSession = function (user) {
    var session = {
      token:     AUTH.generateToken(),
      user:      user,
      createdAt: Date.now(),
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
    };
    AUTH.session = session;
    O.state.user = user;
    try { localStorage.setItem(KEY_SESSION, JSON.stringify(session)); } catch (e) {}
  };

  AUTH.clearSession = function () {
    AUTH.session = null;
    try { localStorage.removeItem(KEY_SESSION); } catch (e) {}
  };

  AUTH.isLoggedIn = function () {
    return !!AUTH.session && !!AUTH.session.user && Date.now() < AUTH.session.expiresAt;
  };

  AUTH.isDeveloper = function () {
    var user = AUTH.session && AUTH.session.user;
    return user && (user.role === AUTH.ROLES.DEVELOPER || AUTH.DEV_EMAILS.indexOf((user.email || "").toLowerCase()) >= 0);
  };

  // ---- STORAGE HELPERS ----
  AUTH.loadAccounts = function () {
    try { return JSON.parse(localStorage.getItem(KEY_ACCOUNTS) || "[]"); } catch (e) { return []; }
  };

  AUTH.saveAccounts = function (accounts) {
    try { localStorage.setItem(KEY_ACCOUNTS, JSON.stringify(accounts)); } catch (e) {}
  };

  AUTH.findAccount = function (email) {
    if (!email) return null;
    var accounts = AUTH.loadAccounts();
    for (var i = 0; i < accounts.length; i++) {
      if (accounts[i].user.email.toLowerCase() === email.toLowerCase()) return accounts[i];
    }
    return null;
  };

  // ---- CRYPTO HELPERS ----
  // Simple deterministic hash (replace with bcrypt on real backend)
  AUTH.hashPassword = function (password) {
    var hash = 5381;
    for (var i = 0; i < password.length; i++) {
      hash = ((hash << 5) + hash) + password.charCodeAt(i);
      hash = hash & hash; // 32-bit int
    }
    return "ocra_" + Math.abs(hash).toString(36) + "_" + password.length;
  };

  AUTH.generateToken = function () {
    return "tok_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 14);
  };

  AUTH.validateSignup = function (accountType, f) {
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var pwRe = /.{9,}/;
    var capRe = /[A-Z]/;
    var numRe = /[0-9]/;
    var symRe = /[^A-Za-z0-9]/;

    if (accountType === "personal") {
      if (!f.first || !f.last) return "First and last name required.";
      if (!f.email || !emailRe.test(f.email)) return "Valid email required.";
      if (!f.password || !pwRe.test(f.password) || !capRe.test(f.password) || !numRe.test(f.password) || !symRe.test(f.password)) {
        return "Password needs 9+ characters, a capital, a number and a symbol.";
      }
    }
    if (accountType === "family") {
      if (!f.familyName) return "Family surname required.";
      if (!f.momEmail && !f.dadEmail) return "At least one parent email required.";
    }
    if (accountType === "organization") {
      if (!f.orgName) return "Organization name required.";
      if (!f.email || !emailRe.test(f.email)) return "Valid organization email required.";
    }
    if (!f.agreed) return "Please accept the agreement to continue.";
    return "";
  };

  // ---- FIREBASE SEAM (swap this in when credentials are ready) ----
  AUTH.providers = {
    firebase: {
      signUp:  function (email, password, profile, cb) { cb(null, "Firebase not yet configured — add your firebaseConfig to auth-firebase.js"); },
      logIn:   function (email, password, cb) { cb(null, "Firebase not yet configured"); },
      logOut:  function (cb) { cb(null); },
      session: function (cb) { cb(null, null); },
    },
    supabase: {
      signUp:  function (email, password, profile, cb) { cb(null, "Supabase not yet configured"); },
      logIn:   function (email, password, cb) { cb(null, "Supabase not yet configured"); },
      logOut:  function (cb) { cb(null); },
      session: function (cb) { cb(null, null); },
    },
  };

  // Set to "firebase" or "supabase" when backend is ready
  AUTH.activeProvider = "local";

  // ---- WIRE INTO identity.js ----
  // Override identity login + signupNext to use AUTH module
  if (O.identity) {
    var _origLogin = O.identity.login;
    O.identity.login = function (btn) {
      var card = btn.closest("[data-auth]");
      if (!card) return;
      var emailEl = card.querySelector('[data-field="email"]');
      var passEl  = card.querySelector('[data-field="password"]');
      var msgEl   = card.querySelector("#authMsg");
      var email   = emailEl ? emailEl.value : "";
      var pass    = passEl  ? passEl.value  : "";

      AUTH.logIn(email, pass,
        function (user) {
          // success
          var dash = user.role === AUTH.ROLES.DEVELOPER ? "developer" : user.accountType;
          O.go({ phase: "dash", dash: dash });
        },
        function (err) {
          if (msgEl) msgEl.textContent = err;
        }
      );
    };

    var _origSignupNext = O.identity.signupNext;
    O.identity.signupNext = function () {
      var stages = O.identity.stages[O.state.account];
      var idx = O.state.signupStage - 1;
      var stage = stages[idx];
      var f = O.state.form;
      var err = O.identity.validateStage(stage, f);
      var box = document.getElementById("stageErr");
      if (err) { if (box) box.textContent = err; return; }

      if (O.state.signupStage < stages.length) {
        O.go({ signupStage: O.state.signupStage + 1 });
      } else {
        // Final stage — create real account
        AUTH.signUp(O.state.account, f,
          function (user) {
            var dash = user.role === AUTH.ROLES.DEVELOPER ? "developer" : user.accountType;
            O.go({ phase: "dash", dash: dash, signupStage: 1, form: {} });
          },
          function (signupErr) {
            if (box) box.textContent = signupErr;
          }
        );
      }
    };
  }

  // ---- LOGOUT ACTION ----
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-action='logout']")) {
      AUTH.logOut();
    }
  });

  // ---- AUTO-RESTORE on load ----
  AUTH.init();

  // Expose isDeveloper to payment module
  if (O.payment) {
    O.payment.isDeveloper = function () { return AUTH.isDeveloper(); };
  }

  console.log("✅ Auth Module Loaded — persistent sessions, role-based access, Firebase/Supabase seams ready");

})(window.OCRA);

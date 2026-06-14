/* ============================================================
   DOMAIN_27 — VOICE MODULE
   6 personas (3 male: Adam, Adrian, Ryan; 3 female: Aria, Nova, Luna)
   Web Speech API. Speaks only at meaningful moments.
   ============================================================ */
(function (O) {
  "use strict";
  var V = (O.voice = {});

  // Persona → ordered list of voice name substrings to try (first match wins)
  var PERSONAS = {
    adam:   ["Google UK English Male", "Microsoft George", "Alex",    "en-GB-Wavenet-B", "en-US-Wavenet-B", "English Male"],
    adrian: ["Microsoft David",        "Google US English", "Google en-US", "en-US-Standard-B", "English"],
    ryan:   ["Microsoft Mark",         "Google UK English", "Daniel",  "en-GB-Wavenet-D", "en-US-Standard-D", "English"],
    aria:   ["Google UK English Female","Microsoft Zira",   "Samantha","en-GB-Wavenet-A", "en-US-Wavenet-C", "English Female"],
    nova:   ["Microsoft Hazel",        "Google US English Female","Victoria","en-US-Wavenet-F", "en-GB-Standard-A"],
    luna:   ["Karen",                  "Microsoft Susan",  "Fiona",   "en-AU-Wavenet-A", "en-GB-Wavenet-C", "en-US-Standard-E"],
  };

  var MUTE_KEY = "ocra_voice_muted";
  var _synth    = (typeof speechSynthesis !== "undefined") ? speechSynthesis : null;
  var _voices   = [];
  var _ready    = false;

  function _loadVoices() {
    if (!_synth) return;
    _voices = _synth.getVoices();
    if (_voices.length) _ready = true;
  }

  if (_synth) {
    _loadVoices();
    if (_synth.onvoiceschanged !== undefined) {
      _synth.onvoiceschanged = _loadVoices;
    }
  }

  function _pickVoice(personaKey) {
    var names = PERSONAS[personaKey] || PERSONAS.adam;
    for (var i = 0; i < names.length; i++) {
      var n = names[i].toLowerCase();
      for (var j = 0; j < _voices.length; j++) {
        if (_voices[j].name.toLowerCase().indexOf(n) !== -1) return _voices[j];
      }
    }
    // Fallback: first English voice
    for (var k = 0; k < _voices.length; k++) {
      if (_voices[k].lang && _voices[k].lang.indexOf("en") === 0) return _voices[k];
    }
    return _voices[0] || null;
  }

  V.say = function (text, persona, opts) {
    if (!_synth || V.isMuted()) return;
    if (!_ready) _loadVoices();
    try {
      _synth.cancel();
      var u    = new SpeechSynthesisUtterance(text);
      var v    = _pickVoice(persona || "adam");
      if (v) u.voice = v;
      u.rate   = (opts && opts.rate   != null) ? opts.rate   : 0.92;
      u.pitch  = (opts && opts.pitch  != null) ? opts.pitch  : 1.0;
      u.volume = (opts && opts.volume != null) ? opts.volume : 1.0;
      _synth.speak(u);
    } catch (e) { /* silently ignore TTS errors */ }
  };

  V.mute = function () {
    try { localStorage.setItem(MUTE_KEY, "1"); } catch (e) {}
    if (_synth) _synth.cancel();
  };

  V.unmute = function () {
    try { localStorage.removeItem(MUTE_KEY); } catch (e) {}
  };

  V.toggle = function () {
    if (V.isMuted()) { V.unmute(); return false; /* now unmuted */ }
    else             { V.mute();   return true;  /* now muted   */ }
  };

  V.isMuted = function () {
    try { return localStorage.getItem(MUTE_KEY) === "1"; } catch (e) { return false; }
  };

  // Pre-warm: load voices and unlock audio context as soon as the page opens
  // so the very first spoken word has zero latency.
  V.preWarm = function () {
    if (!_synth) return;
    try {
      _loadVoices();
      // Browsers require a user-gesture OR a prior utterance to unlock audio.
      // Speaking a zero-volume single-space tricks the engine into staying warm.
      var u   = new SpeechSynthesisUtterance(" ");
      u.volume = 0;
      u.rate   = 10; // blaze past it
      _synth.speak(u);
      setTimeout(function () { try { _synth.cancel(); } catch (e) {} }, 80);
    } catch (e) {}
  };

  // Fire immediately on page open (deferred scripts run post-parse)
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", V.preWarm);
    } else {
      V.preWarm();
    }
  }

})(window.OCRA);

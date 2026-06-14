/* ============================================================
   DOMAIN_27 — VOICE MODULE
   6 personas + special "arten" persona for the AI companion.
   Sentence-split utterances for natural, lag-free speech.
   Web Speech API — pre-warms on page open for zero first-speak delay.
   ============================================================ */
(function (O) {
  "use strict";
  var V = (O.voice = {});

  // Persona → ordered voice name substrings (first match wins)
  var PERSONAS = {
    // Arten's persona: warm, soft, flowing — most human-sounding voices first
    arten:  ["Google UK English Female", "Microsoft Aria", "Samantha", "Karen",
             "Moira", "Microsoft Zira", "Google US English Female",
             "Google UK English Male", "Alex", "Daniel", "en-GB", "en-US"],
    adam:   ["Google UK English Male", "Microsoft George", "Alex", "Daniel",
             "en-GB-Wavenet-B", "en-US-Wavenet-B", "English Male"],
    adrian: ["Microsoft David", "Google US English", "en-US-Standard-B", "English"],
    ryan:   ["Microsoft Mark", "Daniel", "en-GB-Wavenet-D", "en-US-Standard-D", "English"],
    aria:   ["Google UK English Female", "Microsoft Zira", "Samantha",
             "en-GB-Wavenet-A", "en-US-Wavenet-C", "English Female"],
    nova:   ["Microsoft Hazel", "Victoria", "en-US-Wavenet-F", "en-GB-Standard-A"],
    luna:   ["Karen", "Moira", "Fiona", "en-AU-Wavenet-A", "en-US-Standard-E"],
  };

  var MUTE_KEY = "ocra_voice_muted";
  var _synth   = (typeof speechSynthesis !== "undefined") ? speechSynthesis : null;
  var _voices  = [];
  var _ready   = false;

  function _loadVoices() {
    if (!_synth) return;
    var v = _synth.getVoices();
    if (v.length) { _voices = v; _ready = true; }
  }

  if (_synth) {
    _loadVoices();
    if (_synth.onvoiceschanged !== undefined) {
      _synth.onvoiceschanged = _loadVoices;
    }
  }

  function _pickVoice(personaKey) {
    if (!_ready) _loadVoices();
    var names = PERSONAS[personaKey] || PERSONAS.arten;
    for (var i = 0; i < names.length; i++) {
      var n = names[i].toLowerCase();
      for (var j = 0; j < _voices.length; j++) {
        if (_voices[j].name.toLowerCase().indexOf(n) !== -1) return _voices[j];
      }
    }
    // Fallback: first English voice, then any voice
    for (var k = 0; k < _voices.length; k++) {
      if (_voices[k].lang && _voices[k].lang.indexOf("en") === 0) return _voices[k];
    }
    return _voices[0] || null;
  }

  // Split text at sentence boundaries so each utterance is short —
  // prevents TTS cutoff at ~200 chars and produces more natural prosody.
  function _splitSentences(text) {
    var parts = text.match(/[^.!?…]+[.!?…]+/g) || [];
    if (!parts.length) return [text];
    // Re-attach any trailing fragment that didn't end with punctuation
    var joined = parts.join("");
    var remainder = text.slice(joined.length).trim();
    if (remainder) parts.push(remainder);
    return parts.filter(function (s) { return s.trim(); });
  }

  // Speak — queues sentence-split utterances for fluid, unbroken delivery.
  V.say = function (text, persona, opts) {
    if (!_synth || V.isMuted()) return;
    if (!_ready) _loadVoices();
    try {
      _synth.cancel();
      var sentences = _splitSentences(text);
      var voice     = _pickVoice(persona || "arten");
      var rate      = (opts && opts.rate   != null) ? opts.rate   : 0.87;
      var pitch     = (opts && opts.pitch  != null) ? opts.pitch  : 1.02;
      var volume    = (opts && opts.volume != null) ? opts.volume : 1.0;

      sentences.forEach(function (s) {
        var u = new SpeechSynthesisUtterance(s.trim());
        if (voice) u.voice = voice;
        u.rate   = rate;
        u.pitch  = pitch;
        u.volume = volume;
        _synth.speak(u);
      });
    } catch (e) { /* silently ignore */ }
  };

  V.mute = function () {
    try { localStorage.setItem(MUTE_KEY, "1"); } catch (e) {}
    if (_synth) try { _synth.cancel(); } catch (e) {}
  };

  V.unmute = function () {
    try { localStorage.removeItem(MUTE_KEY); } catch (e) {}
  };

  V.toggle = function () {
    if (V.isMuted()) { V.unmute(); return false; }
    else             { V.mute();   return true;  }
  };

  V.isMuted = function () {
    try { return localStorage.getItem(MUTE_KEY) === "1"; } catch (e) { return false; }
  };

  // Pre-warm: request voices and unlock audio context immediately on page open
  // so the very first spoken word plays without any warm-up delay.
  V.preWarm = function () {
    if (!_synth) return;
    try {
      _loadVoices();
      var u   = new SpeechSynthesisUtterance(" ");
      u.volume = 0;
      u.rate   = 10;
      _synth.speak(u);
      setTimeout(function () { try { _synth.cancel(); } catch (e) {} }, 80);
    } catch (e) {}
  };

  // Fire on page open — deferred scripts run post-parse so body is ready
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", V.preWarm);
    } else {
      V.preWarm();
    }
  }

})(window.OCRA);

/* ============================================================
   DASHBOARDS — Personal / Family / Organization / Developer
   Built to the four reference mockups. Logo + live data plug in
   later; layout/arrangement/buttons match the images.
   ============================================================ */
(function (O) {
  "use strict";
  var d = O.data;

  function growthSVG(dark) {
    return O.lineChart([
      { data: d.growth.sci, color: "#38BDF8", labels: d.growth.labels },
      { data: d.growth.hum, color: "#F5B301", labels: d.growth.labels },
      { data: d.growth.all, color: "#7E7BD8", labels: d.growth.labels },
    ], { dark: dark });
  }

  // PERSONAL (Image 1)
  O.dashboards.personal = function () {
    var mgmt = ["New Data", "Print Data", "About me", "Download", "Clear All", "+ \u2665", "Recover", "Signature"];
    return '' +
    '<div class="grid-3">' +
      '<div class="glass panel">' +
        '<div class="label" style="font-size:12px;color:var(--ink)">Data Management</div>' +
        '<div class="label muted" style="font-size:10.5px;letter-spacing:.1em;margin-bottom:12px">Personal Console</div>' +
        '<div class="btnwrap">' + mgmt.map(function (m) { return '<button class="btn" style="font-size:11px">[ ' + m + ' ]</button>'; }).join("") + '</div>' +
        '<div class="label" style="font-size:12px;color:var(--ink);margin-top:22px">News &amp; Updates</div>' +
        '<div class="btnwrap" style="margin-top:10px"><button class="btn" style="font-size:11px">[ Alerts ]</button><button class="btn" style="font-size:11px">[ Data Review ]</button></div>' +
        '<button class="btn full" style="margin-top:16px;padding:14px;font-weight:700">[ See My Profile ]</button>' +
      '</div>' +
      '<div class="col">' +
        '<div style="display:flex;align-items:center;gap:14px">' +
          '<div class="pill" style="width:48px;height:48px;display:grid;place-items:center;font-weight:800;color:var(--ocean)">LG</div>' +
          '<div style="font-size:24px;font-weight:800;color:var(--ink)">Lewis Gitonga <span class="muted" style="font-weight:600;font-size:16px">&mdash; leez</span></div>' +
        '</div>' +
        '<div class="glass panel" style="display:flex;align-items:center;gap:10px"><span style="font-size:16px">&#128269;</span><span class="muted">Search&hellip;</span><span class="muted" style="margin-left:auto">&#9662;&nbsp;&times;</span></div>' +
        '<div class="glass panel-0">' +
          '<div class="thead label muted" style="grid-template-columns:1.4fr 1fr 1fr 1.2fr"><span>Name</span><span>System / Level</span><span>Progress</span><span>Mental State</span></div>' +
          '<div class="trow" style="grid-template-columns:1.4fr 1fr 1fr 1.2fr">' +
            '<div style="font-size:16px;font-weight:700;color:var(--ink)">' + O.dot("var(--red)") + 'Samuel Mburu</div>' +
            '<div style="text-align:center"><div style="font-size:22px;font-weight:800;color:var(--ink)">123</div><div class="muted" style="font-size:11px">Grade 10</div></div>' +
            '<div class="kpi" style="font-size:20px;color:var(--ink)">75% <span style="color:var(--green);font-size:12px">&uarr;15</span></div>' +
            '<div style="font-size:11.5px;color:var(--ink);line-height:1.7">Reasoning <b>70</b><br>Memory <b>90</b><br>Development <b>55</b><br><span style="color:var(--red)">Stress 30</span></div>' +
          '</div>' +
        '</div>' +
        '<div class="glass panel"><div class="label" style="font-size:11px;color:var(--ink)">Psychological Remark</div>' +
          '<p class="muted" style="font-size:13px;margin-top:8px;line-height:1.5">Strong working memory anchors your science track; reasoning is solid and rising. Next term, focus on converting recall into applied problem-solving.</p>' +
          '<div class="label muted" style="text-align:center;font-size:10px;margin-top:10px">&mdash; O C R A &mdash;</div></div>' +
      '</div>' +
      '<div class="col">' +
        '<div class="glass panel"><div style="display:flex;justify-content:space-between;align-items:baseline"><div class="label" style="font-size:12px;color:var(--ink)">Your Growth.</div><div class="muted" style="font-size:10px">Analytics Engine</div></div>' + growthSVG(false) + '</div>' +
        '<div class="glass panel"><div class="label" style="font-size:11px;color:var(--ink);margin-bottom:10px">Descriptors</div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;color:var(--ink)">' +
            '<span>' + O.dot("var(--blue)") + 'Excellent &middot; 12</span><span>' + O.dot("var(--grey)") + 'Regend &middot; 1</span>' +
            '<span>' + O.dot("#cbd5dd") + 'Trying &middot; 6</span><span>' + O.dot("var(--red)") + 'oops! &middot; 1</span></div></div>' +
      '</div>' +
    '</div>';
  };

  // ORGANIZATION (Image 2)
  O.dashboards.organization = function () {
    var rows = [
      ["Lewis Gitonga", "Form 4", 80, 20, "var(--red)"], ["Achieng O.", "Form 4", 74, 12, "var(--green)"],
      ["Elom M.", "Form 4", 81, 20, "var(--red)"], ["Justin B.", "Form 4", 69, 6, "var(--green)"],
      ["Gravis G.", "Form 4", 77, 15, "var(--blue)"], ["Adel\u00e9 B.", "Form 6", 88, 15, "var(--green)"],
    ];
    var mgmt = ["View Data", "New Student", "Print Data", "Clear Data", "Download", "Remove Student", "Signatures", "Recover"];
    return '' +
    '<div class="grid-2l">' +
      '<div class="col">' +
        '<div class="glass panel" style="text-align:center;font-weight:700;color:var(--ink);padding:22px">Organization Logo</div>' +
        '<div class="glass panel"><div class="label" style="font-size:12px;color:var(--ink);margin-bottom:12px">Data Management</div>' +
          '<div class="btnwrap">' + mgmt.map(function (m) { return '<button class="btn" style="font-size:11px">[ ' + m + ' ]</button>'; }).join("") + '</div></div>' +
        '<div class="glass panel"><div class="label" style="font-size:11px;color:var(--ink);margin-bottom:8px">Top &middot; Moderate &middot; Poor</div>' + O.barChart(d.termBars) + '</div>' +
      '</div>' +
      '<div class="glass panel-0" style="display:flex;flex-direction:column">' +
        '<div class="label" style="font-size:12px;color:var(--ink);padding:16px 18px 8px">Data Panel</div>' +
        '<div class="thead label muted" style="grid-template-columns:1.3fr .8fr .9fr 1.6fr .9fr .8fr"><span>Name</span><span>Level</span><span>Progress</span><span>Mental State</span><span>Univ. Mat.</span><span>Action</span></div>' +
        rows.map(function (r) {
          return '<div class="trow row-line" style="grid-template-columns:1.3fr .8fr .9fr 1.6fr .9fr .8fr">' +
            '<div style="font-weight:700;color:var(--ink)">' + O.dot(r[4]) + O.esc(r[0]) + '</div>' +
            '<div><b style="color:var(--ink)">844</b><br><span class="muted" style="font-size:10px">' + r[1] + '</span></div>' +
            '<div class="kpi" style="color:var(--ink)">' + r[2] + '% <span style="color:var(--green);font-size:10px">&uarr;' + r[3] + '</span></div>' +
            '<div class="muted" style="font-size:10.5px;line-height:1.5">Reasoning 10% &middot; Creativity 20% &middot; Development 50% &middot; Stress 20%</div>' +
            '<div class="kpi" style="color:var(--ink)">90%</div>' +
            '<div><button class="btn" style="font-size:10px;padding:6px 12px">[ View ]</button></div></div>';
        }).join("") +
        '<div style="padding:14px"><button class="btn full" style="padding:14px;font-weight:700;font-size:14px">View All</button></div>' +
      '</div>' +
    '</div>';
  };

  // FAMILY (Image 4)
  O.dashboards.family = function () {
    var kids = [
      ["Teacy", "CBE G.10", 81, 71, 18, 40, "var(--red)"], ["Elsie", "CBE G.10", 54, 80, 18, 40, "var(--amber)"],
      ["Elvis", "CBE G.6", 54, 40, 42, 30, "var(--amber)"], ["Nia", "G.4", 96, 85, 85, 71, "var(--green)"],
    ];
    var mgmt = ["New Data", "New Member", "New Dept.", "New Data", "Print Data", "Clear Data", "Backup", "Restart"];
    return '' +
    '<div class="grid-2f">' +
      '<div class="col">' +
        '<div class="glass panel"><div class="label" style="font-size:13px;color:var(--ink);margin-bottom:12px">Family Console</div>' +
          '<div class="btnwrap">' + mgmt.map(function (m) { return '<button class="btn" style="font-size:11px">' + m + '</button>'; }).join("") + '</div>' +
          '<div class="label" style="font-size:11px;color:var(--ink);margin-top:18px">News &amp; Updates</div>' +
          '<div class="btnwrap" style="margin-top:8px"><button class="btn" style="font-size:11px">Family Advice</button><button class="btn" style="font-size:11px">Data Review</button></div></div>' +
        '<div class="glass panel"><div class="label" style="font-size:11px;color:var(--ink);margin-bottom:10px">Descriptors</div>' +
          '<div style="font-size:12px;color:var(--ink);display:flex;flex-direction:column;gap:8px"><span>' + O.dot("var(--red)") + 'Red &mdash; Performance</span><span>' + O.dot("var(--blue)") + 'Moderate</span><span>' + O.dot("var(--green)") + 'Good</span></div></div>' +
      '</div>' +
      '<div class="col">' +
        '<div class="glass panel-0">' +
          '<div class="label" style="font-size:12px;color:var(--ink);padding:16px 18px 8px">Data Panel</div>' +
          '<div class="thead label muted" style="grid-template-columns:1fr .8fr .8fr 1.4fr .7fr"><span>Student</span><span>Level</span><span>Progress</span><span>Mental State</span><span>Action</span></div>' +
          kids.map(function (k) {
            return '<div class="trow row-line" style="grid-template-columns:1fr .8fr .8fr 1.4fr .7fr">' +
              '<div style="font-weight:700;color:var(--ink)">' + O.dot(k[6]) + O.esc(k[0]) + '</div>' +
              '<div class="muted">' + k[1] + '</div>' +
              '<div class="kpi" style="color:var(--ink)">' + k[2] + '%</div>' +
              '<div class="muted" style="font-size:10.5px;line-height:1.5">Reasoning ' + k[3] + ' &middot; Memory ' + k[4] + ' &middot; Stress ' + k[5] + '</div>' +
              '<div style="font-size:16px;color:var(--ocean)">&#128065; +</div></div>';
          }).join("") +
          '<div style="padding:14px"><button class="btn full" style="padding:12px;font-weight:700">View All</button></div>' +
        '</div>' +
        '<div class="glass panel"><div class="label" style="font-size:12px;color:var(--ink);margin-bottom:6px">Growth Rate &mdash; 2026</div>' + growthSVG(false) + '</div>' +
      '</div>' +
    '</div>';
  };

  // DEVELOPER (Image 3 — dark, hidden console)
  O.dashboards.developer = function () {
    var accts = [["Personal", 160], ["Organization", 20], ["Family", 18], ["Developer", 4]];
    var code = 'export default function Dashboard(){\n  const cfg = await loadTenantConfig();\n  cfg.theme   = "ocean-glass";\n  cfg.account = "organization";\n  return &lt;Console editable={cfg.editable} /&gt;;\n}';
    return '' +
    '<div class="grid-3">' +
      '<div class="col">' +
        '<div class="dglass panel" style="display:flex;flex-direction:column;align-items:center;gap:10px;padding:22px">' + O.logo(64, true) + '<div class="label" style="font-size:11px">OCRA Logo</div><div class="label" style="font-size:10px;color:rgba(220,232,242,.6)">Developer Console</div></div>' +
        '<div class="dglass panel"><div class="label" style="font-size:11px;text-align:center;margin-bottom:10px">Settings</div>' +
          '<button class="btn dark full" style="margin-bottom:8px">Finances (0)</button>' +
          '<div style="display:flex;gap:8px"><button class="btn dark" style="flex:1">Appearance</button><button class="btn dark" style="flex:1">Remove</button></div></div>' +
        '<div class="dglass panel"><div style="display:flex;justify-content:space-between"><div class="label" style="font-size:11px">Academics</div><span style="font-weight:800;color:var(--cyan)">182</span></div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px;margin-top:12px;text-align:center">' +
            accts.map(function (a) { return '<div><div class="label" style="font-size:8px">' + a[0] + '</div><div class="dglass" style="border-radius:999px;padding:6px 0;margin:6px 0;font-weight:700">' + a[1] + '</div><div style="font-size:8px;color:rgba(220,232,242,.5)">users</div><button class="btn dark full" style="font-size:8px;padding:5px 0;margin-top:6px">Edit</button></div>'; }).join("") +
          '</div><button class="btn dark full" style="margin-top:12px">Codebase</button></div>' +
      '</div>' +
      '<div class="col">' +
        '<div class="dglass panel"><div class="label" style="font-size:11px;margin-bottom:10px">Live Codebase</div>' +
          '<pre style="background:#0a1622;border-radius:10px;padding:14px;font-size:11px;line-height:1.6;overflow:auto;color:#7fd6ff;border:1px solid rgba(255,255,255,.08)">' + code + '</pre></div>' +
        '<div class="dglass panel"><div class="label" style="font-size:11px;margin-bottom:6px">Marketing Guide &mdash; Profit Margin</div>' + growthSVG(true) + '</div>' +
        '<div class="dglass panel"><div class="label" style="font-size:11px">Typewriter Remarks (Psychological)</div><div style="margin-top:8px;font-size:13px;color:rgba(220,232,242,.8)">&mdash; Remarks &nbsp; &mdash; Advice &nbsp; &mdash; Insights</div></div>' +
      '</div>' +
      '<div class="col">' +
        '<div class="dglass panel"><div class="label" style="font-size:11px;margin-bottom:10px">Data Management</div>' +
          ["New Data", "Clear Data", "Print", "Download", "About Me", "Recover", "Signatures"].map(function (m) { return '<button class="btn dark full" style="margin-bottom:8px;font-size:11px">' + m + '</button>'; }).join("") + '</div>' +
        '<div class="dglass panel"><div class="label" style="font-size:11px;margin-bottom:8px">Lewis&rsquo; Growth Rate</div>' + growthSVG(true) + '</div>' +
      '</div>' +
    '</div>';
  };

})(window.OCRA);

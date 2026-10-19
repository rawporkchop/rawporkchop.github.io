// ================================================================
//  coding-notes/template.typ
//  Import this file and call #show: notes.with(...) to begin.
// ================================================================


// ── Internal Palette ────────────────────────────────────────────
#let _accent   = rgb("#5C6BC0")
#let _subtle   = rgb("#ECEFF1")
#let _code-bg  = rgb("#1E1E2E")
#let _code-fg  = rgb("#CDD6F4")
#let _tip-bg   = rgb("#E8F5E9")
#let _tip-bdr  = rgb("#2E7D32")
#let _warn-bg  = rgb("#FFF8E1")
#let _warn-bdr = rgb("#F57F17")
#let _note-bg  = rgb("#E8EAF6")
#let _note-bdr = rgb("#3949AB")
#let _err-bg   = rgb("#FFEBEE")
#let _err-bdr  = rgb("#C62828")
#let _info-bg  = rgb("#E3F2FD")
#let _info-bdr = rgb("#1565C0")

#let code-font = "JetBrains Mono"

// ================================================================
//  MAIN TEMPLATE
//  Usage:
//    #import "template.typ": *
//    #show: notes.with(
//      project:  "My Project",
//      topic:    "Redis Caching",
//      author:   "Jane Dev",
//      language: "Python",
//    )
// ================================================================
#let notes(
  project:  "Project",
  topic:    "Topic",
  author:   "Author",
  language: "–",
  version:  "v1.0",
  accent:   rgb("#5C6BC0"),   // override the theme colour if desired
  toc:      true,             // show table of contents?
  body,
) = {

  // ── Re-bind accent so overrides propagate ─────────────────────
  let _accent = accent

  // ── Page ──────────────────────────────────────────────────────
  set page(
    paper: "us-letter",
    margin: (top: 2.2cm, bottom: 2.2cm, left: 2.4cm, right: 2.4cm),
    header: context {
      if counter(page).get().first() > 1 {
        set text(size: 8pt, fill: luma(140))
        grid(
          columns: (1fr, 1fr),
          align(left)[#project — #topic],
          align(right)[
            #author · #datetime.today().display("[month repr:short] [day], [year]")
          ],
        )
        line(length: 100%, stroke: 0.5pt + luma(200))
      }
    },
    footer: context {
      set text(size: 8pt, fill: luma(160))
      line(length: 100%, stroke: 0.5pt + luma(200))
      align(center)[Page #counter(page).display("1 of 1", both: true)]
    },
  )

  // ── Base typography ───────────────────────────────────────────
  set text(font: "New Computer Modern", size: 11pt, lang: "en")
  set par(justify: true, leading: 0.75em)

  // ── Heading styles ────────────────────────────────────────────
  show heading.where(level: 1): it => {
    v(1.2em)
    block(
      fill: _accent,
      radius: 4pt,
      inset: (x: 10pt, y: 7pt),
      width: 100%,
      text(fill: white, weight: "bold", size: 13pt)[#it.body],
    )
    v(0.4em)
  }
  show heading.where(level: 2): it => {
    v(0.9em)
    text(fill: _accent, weight: "bold", size: 11.5pt)[#it.body]
    v(0.25em)
  }
  show heading.where(level: 3): it => {
    v(0.6em)
    text(fill: luma(60), weight: "bold", size: 10.5pt)[#it.body]
    v(0.15em)
  }

  // ── Inline code ───────────────────────────────────────────────
  show raw.where(block: false): it => box(
    fill: _subtle,
    outset: (y: 2pt),
    inset: (x: 4pt),
    radius: 3pt,
    text(font: code-font, size: 9.5pt, fill: rgb("#C62828"))[#it],
  )

  // ── Block code ────────────────────────────────────────────────
  show raw.where(block: true): it => block(
    fill: _code-bg,
    radius: 6pt,
    inset: 14pt,
    width: 100%,
    text(font: code-font, size: 9pt, fill: _code-fg)[#it],
  )

  // ── Title block ───────────────────────────────────────────────
  block(
    fill: _accent,
    radius: 8pt,
    inset: 20pt,
    width: 100%,
  )[
    #text(fill: white.transparentize(35%), size: 8.5pt, weight: "bold",
      tracking: 1.5pt)[CODING NOTES]
    #v(4pt)
    #text(fill: white, size: 21pt, weight: "bold")[#project]
    #v(2pt)
    #text(fill: white.transparentize(15%), size: 13pt)[#topic]
    #v(12pt)
    #line(length: 100%, stroke: 0.6pt + white.transparentize(50%))
    #v(10pt)
    #grid(
      columns: (1fr, 1fr, 1fr),
      {
        text(fill: white.transparentize(40%), size: 8.5pt)[Author]
        linebreak()
        text(fill: white, size: 10pt)[#author]
      },
      {
        text(fill: white.transparentize(40%), size: 8.5pt)[Language]
        linebreak()
        text(fill: white, size: 10pt)[#language]
      },
      {
        text(fill: white.transparentize(40%), size: 8.5pt)[Date]
        linebreak()
        text(fill: white, size: 10pt)[
          #datetime.today().display("[month repr:short] [day], [year]")
        ]
      },
    )
  ]

  v(0.8em)

  // ── Table of contents ─────────────────────────────────────────
  if toc {
    outline(
      title: text(weight: "bold", size: 10pt)[Contents],
      indent: 1.5em,
      depth: 2,
    )
    pagebreak()
  }

  body
}


// ================================================================
//  CALLOUT BOXES
// ================================================================

/// Generic internal callout builder.
#let _callout(icon, label, body, bg, border) = block(
  fill: bg,
  stroke: (left: 3pt + border),
  inset: (left: 10pt, right: 10pt, top: 8pt, bottom: 8pt),
  radius: (right: 4pt),
  width: 100%,
)[
  #text(weight: "bold", fill: border)[#icon  #label]
  #parbreak()
  #body
]

/// Green tip box — for hints, shortcuts, and best practices.
#let tip(body)  = _callout("💡", "Tip",     body, _tip-bg,  _tip-bdr)

/// Amber warning box — for gotchas and things to watch out for.
#let warn(body) = _callout("⚠️", "Warning", body, _warn-bg, _warn-bdr)

/// Indigo note box — for supplementary information.
#let note(body) = _callout("📝", "Note",    body, _note-bg, _note-bdr)

/// Red error box — for common errors and their fixes.
#let err(body)  = _callout("🚨", "Error",   body, _err-bg,  _err-bdr)

/// Blue info box — for background context or reference links.
#let info(body) = _callout("ℹ️", "Info",    body, _info-bg, _info-bdr)

/// Custom callout — supply your own icon, label, body, and colour.
/// #callout("🔥", "Hot Take", [content], rgb("#FFF"), rgb("#000"))
#let callout(icon, label, body, bg, border) = {
  _callout(icon, label, body, bg, border)
}


// ================================================================
//  KEY-VALUE METADATA ROW
// ================================================================

/// Renders a two-column label → value row.
/// #kv("Status", "In progress")
#let kv(key, val) = grid(
  columns: (110pt, 1fr),
  gutter: 4pt,
  text(fill: luma(110), size: 9.5pt)[#key],
  text(size: 9.5pt)[#val],
)


// ================================================================
//  SECTION DIVIDER
// ================================================================

/// A subtle horizontal rule with an optional label.
/// #divider()            — plain rule
/// #divider("Setup")    — rule with centred label
#let divider(label: none) = {
  v(0.5em)
  if label == none {
    line(length: 100%, stroke: 0.6pt + luma(210))
  } else {
    grid(
      columns: (1fr, auto, 1fr),
      column-gutter: 8pt,
      align(horizon, line(length: 100%, stroke: 0.6pt + luma(210))),
      text(size: 8.5pt, fill: luma(140))[#label],
      align(horizon, line(length: 100%, stroke: 0.6pt + luma(210))),
    )
  }
  v(0.5em)
}


// ================================================================
//  TASK / CHECKLIST
// ================================================================

/// Renders a checklist from a list of (done, text) pairs.
/// #checklist(
///   (false, "Write unit tests"),
///   (true,  "Set up CI"),
/// )
#let checklist(..items) = {
  for (done, label) in items.pos() {
    let icon = if done { text(fill: _tip-bdr)[☑] } else { text(fill: luma(160))[☐] }
    grid(
      columns: (14pt, 1fr),
      gutter: 4pt,
      icon,
      text(fill: if done { luma(160) } else { black },
           strike: done)[#label],
    )
    v(2pt)
  }
}


// ================================================================
//  COMPLEXITY / REFERENCE TABLE
// ================================================================

/// Renders a shaded two-column reference table.
/// #reftable(
///   ("Term", "Definition"),
///   ("closure", "Captures surrounding scope"),
/// )
#let reftable(header, ..rows) = table(
  columns: (auto, 1fr),
  stroke: 0.5pt + luma(210),
  fill: (_, row) => if row == 0 { _subtle } else if calc.odd(row) { white } else { _subtle },
  inset: 8pt,
  table.header(
    text(weight: "bold")[#header.at(0)],
    text(weight: "bold")[#header.at(1)],
  ),
  ..rows.pos().flatten()
)


// ================================================================
//  STEP LIST (numbered how-to)
// ================================================================

/// Renders a styled numbered step list.
/// #steps(
///   "Install the package",
///   "Configure your env file",
///   [Run `python main.py`],
/// )
#let steps(..items) = {
  for (i, step) in items.pos().enumerate() {
    grid(
      columns: (22pt, 1fr),
      align(top,
        box(
          fill: _accent,
          radius: 50%,
          inset: (x: 5pt, y: 3pt),
          text(fill: white, size: 8.5pt, weight: "bold")[#(i + 1)],
        )
      ),
      align(horizon, pad(left: 4pt, step)),
    )
    v(5pt)
  }
}


// ================================================================
//  COMMAND BLOCK
// ================================================================

/// Renders a shell-style command block with a prompt symbol.
/// #cmd("pip install -r requirements.txt")
/// #cmd("npm run dev", shell: "zsh")
#let cmd(command, shell: "bash") = block(
  fill: rgb("#0D1117"),
  radius: 6pt,
  inset: (x: 14pt, y: 10pt),
  width: 100%,
)[
  #grid(
    columns: (auto, 1fr, auto),
    gutter: 6pt,
    align(horizon, text(font: code-font, size: 8.5pt, fill: _tip-bdr)[>]),
    align(horizon, text(font: code-font, size: 8.5pt, fill: rgb("#E6EDF3"))[#command]),
    align(horizon, text(font: code-font, size: 7.5pt, fill: luma(80))[#shell]),
  )
]


// ================================================================
//  FOOTER STAMP
// ================================================================

/// Call at the very end of your document for a closing rule + stamp.
/// #stamp(version: "v1.0")
#let stamp(version: "v1.1") = {
  v(2em)
  line(length: 100%, stroke: 0.5pt + luma(200))
  align(center)[
    #text(size: 8pt, fill: luma(160))[
      Oliver Larsson · Generated with Typst · #version ·
      #datetime.today().display("[month repr:short] [day], [year]")
    ]
  ]
}

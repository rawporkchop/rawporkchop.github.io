# AVR Link

A macOS **menu-bar app**, an **iOS companion app**, and an **Apple Watch app** that discover and
control **Denon / Marantz** AV receivers over their local-network control protocol (telnet on TCP 23).
Power/standby, volume, mute, input selection, and independent control of the Main / Zone 2 / Zone 3
speaker zones.

This is a clean-room implementation grounded in the vendor protocol specs in [`protocol/`](protocol/).
All three apps are thin UI shells over a shared, headless-tested engine (`AVRLinkCore`).

> The Swift package lives in `avrKit/`: its pure, dependency-free protocol codec is the `AVRKit`
> module and the shared cross-platform app engine is `AVRLinkCore`. Everything else — the Xcode
> project, targets, schemes, and source directories — carries the **AVR Link** product name.

## Features

- **Discovery** — finds receivers via Bonjour (HEOS / AirPlay service types) and confirms each
  candidate by probing the control port, so only real AVRs appear. Manual IP entry is supported.
- **Bidirectional state** — the UI reflects the receiver's *actual* state, parsing unsolicited
  events and `?` query replies (including the current input per zone).
- **Custom source labels** — reads the receiver's own source configuration (`SSFUN` rename map +
  `SSSOD` enabled/hidden) so the input picker shows *your* names (e.g. "Apple TV", "XLR") and only
  the sources you keep. Falls back to the built-in list on receivers that don't report it.
- **Auto-reconnect** — exponential backoff (1→30 s, jittered) on dropped links and standby→wake,
  with fast retry when the network path returns.
- **Per-zone control** — power, mute, input picker, and a volume slider for Main / Zone 2 / Zone 3.
- **Sleep / auto-off timer** — set the receiver to power itself off after 5 / 15 / 30 / 60 / 120
  minutes (capped at the receiver's 120-minute `SLP` maximum), from a menu beside the power button in
  both apps. iOS surfaces the running countdown as a **Live Activity / Dynamic Island** — a
  self-ticking count-down to auto-off with Add-15-min / mute / Turn-Off controls, rendered on-device
  so it stays accurate with no background updates. macOS shows an equivalent **status card** above the
  zone cards with the same countdown and controls.
- **Menu-bar volume scrub (macOS)** — click-drag on the status-bar icon to scrub volume via a
  translucent, Control-Center-style slider HUD under the icon (the "liquid glass" look comes from an
  AppKit `NSVisualEffectView` desktop blur, not SwiftUI's `glassEffect`), respecting the configured
  volume limit.
- **Settings** — a dedicated Settings surface on the iOS and macOS apps (iOS: Settings sheet; macOS:
  the popover footer menu) with:
  - **Volume display scale** — show levels as the raw 0–98 wire number (**Absolute**) or as decibels
    (**Relative**, wire − 80). Display-only; never changes what's sent to the receiver.
  - **Per-zone maximum-volume limit** — an app-enforced ceiling per zone (the protocol has no
    hardware limit to set); the app clamps every send and lowers the receiver when a new, lower limit
    is applied.
  - **Hide/show zones** — hide zones you don't use from the main view (a global UI preference).
  - **Appearance** — System / Light / Dark, persisted per app.
- **iOS companion** — full parity as a touch remote, plus:
  - **Home-Screen widgets** — a compact status widget (small; headline state with interactive
    power / volume / mute buttons) and a medium per-zone control widget (power / input / volume / mute).
  - **Lock-Screen widgets** — an accessory widget (inline / circular / rectangular) to glance the
    receiver's state and, on the rectangular family, drive power / volume / mute.
  - **Single-action Lock-Screen widgets** — standalone volume-up, volume-down, and mute tiles
    (circular / rectangular), each targeting the main zone.
  - **Control Center controls** (iOS 18+): power toggle, mute toggle, volume-up, and volume-down.
  - **Siri & Shortcuts** via App Intents — whole-unit power/mute, per-zone power/mute, input
    cycling, and volume up/down/set.
  - **Volume-button remote** (opt-in, off by default) — the iPhone's physical volume side buttons
    adjust the receiver instead of the phone, targeting the most recently used zone (Main by default).
    The per-press step is configurable (0.5–5.0 on the 0–98 scale, default 2.0). It keeps an audio
    session alive with silent playback to capture the buttons (`.mixWithOthers`, so it won't pause
    your music) and re-centers the system volume after each press, so a press "into" a 0/1 rail —
    which iOS reports as no change — can't strand control at the limit. The decision logic lives in a
    pure, unit-tested `VolumeButtonInterpreter`; the AVFoundation wiring (`VolumeButtonMonitor`) has
    no Simulator behavior and is validated on device.
    - **Keep working in background** (Experimental) — optionally holds the connection and audio
      session open after the app leaves the foreground so the buttons keep working, for a chosen
      window (1 / 2 / 3 / 6 / 12 hours, or Never). Relies on background audio staying alive, so it's
      device-QA-gated and off by default.
  - Backgrounding frees the receiver's telnet session and foregrounding reconnects automatically —
    unless the volume-button background option above is holding the session open.
- **watchOS companion** — a wrist remote that **relays through the paired iPhone over
  WatchConnectivity** rather than talking to the receiver directly. watchOS blocks low-level
  networking (`NWBrowser`/`NWConnection`) for normal apps, so the **iPhone owns the receiver
  connection and LAN discovery**; the watch mirrors the phone's headline state and sends control
  intents back for the phone to execute. It offers whole-unit power plus per-zone power / mute /
  input and **Digital-Crown volume** (0.5 dB steps on Main, whole units on Zones 2/3).
  - The paired iPhone publishes its selected + known receivers and connection status to the watch,
    so the watch never has to rediscover or re-type an address. The watch **cannot browse the LAN
    itself**; adding a receiver by IP is relayed to the iPhone's probe.
  - Works whenever the iPhone app is running and reachable. When the phone app is backgrounded or
    out of range, the watch shows its last cached state but can't drive the receiver; commands
    issued meanwhile are queued for guaranteed delivery when the phone wakes.
  - **Watch-face complications** (WidgetKit, all accessory families — circular / corner / inline /
    rectangular) — a launcher, a live main-zone volume/power glance, and a live current-input glance,
    all marked with the same menu-bar receiver glyph. The live glances read the snapshot the watch
    app republishes into its App Group from the phone relay; the volume glance deep-links
    (`avrlink://volume`) straight into the app's Digital-Crown volume control.

## Layout

```
avrKit/                        Local Swift package (multiplatform: macOS 14 / iOS 17 / watchOS 10)
  Sources/AVRKit/              Pure protocol codec — AVRCommand, ResponseParser, Volume,
                               FrameDecoder, InputSource, Zone, AVRResponse (no UI, no Network)
  Sources/AVRLinkCore/         Shared app engine used by ALL the apps (no UI):
    Connection/                AVRConnection (NWConnection actor) + ReconnectController (Backoff/phase)
    Discovery/                 DiscoveryService (NWBrowser) + AVRProbe (control-port confirmation)
    State/                     ReceiverController (the brain) + ZoneState + SourceInfo + ReceiverStore
                               + VolumeLimit (app-enforced per-zone ceiling)
                               + VolumeButtonInterpreter (pure iPhone volume-button decision logic)
    Snapshot/                  AVRSnapshot + App Group store + AVRQuickCommand (one-shot send)
                               + WatchLink (bidirectional WatchConnectivity bridge: the phone publishes
                                 WatchReceiverState, the watch sends WatchCommand; iOS/watchOS only)
                               + AVRLiveActivity (sleep-timer ActivityAttributes + LiveActivityController;
                                 iOS only)
    Intents/                   App Intents for iOS widgets / Control Center / Siri (#if os(iOS))
    Testing/                   MockAVRServer + SelfTest (DEBUG only)
    Support/                   Shared logger + VolumeScale (Absolute/Relative) + AppearanceMode
                               (System/Light/Dark) display preferences + WatchDeepLink (watch-face
                               complication URL scheme/routes)
  Tests/AVRKitTests/           Codec unit tests (CodecTests)
  Tests/AVRLinkCoreTests/      Engine tests — catalog assembly, backoff, snapshot, phase (CoreTests),
                               volume-scale formatting (VolumeScaleTests), watch relay (WatchLinkTests),
                               volume-button interpreter + zone-focus routing (VolumeButtonTests)
avrLinkMac/                    The macOS menu-bar app (imports AVRLinkCore)
  App/                         Entry point (Entry.swift) + AppKit status item (avrLinkApp.swift)
  UI/                          RootMenuView, ZoneCardView, DiscoveryView, ScrubHUD, SettingsView,
                               MenuChrome
avrLinkMobile/                 The iOS app (imports AVRLinkCore)
  App/                         AVRMobileApp (composition root, scene lifecycle, snapshot mirror,
                               Shortcuts, WatchLink host)
  Audio/                       VolumeButtonMonitor (iOS-only AVFoundation/MediaPlayer wiring that
                               turns the physical volume buttons into a receiver remote)
  UI/                          RemoteView, ZoneControlView, ReceiverPickerView, SettingsView
avrLinkWidgets/                iOS widget + Control Center extension + sleep-timer Live Activity
                               (imports AVRLinkCore)
avrLinkWatch/                  The watchOS companion app (imports AVRLinkCore)
  App/                         AVRWatchApp (composition root + WatchController, which mirrors the
                               ReceiverController API over the WatchLink relay)
  UI/                          WatchZoneListView, WatchZoneControlView, WatchReceiverPickerView
avrLinkWatchComplication/      watchOS complications (WidgetKit), embedded in the watch app, all
                               marked with the menu-bar receiver glyph: a launcher that opens the app,
                               and two live glances (main-zone volume/power and current input) that
                               read the snapshot the watch app republishes from the phone relay into
                               the App Group. The volume glance deep-links (`avrlink://volume`) straight
                               into the app's volume control
AVR Link.xcodeproj/            macOS ("AVR Link Mac"), iOS ("AVR Link Mobile"), widget-extension
                               ("AVRWidgetsExtension"), watchOS ("AVR Link Watch"), and watch
                               complication ("AVRWatchComplicationExtension") targets; all depend on
                               AVRKit (the watch app is embedded in the iOS app, the complication in
                               the watch app)
```

The engine lives in the `AVRKit` package so the protocol logic — command encoding, response
parsing with `Z2`/`Z3` prefix disambiguation, MV half-step volume handling — plus the connection,
discovery, and per-zone state machine are unit-tested without any GUI. The macOS, iOS, and watchOS
apps are just platform-specific UI over the same `AVRLinkCore` types.

## Requirements

- macOS 14.0+ / iOS 17.0+ / watchOS 10.0+ (deployment targets), built with Xcode 26 / Swift 5
  language mode. Control Center controls require iOS 18.
- The receiver must have **Network Standby = On** to accept commands while in standby.
- The iOS app, widget, watch app, and watch complication share an App Group (`group.avrlink`) for
  the status snapshot the widget and App Intents read. On the watch it's the same idea in its own
  container: the watch app republishes the phone's relayed snapshot into the group so its
  complications can glance it. Because App Group containers are namespaced by
  the signing team, these targets must share one `DEVELOPMENT_TEAM` — matching group ids alone
  aren't enough, or the group silently isn't shared and the widget / Control Center reads a stale,
  process-private copy.

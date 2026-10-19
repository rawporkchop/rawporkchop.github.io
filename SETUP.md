# Project Brief: Volvo 245 Portfolio

This file is instructions for a Claude Code session. Read it fully before writing any code.

---

## 1. What we're building

A personal portfolio site whose centerpiece is an interactive 3D model of a **1985 Volvo 245 wagon in Volvo teal blue**.

Interaction model:

- The site opens on a three-quarter exterior view of the car, slowly rotating or idling.
- Clickable hotspots sit on the car. Clicking one flies the camera to that location and opens a panel of portfolio content.
- The signature move: a hotspot on the driver's door takes the camera **inside the cabin**, framed on the dashboard. From there, interior hotspots (gauge cluster, radio, glovebox, rear cargo area) lead to further sections.
- A persistent "back" control returns the camera to the exterior overview.

**Click-driven, not scroll-driven.** Camera moves are discrete animated transitions between named viewpoints, never tied to scroll position.

---

## 2. The single most important constraint

**The person you are working with is new to TypeScript and React.** This project is explicitly a learning exercise. That changes how you should work.

Do this:

- **Explain before you write.** When introducing a concept for the first time — a hook, a generic, a discriminated union, a ref — say what it is and why it's the right tool here, in a few sentences, before the code appears.
- **Write small commits with clear boundaries.** One concept per step. Stop and let them read.
- **Prefer the boring, explicit version** over the clever one. `useState` with three separate values beats a reducer with a generic action union, at this stage. Verbose types that state the obvious are good teaching material.
- **Point out when TypeScript catches something.** If a type error prevents a bug, say so explicitly — that's the whole argument for TypeScript, and seeing it live is worth more than a lecture.
- **Flag the React Three Fiber mental model repeatedly.** R3F's biggest conceptual trap is that it looks like React but animation does *not* go through React state. See §7.
- **Ask before introducing a new dependency.** Every library added is a thing they have to learn.

Do not do this:

- Don't generate three files at once and move on.
- Don't use `any` to make an error go away. If a type is hard, explain why it's hard and model it properly. `unknown` plus narrowing is a teachable moment; `any` teaches nothing.
- Don't reach for a state management library. There is no state here that `useState` and props can't handle.
- Don't silently refactor working code into a "cleaner" abstraction. Abstractions should arrive when there is concrete duplication to remove, and should be explained as such.

---

## 3. Stack

| Concern | Choice |
|---|---|
| Build tool | Vite |
| Language | TypeScript, `strict: true` |
| UI | React 19 |
| 3D | Three.js via `@react-three/fiber` v9 |
| 3D helpers | `@react-three/drei` |
| Animation | start with `maath`/manual lerping; add a tweening lib only if needed |

**Version pairing matters.** R3F v9 is the React 19 compatible line; R3F v8 will not work with React 19. `@react-three/drei` v10 is the line that pairs with R3F v9. Install latest of each and let npm resolve, but if you hit a reconciler error on startup, a mismatched R3F/React pair is the first thing to check.

Scaffold with:

```
npm create vite@latest . -- --template react-ts
npm install three @react-three/fiber @react-three/drei
npm install -D @types/three
```

Keep `strict: true`. It is more friction up front and it is the entire point of the exercise.

---

## 4. Suggested file layout

Don't create all of this on day one. Let it grow into this shape.

```
src/
  main.tsx
  App.tsx
  scene/
    Scene.tsx            # <Canvas> and its contents
    Lighting.tsx
    CameraRig.tsx        # owns all camera movement
    Volvo245.tsx         # the car model, one component boundary
    Hotspot.tsx          # a single clickable marker
  content/
    viewpoints.ts        # named camera positions, typed
    sections.ts          # portfolio content keyed to viewpoints
  ui/
    Panel.tsx            # the DOM overlay for section content
    Nav.tsx
  types.ts
```

**`Volvo245.tsx` is a deliberate seam.** Whatever is inside it — procedural boxes now, a loaded GLTF later — the rest of the app only knows that it renders a car and exposes hotspot anchor points. Swapping the model should not touch `CameraRig` or any content file.

---

## 5. The car model

### Phase 1: blockout (start here)

Hand-build a low-poly 245 from primitives in R3F. The 245 is close to ideal for this — it's a long rectangular body with a squared greenhouse, flat glass, and almost no compound curves. A clean stylized blockout will read as a deliberate art direction, not as a placeholder.

Get these proportions right, because they're what make it recognizable:

- Long flat hood, near-vertical front fascia, no rake.
- Squared-off greenhouse with thin pillars and large flat glass.
- The roofline runs dead flat all the way to the rear, ending in a vertical tailgate. This is the single most identifiable feature.
- Prominent rub strip running the length of the body side.
- Chunky black plastic bumpers front and rear standing proud of the body.
- '85 is post-facelift: flat grille, flush rectangular headlights, US-spec sealed beams.

Work from blueprint side/front/top views as reference — free raster blueprints of the 245 wagon exist and are enough for proportions.

### Phase 2: refinement (later, optional)

Either model it properly in Blender and export GLTF, or source one. If sourcing, check the license — several commercial 245 models carry editorial-use-only restrictions that are a poor fit for a public portfolio.

Photogrammetry of the real car is a legitimate option but is its own project. Defer it.

### The paint

Volvo classic teal blue. Start around `#2F6B75` to `#1F5C6B` and tune against photos of the actual car. Put it in one place as a named constant and reference it everywhere — don't scatter hex values.

Use `meshStandardMaterial` with moderate roughness, around 0.4 to 0.5. Resist making it mirror-finish; a 40-year-old single-stage paint job has a softer sheen, and the slightly matte look will read as more authentic than showroom gloss.

---

## 6. Camera and hotspot design

This is the architectural core. Get it right early.

Define viewpoints as data, not as scattered logic:

```ts
type ViewpointId =
  | 'overview'
  | 'dashboard'
  | 'gauges'
  | 'radio'
  | 'cargo';

interface Viewpoint {
  id: ViewpointId;
  position: [number, number, number];  // where the camera sits
  target:   [number, number, number];  // what it looks at
  label: string;
}
```

Then the entire app state for navigation is one value: which `ViewpointId` is active. `CameraRig` watches it and animates toward the matching viewpoint. Hotspots set it. The content panel reads it.

That union type is a good first lesson in why TypeScript helps: add a viewpoint to the union, and the compiler tells you every place that now needs handling.

Camera transitions should ease, not snap. Interpolate position and target each frame toward the goal. Exterior→interior is the one that needs the most care — a straight line will clip through the door. Consider a waypoint, or an arc that swings around and in through the window.

---

## 7. The R3F concept to hammer home

**Animation does not go through React state.**

React re-renders on state change. A 60fps animation would mean 60 re-renders per second, which is both slow and the wrong model entirely.

Instead, `useFrame` runs a callback every frame and mutates the Three.js object directly through a ref. The React tree doesn't re-render at all:

```tsx
const ref = useRef<THREE.Mesh>(null);
useFrame((_, delta) => {
  if (!ref.current) return;
  ref.current.rotation.y += delta * 0.2;
});
```

Note `delta` — multiply by it so motion is framerate-independent. Note the null check — refs start null, and `strict: true` forces you to handle that. Both are worth calling out when they first appear.

Rule of thumb to state plainly: **React state for things that change when the user acts** (which viewpoint is active, is the panel open). **Refs and `useFrame` for things that change every frame** (camera position, rotation, hover glow).

---

## 8. Build order

Each step should end with something visible in the browser.

1. Vite + React + TS scaffold. Confirm it runs. Look at the generated files together and explain what each one does.
2. A `<Canvas>` with a single spinning cube. This is the R3F "hello world" and introduces `useFrame`.
3. Lighting and a ground plane. Make it look deliberate, not like a default scene.
4. Blockout the car body. Iterate on proportions until it reads as a 245.
5. Apply the teal paint and material.
6. `OrbitControls` from drei, temporarily, so the car can be inspected from all angles while building. Remove it later when the camera rig takes over.
7. The viewpoint type and data. One state value in `App`.
8. `CameraRig` — animate between two viewpoints via a test button.
9. Hotspot components. Click to set viewpoint. Hover state.
10. The exterior→interior transition. This is the hard one; expect to iterate.
11. Interior detail: dashboard, gauge cluster, enough to be legible from the interior camera position.
12. The DOM content panel overlaying the canvas.
13. Placeholder content in `sections.ts`, structured so real content drops in later.
14. Mobile fallback and performance pass.
15. Accessibility: keyboard navigation between hotspots, and a no-3D content route.

Don't start step N+1 until step N works and they understand it.

---

## 9. Things that will go wrong

- **Scale drift.** Pick a unit convention immediately — 1 unit = 1 meter. A 245 is roughly 4.8m long, 1.7m wide, 1.4m tall. Build to those numbers and the camera positions will be sane.
- **Interior lighting.** The cabin will be pitch black with only exterior lights. It needs its own light sources, placed so the dashboard is legible.
- **Camera clipping.** Interior positions sit close to geometry. Tune the camera's `near` plane.
- **Performance on mobile.** A blockout model will be fine. Keep it that way — check before adding geometry.
- **No-WebGL fallback.** Some visitors, and some recruiters' locked-down laptops, won't render this. The portfolio content must be reachable without the 3D scene. Build this as a real route, not an apology message.

---

## 10. Content

No written content exists yet. Use clearly-marked placeholders and keep `sections.ts` as the single place content lives, so filling it in later is a text-editing task and not a code change.

Suggested mapping of hotspots to sections, to be revised:

- Exterior overview → intro / who I am
- Dashboard → projects
- Gauge cluster → skills
- Radio → writing, or something personal
- Cargo area → contact / resume

---

## 11. How to open the first session

Paste this into Claude Code to start:

> Read SETUP.md. Pay particular attention to section 2 — I'm new to TypeScript and React and I want to understand what we're building as we build it. Start at step 1 of the build order and stop after the scaffold so I can look at it before we continue.

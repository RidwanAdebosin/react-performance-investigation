# Odin Task Walkthrough — React Rendering Performance Investigation

Private guide for the recording session. Fill in the blanks as you work. Record only what you actually do and observe. Keep this file off screen during the recording (see section K).

---

## A. Approved Task Objective

Investigate unnecessary re-rendering in a React + TypeScript application that contains an interactive list. Identify which component updates are triggered by state changes unrelated to the list. Use React Developer Tools to determine the underlying cause, implement a targeted optimization, and verify that rendering improves without changing functionality.

Deliverables:

- [ ] Optimized React + TypeScript interface
- [ ] Genuine before-and-after profiling evidence
- [ ] Completed `react-performance-investigation.md` report

---

## B. Prepared Environment

**Stack:** Vite 8.3.5, React 19.3.1, React DOM 19.3.1, TypeScript 6.0.3, ESLint 10 with `eslint-plugin-react-hooks` and `typescript-eslint`. Package manager: **npm** (lockfile: `package-lock.json`).

**Files to inspect:**

| File | Contents |
| --- | --- |
| `src/main.tsx` | Entry point; renders `<App />` inside `<StrictMode>` |
| `src/App.tsx` | Root component |
| `src/components/Counter.tsx` | Counter button |
| `src/components/SearchBar.tsx` | Search input |
| `src/components/TaskList.tsx` | List container |
| `src/components/TaskItem.tsx` | Single list row |
| `src/data/tasks.ts` | `Task` type and synthetic sample data (48 tasks) |
| `src/App.css`, `src/index.css` | Styling only |
| `vite.config.ts` | Vite config (`@vitejs/plugin-react`, no extra Babel/compiler plugins) |

**Scripts (`package.json`):**

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start dev server at <http://localhost:5173/> |
| `npm run build` | Type-check (`tsc -b`) and production build |
| `npm run lint` | ESLint |
| `npm run preview` | Serve the production build |

There is no test runner configured in this project.

**Start the app:**

```bash
cd ~/Downloads/react-performance-investigation
npm run dev
```

Then open <http://localhost:5173/> in Google Chrome.

**Environment notes:**

- The React Compiler is **not** enabled (no compiler plugin in `vite.config.ts`).
- The dev server runs React's development build. `<StrictMode>` is on in `src/main.tsx`. Development-build timings are slower than production; compare before/after under the same conditions.
- Profiling `npm run build` output requires React's profiling build, which is not configured. Use `npm run dev` for profiling unless you deliberately set that up.

**Manual setup still required (do before recording):**

- [ ] Install **React Developer Tools** in Google Chrome from the Chrome Web Store (publisher: Meta). If it is already installed, update it so it supports React 19.
- [ ] Open <http://localhost:5173/>, open Chrome DevTools (Chrome's ⋮ menu → More Tools → Developer Tools), and confirm the **⚛ Components** and **⚛ Profiler** tabs appear. If they don't, reload the page with DevTools open.
- [ ] Alternative if the extension can't be used: the standalone `react-devtools` app (`npx react-devtools`). It requires adding its connection script to `index.html`, which would be a change to the project — note it in the implementation log if you use it.
- [ ] Do a short dry run (without recording) so you aren't learning DevTools through trial and error on camera.

**Recording setup checklist:**

- [ ] Quiet, private room; notifications silenced (macOS Focus / Do Not Disturb).
- [ ] Microphone tested: clear, not muffled, consistent volume. Record a 10-second test and play it back.
- [ ] Unrelated apps closed or minimized; no personal information (email, messages, bookmarks bar with private sites, other Chrome profiles) visible.
- [ ] This walkthrough and other private notes **not** visible on screen.
- [ ] Menu bar, clock, and Dock visible. Do not use full-screen mode.
- [ ] Editor and Chrome arranged side by side (window tiling) or each at ordinary Fill size; text large enough to read.
- [ ] Chrome DevTools docked so both the app and the Profiler are readable.
- [ ] Editor and browser language/menus in English.
- [ ] Dev server already running in a terminal, or plan to start it on camera and narrate it.
- [ ] Other heavy tabs/apps closed to reduce timing noise.

---

## C. Initial Codebase Assessment

- [ ] Sketch the component hierarchy (root → children → list rows):
  - Hierarchy: ______________________________________
- [ ] For each piece of state, note where it is declared and which components read it:

  | State | Owner component | Read by | Updated by |
  | --- | --- | --- | --- |
  |  |  |  |  |
  |  |  |  |  |
  |  |  |  |  |

- [ ] List the props each child receives and where each prop value is created:

  | Component | Props | Where the value comes from |
  | --- | --- | --- |
  |  |  |  |
  |  |  |  |

- [ ] Identify every event handler, where it is defined, and what it updates:
  - ______________________________________
- [ ] Read the list-rendering logic (filtering, mapping, keys):
  - ______________________________________
- [ ] Note which pieces of state are related to the list and which are not:
  - ______________________________________

---

## D. Reproducing the Issue

Write the exact interactions you will use, so you can repeat them identically after the change.

1. ______________________________________
2. ______________________________________
3. ______________________________________
4. ______________________________________
5. ______________________________________

Suspected unnecessary renders noticed during reproduction: ______________________________________

---

## E. Profiling the Original Behavior

- [ ] Open Chrome DevTools → **⚛ Profiler** tab.
- [ ] Open the Profiler settings (gear icon) and review the options. Consider enabling **"Record why each component rendered while profiling."**
- [ ] Optionally, in **⚛ Components** settings → General, consider enabling **"Highlight updates when components render"** for a visual check.
- [ ] Reload the page so you start from a clean state (Chrome's reload button left of the address bar).
- [ ] Click **Record** (blue circle), perform interaction #___ from section D, then click **Stop**.
- [ ] Repeat the recording for each interaction you want as a baseline.
- [ ] For each commit, inspect:
  - [ ] **Flamegraph** view: which components rendered (colored) vs. did not (gray)
  - [ ] **Ranked** view: which components took the most time
  - [ ] Selected component's side panel: render times and "Why did this render?"
- [ ] Capture evidence (screenshots or exported profile via the Profiler's save/export button) and note filenames.

Baseline observations:

| Interaction | Commits | Components that rendered | Render duration(s) | "Why did this render?" | Evidence file |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |
|  |  |  |  |  |  |
|  |  |  |  |  |  |

Other notes: ______________________________________

---

## F. Investigation and Root-Cause Analysis

- Components that rendered during the unrelated interaction: ______________________________________
- Which of those renders are expected, and why: ______________________________________
- Which renders appear unnecessary, and why: ______________________________________
- What the Profiler reported as the reason for those renders: ______________________________________
- Which props/values changed (or appeared to change) between renders: ______________________________________
- Code location(s) that explain the behavior: ______________________________________
- Root cause in your own words: ______________________________________
- Evidence that supports this diagnosis: ______________________________________
- Anything that contradicts it, or that you are unsure of: ______________________________________

---

## G. Optimization Decision

- Approaches considered:

  | Approach | What it would change | Pros | Cons / risks | Fits the evidence? |
  | --- | --- | --- | --- | --- |
  |  |  |  |  |  |
  |  |  |  |  |  |
  |  |  |  |  |  |

- Chosen approach: ______________________________________
- Why it fits the evidence in section F: ______________________________________
- Why the alternatives were not chosen: ______________________________________
- Expected effect on render behavior (to be verified, not assumed): ______________________________________
- What must keep working unchanged: ______________________________________

---

## H. Implementation Log

| File | Change made | Reason | Observed effect |
| --- | --- | --- | --- |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |

---

## I. Before-and-After Verification

- [ ] Restart/reload under the same conditions as the baseline (same dev server, same browser, same Profiler settings).
- [ ] Repeat each interaction from section D exactly.
- [ ] Record a Profiler session for each interaction and capture evidence.
- [ ] Compare against the baseline:

  | Interaction | Before: components rendered | After: components rendered | Before: duration | After: duration | Evidence files |
  | --- | --- | --- | --- | --- | --- |
  |  |  |  |  |  |  |
  |  |  |  |  |  |  |

- [ ] Functional checks:
  - [ ] Counter still increments correctly
  - [ ] Search filters by title
  - [ ] Search filters by category
  - [ ] Empty state appears when nothing matches
  - [ ] Clearing search restores the full list
  - [ ] Toggling a task's checkbox updates that task (strike-through + count)
  - [ ] Toggled state persists while filtering and after clearing the search
  - [ ] Interactions still cause the renders they *should* (e.g. the toggled row still updates)
  - [ ] No new errors or warnings in the browser console
- Notes on any differences or surprises: ______________________________________

---

## J. Final Checks

- [ ] Review the full diff of your changes (compare against the prepared baseline)
- [ ] `npm run lint` passes — result: ______
- [ ] `npm run build` passes (includes `tsc -b` type-check) — result: ______
- [ ] No unrelated changes, debug code, or leftover logging
- [ ] Profiling evidence files are saved and named clearly
- [ ] Limitations identified (dev vs. production build, StrictMode, data size, machine variance, scope of change): ______________________________________
- [ ] `react-performance-investigation.md` completed with genuine observations only, and **saved** on camera

---

## K. Recording Narration Guide

**Goal:** someone should be able to follow the whole workflow from your narration alone, without seeing the screen. Speak like a professional teaching a colleague.

### What, Where, Why — for every meaningful step

- **What:** the action you are about to take.
- **Where:** the exact application, file, component, panel, menu, button, or screen area.
- **Why:** how the action helps investigate or resolve the performance issue.

Also narrate:

- [ ] **What you are analyzing** before you make a decision.
- [ ] **What happened** after each action (describe the actual result).
- [ ] **How you verified it.**
- [ ] **Every keyboard shortcut**, announced before or as you press it (e.g. "I'll press Command-S to save `App.tsx`").

### Name the target — avoid "this", "that", "here"

| Avoid | Say instead (adapt to what is really on screen) |
| --- | --- |
| "I'll click this." | "I'll click the blue Record circle at the top-left of the Profiler panel." |
| "I'm opening that file." | "I'm opening `TaskList.tsx` from the `components` folder in the Explorer sidebar." |
| "It's saved." | "`react-performance-investigation.md` is now saved in the project root." |

For unlabeled icons, name the panel, function, or visible symbol (e.g. "the gear icon in the Profiler toolbar").

### Mouse and pacing — Move → Pause → Point → Act

- [ ] Point at the code, button, or Profiler bar you are talking about; trace lines of code when explaining them.
- [ ] Pause over controls so tooltips appear.
- [ ] Click deliberately and pause about **one second** after each click.
- [ ] Prefer visible controls (menus, buttons, Explorer sidebar) over shortcuts.
- [ ] Let each action finish before starting the next.
- [ ] Say when you scroll and what you are looking for.
- [ ] Announce panel/tab changes (Components ↔ Profiler, Flamegraph ↔ Ranked).
- [ ] Announce application switches (editor ↔ Chrome ↔ terminal).

### Typing limits (coding task)

- [ ] Total typing ≤ **35%** of the recording.
- [ ] No continuous typing stretch longer than **45 seconds**. Break edits into short chunks, pause, review what you typed, and explain it.

### Audio

- [ ] No silence longer than **45 seconds**. A pause over **60 seconds** is a failure. Keep talking while waiting for builds or reading Profiler data.
- [ ] Consistent volume, clear speech, English only, no profanity, no private information.

### Mistakes

1. Acknowledge the mistake.
2. Say what you are correcting.
3. Make one deliberate correction.
4. Confirm it worked.
5. Continue.

Restart only if corrections start to dominate, an error changes the final result and can't be fixed on screen, or frequent errors make the recording hard to follow.

### Honesty

- [ ] Describe only what you actually see. Don't predict or invent results; if something is unexpected, say so.
- [ ] When reading Profiler data, read out the actual values shown.

### Before submitting — review the recording

- [ ] Narration audible at the beginning, middle, and end, and matches the actions shown
- [ ] No gaps over 45 seconds; none over 60 seconds
- [ ] Every keyboard shortcut announced
- [ ] No background noise covering narration; no PII or profanity
- [ ] Complete workflow shown, through to the saved final deliverables
- [ ] Typing within limits; cursor movement natural and deliberate
- [ ] Relevant windows visible throughout; mistakes corrected and verified

---

## L. Final Deliverables

- Final optimized files: ______________________________________
- Profiling evidence (before): ______________________________________
- Profiling evidence (after): ______________________________________
- Report location: `react-performance-investigation.md` — completed: [ ]
- Verification results: ______________________________________
- Remaining limitations: ______________________________________

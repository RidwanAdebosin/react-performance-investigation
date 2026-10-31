# Recording Script — React Rendering Performance Investigation (A → Z)

Private script. Keep it on a second screen or printed; never on camera.
Every step has **Say** (narration), **Do** (exact action), and where relevant **Code** (exact file, line, text).
Line numbers refer to the files **as they are now** (before you edit). Follow the stages in order.

Rules that apply to the whole recording (from the Odin narration guidelines):
- **What / Where / Why for every meaningful step.** Say the action, the exact control and its location, and the purpose or result. Template: "I'll click **[control]** (what) in the **[location]** (where) to **[purpose]** (why)." Then say what actually happened.
- **Name the target.** Never "this", "that", "here", "the right-side button". Say "the blue Start profiling circle at the top-left of the Profiler toolbar". For unlabeled icons, name the panel, the function and the visible symbol.
- **Cursor matches narration.** Keep the pointer on the thing you are naming while you name it. Trace lines of code with the cursor as you explain them.
- **Move → Pause → Point → Act.** Move slowly, pause over a control so its tooltip appears, then click. Pause about **one second after every click**. Let each action finish before the next.
- **Mostly mouse-driven.** Use menus and visible buttons. This script uses **File → Save** instead of Command-S, and the search box's **×** clear button instead of select-all. If you do use a shortcut, announce it before pressing it ("I'll press Command-S to save App.tsx").
- **Typing limits for a coding task:** at most **35 %** of the recording, and no continuous stretch over **45 s**. Each edit in Stage 5 is split into bursts of a few lines with a review pause between them.
- **No silence over 45 s; over 60 s is a fail.** Every wait in this script (server start, hot reload, build, save dialogs) has a "while waiting, say" line.
- **Honesty.** Read out only the **actual** values on screen. The "Expected" lines in this script tell you what to look for, not what to say. If you see something different, say so and describe it.
- English only, no profanity, no personal information on screen or in audio.

---

## STAGE 0 — Before pressing Record (off camera)

1. A Vite dev server is already listening on port 5173 on this Mac (PID shown by `lsof -nP -iTCP:5173`). Either reuse it, or stop it so that `npm run dev` on camera gets port 5173 and not 5174:
   ```bash
   lsof -ti :5173 | xargs kill
   ```
2. Confirm React Developer Tools is installed in Chrome (Chrome Web Store, publisher Meta) and up to date (needs React 19 support). Open <http://localhost:5173/>, open DevTools, confirm the **⚛ Components** and **⚛ Profiler** tabs appear. If not, reload with DevTools open.
3. Dry-run Stage 3 and Stage 5 once without recording so the Profiler clicks are familiar.
4. Create an evidence folder in the project root (it is fine to commit it):
   ```bash
   mkdir -p /Users/ridwanadebosin/Downloads/react-performance-investigation/profiling
   ```
5. Arrange windows: VS Code left, Chrome right with DevTools docked to the bottom (DevTools ⋮ menu → Dock side → bottom). Font size readable. Menu bar and Dock visible, not full screen. Do Not Disturb on. Close other Chrome profiles/tabs.
6. **Hide private project documentation.** The guidelines forbid showing project documentation, and the VS Code Explorer would show this script and the Odin walkthrough.
   - Move this script out of the project. It is untracked, so it would also appear in `git status` on camera:
     ```bash
     mv /Users/ridwanadebosin/Downloads/react-performance-investigation/RECORDING_SCRIPT.md ~/Documents/
     ```
   - Hide `ODIN_TASK_WALKTHROUGH.md` from the Explorer without moving it. It is tracked by git, so moving it would show as a deletion in `git diff`. Create `.vscode/settings.json` in the project (the folder is gitignored, so it never appears in git output):
     ```json
     {
       "files.exclude": {
         "ODIN_TASK_WALKTHROUGH.md": true,
         ".vscode": true
       }
     }
     ```
   - Open the script from `~/Documents` on a second screen, a phone, or printed paper.
7. Editor: open the project folder in VS Code. Close every editor tab except `react-performance-investigation.md`. Set the editor font large enough to read (Code → Settings → Settings → "Editor: Font Size", e.g. 16).
8. Verify the working tree is clean: `git status` prints nothing. Stage 7 relies on `git diff` showing only your changes.
9. **Audio check.** Record a 10-second test in a quiet room and play it back. Voice must be clear, not muffled, at a steady volume, with no fan, traffic or keyboard noise covering it. Silence notifications with macOS Focus → Do Not Disturb.
10. **Window plan.** Keep the menu bar, clock and Dock visible, and never use full screen. Use either one active window at Fill size (Window → Fill) and switch between VS Code and Chrome, or tile them side by side (Window → Move & Resize → Left/Right). Do not leave small floating windows or overlapping windows. Minimize anything not needed for the current step.

---

## STAGE 1 — Intro and codebase assessment (≈ 4 min, no typing)

**Say:** "Today I'm investigating unnecessary re-rendering in a small React 19 and TypeScript app built with Vite. The app has an interactive task list, a search box and a counter. The goal is to find which components re-render when state unrelated to the list changes, prove it with React Developer Tools, apply a targeted fix, and verify it without changing behaviour."

**Do:** In the VS Code Explorer sidebar, expand `src` and `src/components`.
**Say:** "I'll click the **src** folder in the Explorer sidebar on the left of VS Code to expand it, then the **components** folder inside it, so all the source files are visible before I read them." 

### 1a. `package.json` (project root)
**Do:** Click `package.json`.
**Say:** "In package.json I can see the stack: React and React DOM 19.3.1, TypeScript 6, Vite 8, ESLint 10 with the React Hooks plugin. The scripts are dev, build, lint and preview. There's no test runner, so verification will be done with the Profiler, manual checks, lint and build."

### 1b. `src/main.tsx`
**Do:** Click `src/main.tsx`. Point at line 7.
**Say:** "main.tsx renders App inside StrictMode. StrictMode double-invokes render functions in development, so Profiler timings will be inflated. That's fine as long as I compare before and after under the same conditions."

### 1c. `src/App.tsx` — the root, where all state lives
**Do:** Click `src/App.tsx`. Trace with the mouse as you talk.
**Say, pointing at lines 9–11:** "App owns all three pieces of state: count on line 9, query on line 10, and tasks on line 11. Only query and tasks are related to the list. Count is completely unrelated to the list."
**Say, pointing at lines 13–18:** "On every render App derives visibleTasks by filtering the tasks array. Note that filter returns a brand-new array every time App renders, even if nothing in it changed."
**Say, pointing at lines 20–26:** "toggleTask is declared inside the component body as a plain arrow function. That means it is a new function object on every render of App."
**Say, pointing at lines 32, 35, 41:** "Counter receives count and an inline arrow. SearchBar receives query and setQuery. TaskList receives visibleTasks and toggleTask. So whenever count changes, App re-renders, and it passes TaskList a fresh array and a fresh function, both created in that render."

### 1d. `src/components/TaskList.tsx`
**Do:** Click it. Point at lines 16–18.
**Say:** "TaskList maps the tasks array to a TaskItem per row, keyed by task.id, and forwards onToggle to each row. It also handles the empty state on line 11. Nothing here is memoized."

### 1e. `src/components/TaskItem.tsx`
**Do:** Click it.
**Say:** "TaskItem is a plain function component rendering a list item with a checkbox, title and category. It only depends on its task prop and onToggle. There's no memo wrapper, so it renders whenever its parent renders."

### 1f. `src/data/tasks.ts`
**Do:** Click it. Point at line 22.
**Say:** "The data is deterministic: six verbs times eight subjects, so 48 tasks. 48 rows is enough to make unnecessary list renders visible in the Profiler."

### 1g. `Counter.tsx` and `SearchBar.tsx`
**Do:** Click each briefly.
**Say:** "Counter and SearchBar are simple presentational components. Counter is the component that changes state unrelated to the list, so it will be the interaction I focus on."

**Say (hypothesis):** "My hypothesis before measuring: clicking the counter re-renders App, and because nothing below App is memoized, every child including all 48 TaskItems re-renders too. I'll now confirm that with the Profiler rather than assume it."

---

## STAGE 2 — Start the dev server and open the app (≈ 2 min)

**Do:** In VS Code, open the integrated terminal: menu **Terminal → New Terminal**.
**Say:** "I'm opening the integrated terminal from the Terminal menu to start the Vite dev server."
**Do:** Type:
```bash
npm run dev
```
**Say:** "npm run dev starts Vite in development mode on localhost port 5173. I'm using the dev build because the React DevTools Profiler needs the development or profiling build of React."
**Do:** Wait for the "Local: http://localhost:5173/" line. Read the URL out loud. If Vite prints 5174, say so and use that URL everywhere below.
**While waiting, say:** "Vite is bundling the TypeScript source on demand. When it's ready it prints the local URL in the terminal panel at the bottom of VS Code."
**Do:** Switch to Chrome. **Say:** "I'm switching from VS Code to Google Chrome by clicking its icon in the Dock." Click the address bar, type `localhost:5173`. **Say:** "I'll press Enter to load the page." Press Enter.
**Say:** "The app shows a Task board heading, a 'Count is 0' button, a search box, a summary line 'Showing 48 of 48 tasks', and the list."

### 2a. Reproduce the interactions (functional baseline)
Perform these exactly, in this order; you will repeat them identically after the fix. Narrate each with What/Where/Why, e.g. "I'll click the **Count is 0** button in the top-right of the Task board header three times, to check the counter works before I profile it. The button now reads Count is 3, and the list below hasn't visibly changed." 

| # | Interaction | What to say you observe |
| --- | --- | --- |
| 1 | Click **Count is 0** three times | Button goes to Count is 3. List and summary visually unchanged. |
| 2 | Click into Search, type `docs` | List shrinks; summary shows "Showing N of 48 tasks" (read N). |
| 3 | Click the small **×** clear button at the right end of the search box | Search is empty; full list of 48 returns. |
| 4 | Click the checkbox on the **first** row | Row gets strike-through; its checkbox is checked. |
| 5 | Type `zzz` in Search | "No tasks match your search." appears. Then click the **×** clear button. |

**Say:** "Functionally everything works. The problem is not visible to the eye; it's about how much work React does behind the scenes. That's what the Profiler will show."

---

## STAGE 3 — Profile the ORIGINAL behaviour (≈ 6 min)

### 3a. Open the Profiler and set it up
**Do:** Open Chrome DevTools from the menu, not the shortcut.
**Say:** "I'll click Chrome's three-dot menu at the top-right of the window, hover over **More Tools**, and choose **Developer Tools**, to open the browser's developer panel."
**Do:** Click the **⚛ Profiler** tab (may be under the » overflow chevron).
**Say:** "In the DevTools tab bar I'll click the **Profiler** tab with the React atom icon." If it's hidden: "It's under the double-chevron overflow button at the end of the tab bar." 
**Say:** "I'm opening the React Profiler tab from React Developer Tools. This records every commit React makes and shows which components rendered and how long each took."
**Do:** Click the **gear icon** in the Profiler toolbar → **Profiler** tab in the settings panel → tick **"Record why each component rendered while profiling."** Close settings with the **×** at the top-right of the settings dialog. Hover over the gear first so its "View settings" tooltip appears.
**Say:** "I'm enabling 'Record why each component rendered' so that each component bar will tell me whether it rendered because props changed, hooks changed, or simply because its parent rendered. That distinction is the key to the diagnosis."
**Do (optional, visual aid):** Gear → **General** → tick **"Highlight updates when components render."** Click the counter once: the whole list flashes. Say what you see. Then untick it so it does not add overhead to recordings.

### 3b. Recording 1 — counter click (the unrelated interaction)
**Do:** Click Chrome's reload button to start from a clean state.
**Say:** "I'll click Chrome's circular-arrow reload button, left of the address bar, so the app starts from a fresh state with count at zero."
**Do:** Click the blue **Start profiling** circle at the top-left of the Profiler panel.
**Say:** "I'll click the blue **Start profiling** circle at the top-left of the Profiler toolbar to begin recording commits. It turns red while recording."
**Do:** Click **Count is 0** exactly **once**. **Say:** "I'll click the Count is 0 button once in the app header. It now reads Count is 1."
**Do:** Click the red **Stop profiling** circle. **Say:** "I'll click the same circle, now red, to stop recording. The Profiler now shows the recorded commit." 
**Say:** "I recorded one interaction: a single counter click. I'll now inspect the commit."

**Do:** With the **Flamegraph** view selected (dropdown at the top of the Profiler), hover and click each bar; read the real values:
- Click **App** → side panel shows render duration and "Why did this render?" → expect **Hooks changed** (the count state). Read it.
- Click **Counter** → expect **Props changed: count**.
- Click **SearchBar** → expect **The parent component rendered**.
- Click **TaskList** → expect **The parent component rendered**.
- Click one **TaskItem** → expect **The parent component rendered**. Point out that every TaskItem bar is coloured, not grey.
**Say:** "So a counter click, which has nothing to do with the list, caused TaskList and all 48 TaskItems to render. Their props didn't meaningfully change; React re-rendered them simply because App rendered. This is the unnecessary work."

**Do:** Switch the view dropdown to **Ranked**.
**Say:** "Ranked view sorts components by render time for this commit." Read the top entries and the total commit duration shown in the right panel (e.g. "the commit took X ms"). Say the actual number.

**Do:** Click the **Save profile** (down-arrow) icon in the Profiler toolbar. In the macOS save dialog, navigate to the project's `profiling/` folder and name the file `before-counter-click.json`.
**Say:** "I'll click the down-arrow **Save profile** icon in the Profiler toolbar to export this recording as evidence. In the save dialog I'm choosing the profiling folder inside the project and naming the file before-counter-click.json. It's now saved in the profiling folder." Close the dialog fully before continuing.
**Do (optional screenshot):** **Say:** "I'll press Command-Shift-4, which turns the cursor into a crosshair, and drag over the Profiler panel to capture the flamegraph." The image lands on the Desktop; move it into `profiling/` off camera after the recording, or skip screenshots since the exported JSON can be reloaded with the **Load profile** button.

### 3c. Recording 2 — toggle one checkbox (list-related, but still over-rendering)
**Do:** Reload. Start profiling. Click the checkbox on the **first** row once. Stop.
**Do:** In Flamegraph, click a TaskItem that was **not** toggled → expect **The parent component rendered**. Click the toggled one → expect **Props changed: task**.
**Say:** "Toggling one task should, ideally, re-render just that one row. Instead all 48 rows render, again because the parent rendered."
**Do:** Save as `profiling/before-toggle-first-row.json`.

### 3d. Recording 3 — typing in search (expected renders, for context)
**Do:** Reload. Start profiling. Type a single letter `d` in Search. Stop.
**Say:** "Typing in search legitimately changes which rows are visible, so TaskList rendering here is expected. I'm recording it so I can confirm the fix doesn't break this path." Note the number of commits (one per keystroke).
**Do:** Save as `profiling/before-search-d.json`.

### 3e. Write the baseline into the report (short typing burst)
**Do:** Switch to VS Code, open `react-performance-investigation.md`, and under **5. Observations and Evidence** type a short table with the **actual** numbers you read. Keep it under 45 s of typing; say "I'll finish the prose later and fill the numbers now while they're on screen."

---

## STAGE 4 — Root-cause analysis and decision (≈ 3 min, no typing)

**Do:** Go back to `src/App.tsx`. Trace lines 14, 20 and 41.
**Say:** "Root cause, linking code to evidence:
1. All three pieces of state live in App, so any state change re-renders App.
2. None of the children are memoized, so React re-renders every child whenever App renders. That's exactly what the Profiler reported: 'The parent component rendered' for TaskList and every TaskItem.
3. Even if I memoized TaskList and TaskItem on their own, it wouldn't help yet, because on line 14 visibleTasks is a new array on every render and on line 20 toggleTask is a new function on every render. Memo compares props by reference, so those props would look 'changed' on every counter click."

**Say (options):** "Approaches I considered:
- **Option A — memo the list components and stabilise their props** with useCallback for toggleTask and useMemo for visibleTasks. Small, targeted, keeps behaviour identical. This directly matches the evidence.
- **Option B — move the counter state out of App** into a separate component or sibling, so a counter click never renders App. Also valid, but it restructures the component tree and doesn't fix the toggle case where all 48 rows render.
- **Option C — enable the React Compiler.** It automates memoization, but it's a build-tool change with a performance cost in dev, the README notes it is deliberately off, and it would hide the reasoning rather than show it.
I'm choosing Option A because it fixes both the counter and toggle cases with four small, reviewable edits, and because I can verify each edit in the Profiler."

**Say (plan):** "I'll make the change in two steps so the Profiler shows why each is needed: first memo(TaskItem) alone, which I expect will still re-render and tell me 'Props changed: onToggle'; then stabilise the props with useCallback and useMemo and memo TaskList."

---

## STAGE 5 — Implementation (≈ 8 min, typing in 4 short bursts)

**Typing discipline:** before each edit, put the cursor on the target line and say what you will change and why. Type one small chunk (an import line, or the opening `useCallback(`), stop, point at what you typed, then type the closing part. Never type for more than about 30 s without pausing to explain. For the multi-line useMemo edit, type the `useMemo(() =>` wrapper first, pause and explain, then indent the existing filter and add the dependency array.

### Edit 1 — `src/components/TaskItem.tsx`: wrap in memo
**Say:** "First edit, TaskItem.tsx. I'll import memo from React and export the memoized component. memo makes React skip re-rendering this component when its props are referentially equal to last time."

**Code — insert a new line 1** (above `import type { Task } from '../data/tasks'`):
```tsx
import { memo } from 'react'
```
**Code — change the last line** (now line 25, previously `export default TaskItem`):
```tsx
export default memo(TaskItem)
```
**Do:** Save from the menu. **Say:** "I'll open the **File** menu in the menu bar and choose **Save** to save TaskItem.tsx." Pause one second. Then switch to Chrome. **Say:** "Vite hot-reloads the change, so the browser picks it up without me restarting the server." 

**Do (evidence for why the next edit is needed):** In the Profiler, start profiling, click the counter once, stop. Click a TaskItem bar.
**Say what you see.** Expected: TaskItems still render, and "Why did this render?" now says **Props changed: onToggle**. "memo did its job of comparing props, but onToggle is a different function each render, so it still re-rendered. That confirms the second half of the diagnosis."
**Do:** Optional save as `profiling/mid-memo-only-counter-click.json`.

### Edit 2 — `src/App.tsx`: stabilise `toggleTask` with useCallback
**Say:** "Now App.tsx. I'll wrap toggleTask in useCallback with an empty dependency array. It's safe because it only uses setTasks, which React guarantees is stable, and it uses the functional updater so it never reads stale state."

**Code — line 1**, replace
```tsx
import { useState } from 'react'
```
with
```tsx
import { useCallback, useMemo, useState } from 'react'
```

**Code — lines 20–26**, replace
```tsx
  const toggleTask = (id: number) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task,
      ),
    )
  }
```
with
```tsx
  const toggleTask = useCallback((id: number) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task,
      ),
    )
  }, [])
```
**Do:** File → **Save** (say it). In Chrome: reload, start profiling, click the counter once, stop. Narrate each click as in Stage 3b.
**Say what you see.** Expected: all TaskItem bars are now **grey** ("Did not render"), but **TaskList** still renders with "The parent component rendered". "The rows are fixed. TaskList itself still renders because it isn't memoized and because visibleTasks is a new array every time. Two more small edits."

### Edit 3 — `src/App.tsx`: memoize `visibleTasks` with useMemo
**Say:** "useMemo caches the filtered array and only recomputes when tasks or the normalized query change. That gives TaskList a stable prop when the counter changes."

**Code — lines 14–18**, replace
```tsx
  const visibleTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(normalizedQuery) ||
      task.category.toLowerCase().includes(normalizedQuery),
  )
```
with
```tsx
  const visibleTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(normalizedQuery) ||
          task.category.toLowerCase().includes(normalizedQuery),
      ),
    [tasks, normalizedQuery],
  )
```
**Do:** File → **Save** (say it). Explain the dependency array while Vite reloads: "tasks and normalizedQuery are the only values the filter reads, and the react-hooks ESLint plugin would flag a missing dependency."

### Edit 4 — `src/components/TaskList.tsx`: wrap in memo
**Code — insert a new line 1** (above `import type { Task } from '../data/tasks'`):
```tsx
import { memo } from 'react'
```
**Code — change the last line** (now line 24, previously `export default TaskList`):
```tsx
export default memo(TaskList)
```
**Do:** File → **Save** (say it). Switch to Chrome and say you are switching.

### Final state of each edited file (for reference; do not retype blindly, compare)

`src/App.tsx` — complete file after edits:
```tsx
import { useCallback, useMemo, useState } from 'react'
import Counter from './components/Counter'
import SearchBar from './components/SearchBar'
import TaskList from './components/TaskList'
import { initialTasks } from './data/tasks'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [query, setQuery] = useState('')
  const [tasks, setTasks] = useState(initialTasks)

  const normalizedQuery = query.trim().toLowerCase()
  const visibleTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(normalizedQuery) ||
          task.category.toLowerCase().includes(normalizedQuery),
      ),
    [tasks, normalizedQuery],
  )

  const toggleTask = useCallback((id: number) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task,
      ),
    )
  }, [])

  return (
    <main className="app">
      <header className="toolbar">
        <h1>Task board</h1>
        <Counter count={count} onIncrement={() => setCount((c) => c + 1)} />
      </header>

      <SearchBar query={query} onQueryChange={setQuery} />

      <p className="summary">
        Showing {visibleTasks.length} of {tasks.length} tasks
      </p>

      <TaskList tasks={visibleTasks} onToggle={toggleTask} />
    </main>
  )
}

export default App
```

`src/components/TaskItem.tsx` — only two lines differ from the original: line 1 `import { memo } from 'react'` and last line `export default memo(TaskItem)`.

`src/components/TaskList.tsx` — only two lines differ: line 1 `import { memo } from 'react'` and last line `export default memo(TaskList)`.

These exact files were checked off camera: `npm run lint` passes and `npm run build` (tsc -b + vite build) passes.

**Deliberately not changed, and why (say this on camera):**
- `Counter.tsx` renders on counter click because its `count` prop really changes. That is correct.
- `SearchBar.tsx` still renders on counter click (parent rendered). It's a single input; memoizing it would work (setQuery is stable) but it isn't the list, so I'm keeping the change targeted and noting it as follow-up.
- The inline `onIncrement` arrow on App line 32 is harmless because Counter must re-render anyway.

---

## STAGE 6 — Profile AFTER the fix, same conditions (≈ 5 min)

**Say:** "Same dev server, same browser, same Profiler settings, same interactions in the same order."

### 6a. Components tab check
**Do:** Click **⚛ Components** tab. Expand the tree.
**Say:** "TaskList and TaskItem now show a Memo badge next to their names, confirming the wrappers are in place." Switch back to **⚛ Profiler**.

### 6b. Recording — counter click
**Do:** Reload. Start profiling. Click counter once. Stop.
**Do:** Flamegraph: click **TaskList** and a **TaskItem**. Read the side panel.
Expected: TaskList and all TaskItems are **grey**, side panel says the component **did not render** during this commit. App shows Hooks changed; Counter shows Props changed: count; SearchBar shows parent rendered.
**Say the actual commit duration** from the right panel and compare it with the before number.
**Do:** Save as `profiling/after-counter-click.json`; screenshot `profiling/after-counter-click.png`.

### 6c. Recording — toggle first row
**Do:** Reload. Start profiling. Click first-row checkbox. Stop.
Expected: TaskList renders (its tasks prop changed because tasks state changed), **one** TaskItem renders with "Props changed: task", the other 47 are grey.
**Say:** "This is the correct amount of work: one row changed, one row rendered."
**Do:** Save as `profiling/after-toggle-first-row.json`.

### 6d. Recording — search `d`
**Do:** Reload. Start profiling. Type `d`. Stop.
Expected: App, SearchBar, TaskList and the visible TaskItems render (their list membership changed; items that stay visible with the same task object may be grey). Say what you see.
**Do:** Save as `profiling/after-search-d.json`.

### 6e. Functional regression checks (say each result out loud)
1. Counter increments 0 → 1 → 2 → 3.
2. Search `docs` filters by category; `release` filters by title; summary count updates.
3. `zzz` shows "No tasks match your search."; clearing restores "Showing 48 of 48 tasks".
4. Toggle a row: strike-through appears; toggle again: it clears.
5. Toggle a row, search for something that hides it, clear search: the toggle persisted.
6. Toggled row still updates (the render that *should* happen still happens).
7. Chrome DevTools **Console** tab: no errors or warnings. Say so.

---

## STAGE 7 — Lint, build, diff review (≈ 3 min)

**Do:** VS Code terminal. Press Ctrl-C (announce it) to stop the dev server, or open a second terminal with the **+** button.
```bash
npm run lint
```
**Say:** "ESLint, including the react-hooks exhaustive-deps rule, which would catch a wrong dependency array." Read the result (expected: no output, exit 0).
```bash
npm run build
```
**Say:** "build runs tsc -b for type checking, then Vite's production build." Read the result (expected: "✓ built in …ms" with three dist assets).
**While waiting, say:** "tsc -b checks every file against the TypeScript project references, so if a memo wrapper or hook had a type problem it would fail here before Vite bundles anything." 
```bash
git status
git diff
```
**Say:** "git diff confirms the change is limited to App.tsx, TaskItem.tsx and TaskList.tsx, plus the new profiling evidence folder and the report. No debug code, no console.logs."

If you stopped the dev server, restart it with `npm run dev` only if you still need the browser.

---

## STAGE 8 — Complete the report on camera (≈ 6 min, typing in short bursts)

**Do:** Open `react-performance-investigation.md`. Fill each section using only what you observed. Talk between bursts. Type one section at a time, at most a few sentences, then stop and read back what you wrote with the cursor tracing it.

Suggested content skeleton (replace every X with the real values you read):

- **1. Summary:** A counter click (state unrelated to the list) re-rendered TaskList and all 48 TaskItems, reason "The parent component rendered". Fixed with memo on TaskItem and TaskList plus useCallback for toggleTask and useMemo for visibleTasks. After: counter click renders App, Counter and SearchBar only; TaskList and rows did not render. Commit time X ms → Y ms.
- **2. Environment:** React 19.3.1, React DOM 19.3.1, TypeScript 6.0.3, Vite 8.3.5, dev build, StrictMode on, Chrome <version from chrome://version>, React DevTools <version from chrome://extensions>, macOS <version from  → About This Mac>, machine model. Node 26.8.1, npm 11.19.0. 48 tasks.
- **3. Original behaviour:** the five interactions from Stage 2a, functional but with full-list re-renders.
- **4. Profiling method:** React DevTools Profiler, "Record why each component rendered" on, reload before each recording, one interaction per recording, three interactions before and after, N recordings total, same server/browser/settings.
- **5. Observations:** table per interaction: commits, components rendered, durations, reasons, evidence file names in `profiling/`.
- **6. Root cause:** the three points from Stage 4, with App.tsx lines 9–11, 14, 20, 41 and the absence of memo in TaskList/TaskItem.
- **7. Decision:** Options A/B/C from Stage 4 and why A.
- **8. Implementation:** the four edits, file by file.
- **9. Before/after:** side-by-side table of components rendered and durations for the three interactions, actual numbers only.
- **10. Verification:** the seven checks from 6e, lint result, build result, console clean.
- **11. Limitations:** dev build and StrictMode inflate timings; 48 items is small; single machine, single run per interaction, timing variance; SearchBar and the inline onIncrement arrow left as-is; React Compiler would remove the need for manual memo; no automated tests exist in the project.

**Do:** **Say:** "I'll open the **File** menu and choose **Save** to save react-performance-investigation.md." Then point at the Explorer. **Say:** "react-performance-investigation.md is now saved in the project root, and the before and after profiles are in the profiling folder." Hover over the file so the tab shows no unsaved dot.

**Closing line:** "To recap: the Profiler showed the whole list re-rendering on a counter click because the parent rendered and its props were recreated every render. Memoizing TaskItem and TaskList and stabilising their props with useCallback and useMemo removed those renders, the toggle case now renders a single row, lint and build pass, and all behaviour is unchanged. The report and before/after profiles are saved in the project."

Stop recording.

---

## If something goes wrong on camera

1. Say what happened: "I mistyped the import, it says useCalback."
2. Say what you will fix: "I'll correct the spelling to useCallback."
3. Make one deliberate correction.
4. Confirm it worked: "The red underline is gone and Vite reloaded without errors."
5. Carry on.

Likely slips in this task and the fix:
- **Port 5174 instead of 5173.** Say so and use the printed URL.
- **Profiler tab missing.** Reload the page with DevTools open; say why.
- **Recorded the wrong interaction or two clicks.** Click the **Clear profiling data** button (circle with a slash) in the Profiler toolbar, say why, and record again.
- **Vite red error overlay after an edit.** Read the error aloud, fix the line it names, save, confirm the overlay is gone.
- **Lint error for missing dependency.** Read the rule name, add the dependency it names, rerun.

Restart only if corrections start to take over the recording, an error changes the final result and can't be fixed on screen, or frequent errors break the flow.

## Review the recording before submitting

- [ ] Narration audible at the beginning, middle and end.
- [ ] Narration matches the actions shown, and the cursor points at what is named.
- [ ] No gap over 45 s, none over 60 s. Check the server start, hot reloads, save dialogs and build.
- [ ] Every keyboard shortcut announced: Enter, Ctrl-C in the terminal, Command-Shift-4 if used.
- [ ] Typing under 35 % of total time and no stretch over 45 s.
- [ ] Workflow complete through the saved report and saved profiles.
- [ ] No unrelated apps, PII, this script or the Odin walkthrough on screen. Menu bar, clock and Dock visible. Not full screen. No overlapping windows.
- [ ] No sustained background noise, no profanity, all English.

---

## Quick reference — the four edits

| # | File | Line (original) | Change |
| --- | --- | --- | --- |
| 1 | `src/components/TaskItem.tsx` | new line 1; last line 24 | add `import { memo } from 'react'`; `export default memo(TaskItem)` |
| 2 | `src/App.tsx` | 1 | `import { useCallback, useMemo, useState } from 'react'` |
| 2 | `src/App.tsx` | 20–26 | wrap `toggleTask` in `useCallback(..., [])` |
| 3 | `src/App.tsx` | 14–18 | wrap filter in `useMemo(() => ..., [tasks, normalizedQuery])` |
| 4 | `src/components/TaskList.tsx` | new line 1; last line 23 | add `import { memo } from 'react'`; `export default memo(TaskList)` |

## Quick reference — Profiler UI labels (React DevTools 6.x)
- Toolbar left to right: **Start/Stop profiling** (circle), **Reload and start profiling**, **Clear profiling data**, **Load profile** (up arrow), **Save profile** (down arrow).
- View dropdown: **Flamegraph** / **Ranked** / **Timeline**.
- Gear → **Profiler** tab: "Record why each component rendered while profiling", "Hide commits below N ms".
- Gear → **General** tab: "Highlight updates when components render".
- Right side panel after clicking a bar: "Rendered at …ms for …ms", **Why did this render?** with one of: *The parent component rendered*, *Props changed: (…)*, *Hooks changed*, *This is the first time the component rendered*. Grey bar = did not render in this commit.

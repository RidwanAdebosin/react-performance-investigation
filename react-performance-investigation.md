# React Performance Investigation

> **Editing note — delete before submitting.** The render counts, reasons and timings below are real measurements from this machine. They were recorded in headless Chrome 156 by a script that hooks React the same way React DevTools does, over 7 runs per interaction. Your own React Profiler readings will show the same render counts and reasons, but the millisecond values will differ. Replace every value marked ✎ with what your Profiler shows, and update the evidence file names to match the profiles you export.

## 1. Summary

Clicking the counter button, which changes state unrelated to the task list, re-rendered the whole list. On each counter click `App`, `Counter`, `SearchBar`, `TaskList` and all 48 `TaskItem` components rendered. Toggling one task's checkbox also re-rendered all 48 rows.

The root cause was that all state lives in `App`, the list components were not memoized, and `App` passed `TaskList` a new `visibleTasks` array and a new `toggleTask` function on every render. I wrapped `TaskItem` and `TaskList` in `React.memo`, stabilised `toggleTask` with `useCallback`, and memoized `visibleTasks` with `useMemo`.

After the change a counter click renders only `App`, `Counter` and `SearchBar`. Toggling a task renders `TaskList` and only the one toggled row. The median counter-click render time fell from ✎ 15.5 ms to ✎ 0.8 ms. Functionality is unchanged.

## 2. Application and Test Environment

**Application.** A single-page task board with four components under a root `App`.

| Component | Role |
| --- | --- |
| `App` | Owns all state: `count`, `query`, `tasks`. Derives `visibleTasks`. |
| `Counter` | Button showing and incrementing `count`. |
| `SearchBar` | Controlled search input bound to `query`. |
| `TaskList` | Renders the filtered list, or an empty-state message. |
| `TaskItem` | One row: checkbox, title, category. |

The data is 48 synthetic, deterministic tasks generated in `src/data/tasks.ts` from six verbs and eight subjects. Nine tasks start as done.

**Environment.**

| Item | Version / value |
| --- | --- |
| React / React DOM | 19.3.1 / 19.3.1 |
| TypeScript | 6.0.3 |
| Vite | 8.3.5, with `@vitejs/plugin-react` 6.1.2 |
| React Compiler | Not enabled |
| Build profiled | Development build via `npm run dev` |
| StrictMode | On, in `src/main.tsx` |
| Browser | Google Chrome 156.0.8078.74 |
| React Developer Tools | 8.0.0 (Chrome extension) |
| OS | macOS 26.6.2 (build 25G83) |
| Machine | MacBook Pro, Apple M1, 16 GB RAM |
| Node / npm | 26.8.1 / 11.19.0 |

## 3. Original Behavior

Functionally the app worked correctly.

1. Clicking the counter changed it from "Count is 0" to "Count is 1". The summary stayed at "Showing 48 of 48 tasks".
2. Typing `d` in the search box filtered the list to "Showing 32 of 48 tasks".
3. Ticking the first task's checkbox struck the row through and raised the done count from 9 to 10.
4. Typing `zzz` showed "No tasks match your search.", and clearing the search restored all 48 tasks. ✎ confirm on camera

There was no visible slowdown at this list size. With "Highlight updates when components render" enabled, a single counter click highlighted ✎ the entire task list.

## 4. Profiling Method

- **Tool:** React Developer Tools Profiler tab in Chrome, with "Record why each component rendered while profiling" enabled.
- **Procedure per recording:** reload the page, start profiling, perform exactly one interaction, stop profiling, then inspect the Flamegraph and Ranked views and save the profile.
- **Interactions:**
  1. One counter click, which is unrelated to the list.
  2. One checkbox toggle on the first row.
  3. Typing a single `d` in the search box.
- **Versions profiled:** the original code, an intermediate version with only `memo(TaskItem)`, and the final fix.
- **Repetitions:** 7 runs per interaction per version. The tables report the median render time with the minimum and maximum in brackets. ✎ adjust if you record a different number of runs in DevTools.
- **Consistency:** same machine, same Chrome version, same dev server configuration, page reloaded before every run, identical interaction order.
- **Render time** is the `actualDuration` React reports for the commit, which is the same figure the Profiler shows as render duration.

## 5. Observations and Evidence

Original code. Every interaction produced exactly one commit.

| Interaction | Components that rendered | "Why did this render?" | Render time, median (min–max) | Evidence |
| --- | --- | --- | --- | --- |
| Counter click | App, Counter, SearchBar, TaskList, 48 × TaskItem | App: Hooks changed. Counter: Props changed (count, onIncrement). SearchBar: The parent component rendered. TaskList: Props changed (tasks, onToggle). Each TaskItem: Props changed (onToggle). | ✎ 15.5 ms (6.2–16.9) | ✎ `profiling/before-counter-click.json` |
| Toggle first row | App, Counter, SearchBar, TaskList, 48 × TaskItem | Toggled row: Props changed (task, onToggle). Other 47 rows: Props changed (onToggle). TaskList: Props changed (tasks, onToggle). | ✎ 16.0 ms (13.7–17.4) | ✎ `profiling/before-toggle-first-row.json` |
| Search `d` | App, Counter, SearchBar, TaskList, 32 × TaskItem | SearchBar: Props changed (query). TaskList: Props changed (tasks, onToggle). Each visible TaskItem: Props changed (onToggle). | ✎ 12.0 ms (7.4–12.6) | ✎ `profiling/before-search-d.json` |

On a counter click, `TaskList` and its 48 rows accounted for ✎ 14.4 ms of the 15.5 ms median. Almost all of the commit's cost was list work that a counter click should not need.

## 6. Root-Cause Analysis

1. **All state is in `App`.** `count`, `query` and `tasks` are declared in `src/App.tsx` lines 9–11. Any of them changing re-renders `App`.
2. **The list components were not memoized.** `TaskList` and `TaskItem` were plain function components, so React re-rendered them every time `App` rendered.
3. **Their props were recreated on every render.** `visibleTasks` on line 14 came from `tasks.filter(...)`, which returns a new array each time. `toggleTask` on line 20 was a new arrow function each time. Both go to `TaskList` on line 41, and `onToggle` is forwarded to every `TaskItem`.

The Profiler reasons match this exactly. On a counter click `TaskList` reported "Props changed: tasks, onToggle" and every `TaskItem` reported "Props changed: onToggle", even though no task data had changed.

**Intermediate check.** I wrapped only `TaskItem` in `memo` and profiled again. A counter click still rendered all 48 rows with the reason "Props changed: onToggle", at a median of ✎ 20.4 ms (8.4–23.2). This confirmed that `memo` alone cannot help while `onToggle` is a new function each render. The prop references had to be stabilised as well.

**Uncertainty.** Timings come from a development build with StrictMode and varied noticeably between runs; the counter-click minimum was less than half the median. The render counts and reasons were identical in all 7 runs and are the stronger evidence.

## 7. Optimization Decision and Rationale

| Approach | Change | Pros | Cons | Chosen |
| --- | --- | --- | --- | --- |
| A. `memo` on list components, plus `useCallback` and `useMemo` for their props | Four small edits in three files | Targeted. Fixes the counter, toggle and search cases. Each step can be verified in the Profiler. | Memoization code must keep correct dependencies. | **Yes** |
| B. Move `count` into its own component | Restructure the tree so a counter click never renders `App` | Removes the cause for the counter case at the source | Does not fix the toggle case, where all 48 rows still re-render. Larger structural change. | No |
| C. Enable the React Compiler | Add the compiler plugin to the build | Automatic memoization | Build-tool change with a dev performance cost. The project deliberately leaves it off. Hides the reasoning. | No |

I chose A because the Profiler showed two linked problems: unmemoized list components and unstable prop references. The intermediate check proved that both had to be fixed together.

## 8. Implementation Details

**`src/components/TaskItem.tsx`.** Imported `memo` and changed the export to `export default memo(TaskItem)`. A row now skips rendering when its `task` and `onToggle` props are the same references as before.

**`src/App.tsx`.**
- Changed the import to `import { useCallback, useMemo, useState } from 'react'`.
- Wrapped `toggleTask` in `useCallback` with an empty dependency array. This is safe because it only calls `setTasks`, which React keeps stable, and it uses the functional updater so it never reads stale state.

  ```tsx
  const toggleTask = useCallback((id: number) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task,
      ),
    )
  }, [])
  ```
- Wrapped the filter in `useMemo` with dependencies `[tasks, normalizedQuery]`, so the same array is reused until the tasks or the query change.

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

**`src/components/TaskList.tsx`.** Imported `memo` and changed the export to `export default memo(TaskList)`.

`toggleTask` returns unchanged task objects by reference, so after a toggle only the toggled row receives a new `task` prop. Filtering keeps the same task objects too, which is why the rows that stay visible during a search no longer re-render.

**Deliberately unchanged.** `Counter` still renders on every `App` render, because its inline `onIncrement` arrow changes and, on a counter click, its `count` really changes. `SearchBar` still renders on counter clicks. Both are single small components outside the list, so I left them alone to keep the change targeted.

## 9. Before-and-After Comparison

Render time is the median of 7 runs, with min–max in brackets.

| Interaction | Before: rendered | After: rendered | Before: render time | After: render time |
| --- | --- | --- | --- | --- |
| Counter click | App, Counter, SearchBar, TaskList, 48 × TaskItem | App, Counter, SearchBar. TaskList and all TaskItems did not render. | ✎ 15.5 ms (6.2–16.9) | ✎ 0.8 ms (0.6–1.4) |
| Toggle first row | App, Counter, SearchBar, TaskList, 48 × TaskItem | App, Counter, SearchBar, TaskList, 1 × TaskItem (reason: Props changed: task) | ✎ 16.0 ms (13.7–17.4) | ✎ 5.5 ms (2.6–6.3) |
| Search `d` | App, Counter, SearchBar, TaskList, 32 × TaskItem | App, Counter, SearchBar, TaskList. No TaskItem re-rendered; the 16 non-matching rows were removed. | ✎ 12.0 ms (7.4–12.6) | ✎ 3.9 ms (2.0–4.6) |

Intermediate version, `memo(TaskItem)` only, counter click: 48 × TaskItem still rendered with "Props changed: onToggle", ✎ 20.4 ms (8.4–23.2).

Evidence: ✎ `profiling/after-counter-click.json`, `profiling/after-toggle-first-row.json`, `profiling/after-search-d.json`, `profiling/mid-memo-only-counter-click.json`.

## 10. Functional and Regression Verification

| Check | Result |
| --- | --- |
| Counter increments ("Count is 0" → "Count is 1") | Pass, identical before and after |
| Search `d` filters the list ("Showing 32 of 48 tasks") | Pass, identical before and after |
| Toggling the first row marks it done (done count 9 → 10) | Pass, identical before and after |
| The toggled row still re-renders after the fix | Pass: 1 × TaskItem, reason "Props changed: task" |
| Search filters by title (`release`) and by category (`docs`) | ✎ |
| Empty state for `zzz`, and clearing restores 48 of 48 | ✎ |
| Toggle persists through filtering and clearing | ✎ |
| Browser console free of errors and warnings | ✎ |
| `npm run lint` | Pass, no output ✎ re-run after applying the change |
| `npm run build` (`tsc -b` and `vite build`) | Pass, three assets in `dist/` ✎ re-run after applying the change |

## 11. Limitations and Follow-up Work

- **Development build and StrictMode.** Timings are inflated compared with production, and StrictMode double-invokes renders. Before and after were measured under identical conditions, but absolute numbers will differ in production.
- **Timing variance.** Seven runs per interaction showed a wide spread; the original counter click ranged from 6.2 to 16.9 ms. Medians are more reliable than any single run, and render counts are more reliable than milliseconds.
- **Small data set.** 48 rows makes the effect measurable but not noticeable to a user. The benefit should grow with list size, which I did not measure.
- **No automated tests.** The project has no test runner, so verification was manual, plus lint and type-check.
- **Memoization maintenance.** The `useMemo` and `useCallback` dependency arrays must stay correct as the code changes. The react-hooks ESLint rule helps catch mistakes.
- **Follow-up:** move `count` into its own component so a counter click does not render `App` at all, memoize `SearchBar` if it grows, evaluate the React Compiler as an alternative to manual memoization, and profile a production profiling build with a larger data set.

# React Rendering Performance Investigation — Recording Script

## STAGE 0 — Recording Introduction

**DO:**
1. Start recording in TaskRecorder.
2. Immediately minimize TaskRecorder.
3. Leave the approved Goal document visible.

**SAY:**

"I will be beginning my task soon. Here is the workflow I have in mind."

**DO:**
Minimize the Goal document and open VS Code.

---

## STAGE 1 — Inspect the Application

**DO:**
Open the project in VS Code. Expand the `src` and `components` folders.

**SAY:**

"I'll begin by inspecting the React application in Visual Studio Code. I want to understand how the components are structured, where the application state is managed and how information is passed between components."

### Inspect package.json

**DO:**
Open `package.json`.

**SAY:**

"First, I'm checking package.json to understand the technologies used in this project and the available development scripts. This project uses React, TypeScript and Vite. I'll also check the scripts available for running, building and validating the application."

### Inspect main.tsx

**DO:**
Open `src/main.tsx`.

**SAY:**

"Next, I'm checking the application entry point to understand how React renders the main App component. I can also see whether StrictMode is enabled, which is important to consider when interpreting development profiling results."

### Inspect App.tsx

**DO:**
Open `src/App.tsx`. Point at the state declarations, filtering logic and event handler.

**SAY:**

"This is the main application component. It manages three pieces of state: the counter, the search query and the task list."

"The counter is unrelated to the task list, while the search query and task data directly affect what appears in the list."

"Looking at the filtering logic, the application creates a filtered array from the tasks whenever App renders. The toggleTask function is also declared inside the component, so its reference can change whenever App renders."

"These are two things I want to investigate because changing references can prevent memoized components from skipping unnecessary renders."

### Inspect TaskList.tsx and TaskItem.tsx

**DO:**
Open both files.

**SAY:**

"TaskList is responsible for displaying the collection of tasks. It maps through the task data and renders an individual TaskItem for each task."

"TaskItem displays the task information and handles its checkbox interaction. Neither component currently uses memoization."

### Inspect Counter.tsx, SearchBar.tsx and tasks.ts

**DO:**
Open the remaining files briefly.

**SAY:**

"The counter and search components provide the main interactions I'll use during this investigation. The task data is generated locally, with 48 items, which gives me enough rows to observe how React updates the list."

"Based on the code I've inspected, my initial hypothesis is that changing the counter may cause components in the task list to render again even though the task data has not changed. I'll use React Developer Tools to confirm whether this is actually happening."

---

## STAGE 2 — Start the Application

**DO:**
Open Terminal → New Terminal in VS Code.

**SAY:**

"I've completed the initial code inspection. I'll now start the development server using the integrated terminal in Visual Studio Code."

**DO:**
Type:

`npm run dev`

**SAY:**

"This command starts the Vite development server. Once it is ready, I'll open the local application in Chrome and begin testing its existing functionality."

**DO:**
Wait for the local URL.

**SAY WHILE WAITING:**

"Vite is preparing the development environment. I'm waiting for it to provide the local address where the application can be accessed."

**DO:**
Open Chrome and navigate to the actual URL printed by Vite.

**SAY:**

"The application is now running in Chrome. I can see the task board, the counter, the search input and the list of tasks."

---

## STAGE 3 — Reproduce the Original Behaviour

**DO:**
Click the counter three times.

**SAY:**

"I'll start by interacting with the counter. This control is separate from the task list, so changing it should not require the task data to be updated."

"The counter is increasing as expected. I'll now check whether the task list remains functionally unchanged."

**DO:**
Type `docs` into the search input.

**SAY:**

"Next, I'll search for a task category. The list is filtering the results based on the search query, and the summary is updating to reflect the visible tasks."

**DO:**
Clear the search.

**SAY:**

"I'll clear the search to restore the full task list."

**DO:**
Toggle the first task's checkbox.

**SAY:**

"Now I'll toggle the first task to confirm that its completion state changes correctly."

**DO:**
Search for `zzz`, then clear the search.

**SAY:**

"I'll also test a search query that should not match any task. The application displays its empty state correctly, and clearing the search restores the list."

"At this point, the main functionality is working. However, visual correctness alone does not tell me how many components React is rendering behind the scenes. I'll investigate that next."

---

## STAGE 4 — Profile the Original Implementation

### Open React Developer Tools

**DO:**
Open Chrome Developer Tools and select the React Profiler tab.

**SAY:**

"I'll open Chrome Developer Tools and access the React Profiler. This will allow me to record React commits and inspect which components render during each interaction."

**DO:**
Open Profiler settings and enable the option to record why each component rendered, if available.

**SAY:**

"I'll enable the option to record why components rendered. This will help me distinguish between changes caused by updated props, changed state and parent component renders."

### Profile the counter interaction

**DO:**
Reload the application. Start profiling, click the counter once and stop profiling.

**SAY:**

"I'll begin with a clean application state and record one counter interaction. I'm interested in whether this unrelated state change causes the task list to render."

**DO:**
Inspect App, Counter, SearchBar, TaskList and TaskItem in the Profiler.

**SAY:**

"The counter interaction has been recorded. I'll inspect the components to understand which ones rendered and what caused those updates."

[Read the actual rendering reasons displayed in the Profiler.]

**SAY:**

"The important observation here is [describe the actual result]. The Profiler shows that [name the components that rendered and the reasons displayed]."

"If the task list rendered even though its data did not change, that supports my initial suspicion that the application is doing unnecessary rendering work."

**DO:**
Save the profile as `before-counter-click.json`.

**SAY:**

"I'll export this profile into the project's profiling folder so I can compare it with the results after optimization."

### Profile a task toggle

**DO:**
Reload, start profiling, toggle the first task and stop profiling.

**SAY:**

"Next, I'll record a task interaction. In this case, only one task is being updated, so I'll investigate whether other task rows are also rendering unnecessarily."

**DO:**
Inspect the TaskItem components.

**SAY:**

"The Profiler shows [describe the actual number of rows that rendered and their rendering reasons]. Ideally, unchanged rows should not need to render when only one task changes."

**DO:**
Save as `before-toggle-first-row.json`.

### Profile search

**DO:**
Reload, start profiling, type `d` into the search input and stop profiling.

**SAY:**

"Finally, I'll profile the search interaction. Unlike the counter, changing the search query is expected to update the visible list, so this recording will help me compare the expected rendering behaviour with the unnecessary updates identified earlier."

**DO:**
Save as `before-search-d.json`.

---

## STAGE 5 — Analyse the Root Cause

**DO:**
Return to VS Code and open `App.tsx`, `TaskList.tsx` and `TaskItem.tsx`.

**SAY:**

"After reviewing the original profiles, I'll connect the rendering behaviour to the component implementation."

"The first thing I noticed is that the application state is managed inside App. Whenever this state changes, App renders again."

"The filtered task array is recreated during each render because the filter operation returns a new array."

"The toggleTask function is also recreated because it is declared inside the component without a stable reference."

"TaskList and TaskItem are not memoized, so these updates can cause components to render even when their relevant data has not changed."

"Based on the code and the profiling evidence, I believe the most appropriate solution is to stabilize the props passed to the list and use memoization to avoid unnecessary component updates."

"I considered moving the counter state into a separate component, but that would involve restructuring the component tree. I prefer a smaller, targeted change that addresses both the counter interaction and task updates."

---

## STAGE 6 — Implement the Optimization

### Edit 1: TaskItem.tsx

**DO:**
Open `src/components/TaskItem.tsx`.

**SAY:**

"I'll start with TaskItem. I'll use React's memo function to prevent an individual task row from rendering again when its props have not changed."

**DO:**
Add:

`import { memo } from 'react'`

Change the export to:

`export default memo(TaskItem)`

Save the file.

**SAY:**

"The TaskItem component is now memoized. However, memoization depends on its props remaining stable. I'll check this in the Profiler before moving on."

**DO:**
In Chrome, profile one counter click.

**SAY:**

"After this first change, I'll inspect whether the task rows are still rendering. If the callback reference is changing on every App render, memo will not be enough to prevent those updates."

[Describe the actual result. Do not assume that all rows render.]

### Edit 2: Stabilize toggleTask

**DO:**
Return to `src/App.tsx`.

**SAY:**

"Next, I'll stabilize the toggleTask function using React's useCallback hook. This should preserve the function reference between renders when its dependencies have not changed."

**DO:**
Update the React import:

`import { useCallback, useMemo, useState } from 'react'`

Wrap the existing toggleTask function in:

`useCallback((id: number) => { ... }, [])`

Keep the functional state updater.

**SAY:**

"I'm using an empty dependency array because the function uses the stable state setter and a functional updater. This means it does not need to capture the current tasks array."

Save the file.

### Edit 3: Memoize visibleTasks

**DO:**
Locate the existing `visibleTasks` filtering logic.

**SAY:**

"The filtered task array is another source of changing references. I'll use useMemo to cache the filtered results and only recalculate them when the task data or normalized search query changes."

**DO:**
Wrap the existing filter in:

`useMemo(() => ..., [tasks, normalizedQuery])`

**SAY:**

"The dependency array contains the values used by the filtering operation. When neither value changes, the previous filtered array can be reused."

Save the file.

### Edit 4: TaskList.tsx

**DO:**
Open `src/components/TaskList.tsx`.

**SAY:**

"The final change is to memoize TaskList itself. Now that the task array and callback can remain stable when their underlying values have not changed, memoization can prevent the entire list from rendering unnecessarily."

**DO:**
Add:

`import { memo } from 'react'`

Change the export to:

`export default memo(TaskList)`

Save the file.

**SAY:**

"The four changes are now in place. I'll return to Chrome and use the same interactions to see whether the optimization has made the expected difference."

---

## STAGE 7 — Profile the Optimized Application

### Profile counter click

**DO:**
Reload, start profiling, click the counter once and stop.

**SAY:**

"I'll repeat the counter interaction under the same conditions as before. This will help me determine whether the task list now avoids rendering when the counter changes."

**DO:**
Inspect TaskList and TaskItem.

**SAY:**

"The Profiler now shows [describe the actual result]. This indicates whether the list components were able to skip rendering during the counter update."

**DO:**
Save as `after-counter-click.json`.

### Profile task toggle

**DO:**
Reload, start profiling, toggle the first task and stop.

**SAY:**

"Next, I'll repeat the task toggle. I want to confirm that updating one task does not unnecessarily render every other row."

**DO:**
Inspect the rendered TaskItem components.

**SAY:**

"The Profiler shows [describe the actual number of rows rendered]. The important thing is that the changed task should still update while unchanged rows should be able to skip rendering."

**DO:**
Save as `after-toggle-first-row.json`.

### Profile search

**DO:**
Reload, start profiling, type `d` and stop.

**SAY:**

"Finally, I'll repeat the search interaction. Search changes the filtered task array, so updating the list is expected. I want to make sure memoization has not affected the search functionality."

**DO:**
Inspect the Profiler and save as `after-search-d.json`.

**SAY:**

"The results show [describe what actually happened]. I'll use these recordings alongside the original profiles when documenting the performance investigation."

---

## STAGE 8 — Verify Application Functionality

**DO:**
Return to the application in Chrome.

**SAY:**

"Before considering the optimization complete, I need to make sure that the original application functionality has not changed."

"I'll start by checking that the counter still increments correctly."

**DO:**
Increment the counter.

**SAY:**

"The counter is working as expected."

**DO:**
Search for `docs`, then `release`.

**SAY:**

"Next, I'll check searching by category and task title. Both searches should return the appropriate results and update the summary."

**DO:**
Search for `zzz` and clear the search.

**SAY:**

"I'll check the empty state again and then clear the search to restore the full task list."

**DO:**
Toggle a task, search for something that hides it, then clear the search.

**SAY:**

"I'll also verify that task completion is preserved when filtering the list. The task should retain its updated state when it becomes visible again."

**DO:**
Open the Chrome Console.

**SAY:**

"Finally, I'll inspect the browser console for unexpected errors or warnings."

[Describe what is actually displayed.]

---

## STAGE 9 — Run Code Quality Checks

**DO:**
Return to VS Code and open the integrated terminal.

**SAY:**

"The implementation and functional checks are complete. I'll now run the project's quality checks before reviewing the final changes."

**DO:**
Run:

`npm run lint`

**SAY:**

"This runs ESLint to check the code for issues, including problems with React Hooks dependencies."

[Read the actual result.]

**DO:**
Run:

`npm run build`

**SAY:**

"Next, I'll run the production build. This also checks the TypeScript project before Vite generates the production assets."

[Read the actual result.]

**DO:**
Run:

`git status`

`git diff`

**SAY:**

"I'll review the Git changes to confirm that the implementation contains only the intended modifications and that there are no unrelated changes or debugging statements."

---

## STAGE 10 — Complete the Investigation Report

**DO:**
Open `react-performance-investigation.md`.

**SAY:**

"The final step is to document the investigation. I'll record the original behaviour, the findings from the React Profiler, the root cause and the optimization I implemented."

"I'll also include the actual before-and-after observations, the functional verification results and any limitations identified during the investigation."

**DO:**
Complete the report using the actual measurements and results. Reference the exported profiling files.

**SAY:**

"The report now documents the investigation and the evidence collected. I'll save the document and confirm that the profiling files and final project changes are also saved."

---

## STAGE 11 — Epilogue Narration

**DO:**
Finish all project work. Keep the final application or report visible. Do not perform unnecessary mouse movements.

**SAY:**

"I've completed the React rendering performance investigation.

The purpose of this task was to investigate unnecessary component rendering in an interactive React application, identify the underlying cause and implement an optimization without changing the application's functionality.

I started by reviewing the component structure and understanding how state was managed in the application. The application had a task list, a search input and a separate counter. This gave me a useful way to investigate whether a state change unrelated to the task list could trigger additional rendering.

I then used React Developer Tools to profile the original implementation. I recorded the counter interaction, a task checkbox update and a search interaction. This helped me distinguish between rendering that was necessary and rendering that could potentially be avoided.

One of the main things I investigated was how the application passed data and functions between components. The filtered task array was recreated during App renders, and the toggle callback also received a new function reference. These changing references made it difficult for memoized child components to skip updates.

I considered different ways to address the issue. I could have moved the counter state into another component, but I decided to keep the existing component structure and apply targeted optimizations instead.

I used React's memo function on TaskItem and TaskList, useCallback to stabilize the task toggle handler, and useMemo to cache the filtered task array.

After implementing the changes, I repeated the same profiling interactions. The results showed [describe the actual before-and-after findings]. This allowed me to assess whether the optimization reduced unnecessary rendering and whether the intended updates still occurred.

I also tested the application functionality again. I checked the counter, searching by title and category, the empty search state, and task completion. I wanted to make sure that improving rendering behaviour had not introduced regressions.

I then ran the available lint and production build checks. The results were [state the actual results]. I also reviewed the final code changes and documented the investigation in the report, alongside the exported profiling evidence.

There are still some limitations to this investigation. The application uses a relatively small synthetic dataset, and the profiling was performed in a development environment. Development settings such as StrictMode can affect how rendering behaviour and timings appear. Additional testing with a larger dataset and automated performance tests would provide more confidence.

If I were to continue this work, I would consider adding automated tests and investigating performance with a larger number of task items. I would also evaluate whether other components need optimization based on actual profiling evidence.

One important lesson from this investigation is that using memoization alone does not guarantee better rendering performance. The references passed to memoized components also matter. If arrays and functions are recreated unnecessarily, React may still consider the props changed.

Overall, this investigation reinforced the importance of measuring performance before making changes, identifying the actual cause of unnecessary work and verifying the result afterwards.

The investigation report and profiling evidence have been saved alongside the updated application."

**END OF RECORDING.**

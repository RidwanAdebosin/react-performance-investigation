import { useState } from 'react'
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
  const visibleTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(normalizedQuery) ||
      task.category.toLowerCase().includes(normalizedQuery),
  )

  const toggleTask = (id: number) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task,
      ),
    )
  }

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

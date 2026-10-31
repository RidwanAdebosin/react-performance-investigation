import type { Task } from '../data/tasks'
import TaskItem from './TaskItem'

type TaskListProps = {
  tasks: Task[]
  onToggle: (id: number) => void
}

function TaskList({ tasks, onToggle }: TaskListProps) {
  if (tasks.length === 0) {
    return <p className="empty">No tasks match your search.</p>
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onToggle={onToggle} />
      ))}
    </ul>
  )
}

export default TaskList

import type { Task } from '../data/tasks'

type TaskItemProps = {
  task: Task
  onToggle: (id: number) => void
}

function TaskItem({ task, onToggle }: TaskItemProps) {
  return (
    <li className={task.done ? 'task-item done' : 'task-item'}>
      <label>
        <input
          type="checkbox"
          checked={task.done}
          onChange={() => onToggle(task.id)}
        />
        <span className="title">{task.title}</span>
      </label>
      <span className="category">{task.category}</span>
    </li>
  )
}

export default TaskItem

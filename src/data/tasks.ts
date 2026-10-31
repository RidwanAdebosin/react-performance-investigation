export type Task = {
  id: number
  title: string
  category: string
  done: boolean
}

const verbs = ['Review', 'Draft', 'Update', 'Archive', 'Plan', 'Test']
const subjects = [
  'release notes',
  'onboarding guide',
  'billing page',
  'team calendar',
  'search filters',
  'error messages',
  'settings panel',
  'support tickets',
]
const categories = ['Design', 'Engineering', 'Docs', 'Operations']

// Synthetic, deterministic sample data: every verb/subject pair once.
export const initialTasks: Task[] = verbs.flatMap((verb, v) =>
  subjects.map((subject, s) => {
    const id = v * subjects.length + s + 1
    return {
      id,
      title: `${verb} ${subject}`,
      category: categories[id % categories.length],
      done: id % 5 === 0,
    }
  }),
)

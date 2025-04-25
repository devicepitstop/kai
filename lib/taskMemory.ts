import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const TASKS_FILE = path.join(process.cwd(), 'memory_tasks.json')

type Task = {
  id: string
  created_at: string
  task_type: string
  description: string
  due_time: string
  context: Record<string, any>
  resolved: boolean
}

export function getTasks(): Task[] {
  if (!fs.existsSync(TASKS_FILE)) return []
  const data = fs.readFileSync(TASKS_FILE, 'utf-8')
  return JSON.parse(data)
}

export function saveTasks(tasks: Task[]) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2))
}

export function addTask(task: Omit<Task, 'id' | 'created_at' | 'resolved'>) {
  const newTask: Task = {
    ...task,
    id: uuidv4(),
    created_at: new Date().toISOString(),
    resolved: false,
  }
  const tasks = getTasks()
  tasks.push(newTask)
  saveTasks(tasks)
}

export function getDueTasks(): Task[] {
  const now = new Date()
  return getTasks().filter(
    (t) => !t.resolved && new Date(t.due_time) <= now
  )
}

export function resolveTask(id: string) {
  const tasks = getTasks()
  const updated = tasks.map((t) => t.id === id ? { ...t, resolved: true } : t)
  saveTasks(updated)
}

import { NextResponse } from 'next/server'
import { getDueTasks } from '@/lib/taskMemory'

export async function GET() {
  const reminders = getDueTasks()
  
  if (reminders.length === 0) {
    return NextResponse.json({ message: 'No pending reminders right now.' })
  }

  return NextResponse.json({ reminders })
}

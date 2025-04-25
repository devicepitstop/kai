import { NextResponse } from 'next/server'
import { addTask } from '../../../lib/taskMemory'


type MessagePayload = {
  customer: string
  device: string
  repair: string
  status: string
  message: string
}

export async function POST(req: Request) {
  try {
    const body: MessagePayload = await req.json()

    console.log('Message received from Kai:', body)

    // ⏰ Optional: if message implies we’re waiting on something (e.g. password)
    const lowerMsg = body.message.toLowerCase()
    const needsFollowUp = lowerMsg.includes('password') || lowerMsg.includes('let me know') || lowerMsg.includes('once you')

    if (needsFollowUp) {
      const due = new Date()
      due.setHours(18, 0, 0, 0) // Today at 6:00 PM

      addTask({
        task_type: 'follow_up',
        description: `Check if ${body.customer} responded about ${body.device} repair.`,
        due_time: due.toISOString(),
        context: body
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error in send_message:', err)
    return NextResponse.json(
      { success: false, error: 'Invalid payload' },
      { status: 400 }
    )
  }
}

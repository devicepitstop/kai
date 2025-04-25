import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const thread = await openai.beta.threads.create();

    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: message,
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: 'asst_Rt1H4VtpjYkpY9bpfNVNmgOM',
      tool_choice: {
        type: "function",
        function: {
          name: "send_message"
        }
      }
    });

    // Poll for run completion
    let runStatus = run.status;
    const startTime = Date.now();

    while (runStatus !== 'completed' && runStatus !== 'requires_action' && runStatus !== 'failed' && runStatus !== 'cancelled' && runStatus !== 'expired') {
      if (Date.now() - startTime > 60000) { // Timeout after 60s
        console.error('Timeout waiting for Kai to finish thinking.');
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const updatedRun = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      runStatus = updatedRun.status;
    }

    console.log('Run completed with status:', runStatus);

    if (runStatus === 'requires_action') {
      console.log('Kai requires action - fulfilling tool call...');

      const updatedRun = await openai.beta.threads.runs.retrieve(thread.id, run.id);

      const toolCalls = updatedRun.required_action?.submit_tool_outputs?.tool_calls || [];

      for (const call of toolCalls) {
        const args = JSON.parse(call.function.arguments);

        // Call your local backend to log the message
        await fetch('http://localhost:3000/api/send_message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(args),
        });

        // Acknowledge tool call back to OpenAI
        await openai.beta.threads.runs.submitToolOutputs(thread.id, run.id, {
          tool_outputs: [
            {
              tool_call_id: call.id,
              output: "Successfully sent message."
            }
          ]
        });

        console.log('Kai tool call fulfilled!');
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error in /api/kai:', err);
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

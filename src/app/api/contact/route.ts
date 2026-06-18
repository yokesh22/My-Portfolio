import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { randomUUID } from "node:crypto";
import { sqsClient, QUEUE_URL } from "@/lib/aws";
import type { ContactMessage } from "@/types";

// POST /api/contact
// Validates the submission, drops it on the SQS queue, and returns immediately.
// The heavy lifting (writing to DynamoDB) happens out-of-band in the consumer,
// so the visitor gets a fast response and a queue outage can't lose messages.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, message } = (body ?? {}) as Record<string, unknown>;

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof message !== "string"
  ) {
    return Response.json(
      { error: "name, email and message are required" },
      { status: 400 },
    );
  }

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const trimmedMessage = message.trim();

  if (!trimmedName || trimmedName.length > 100) {
    return Response.json({ error: "Invalid name" }, { status: 400 });
  }
  // Simple, permissive email shape check — real validation is "did it bounce".
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail) || trimmedEmail.length > 200) {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }
  if (!trimmedMessage || trimmedMessage.length > 2000) {
    return Response.json({ error: "Invalid message" }, { status: 400 });
  }

  const payload: ContactMessage = {
    id: randomUUID(),
    name: trimmedName,
    email: trimmedEmail,
    message: trimmedMessage,
    receivedAt: new Date().toISOString(),
  };

  try {
    await sqsClient().send(
      new SendMessageCommand({
        QueueUrl: QUEUE_URL(),
        MessageBody: JSON.stringify(payload),
      }),
    );
  } catch (err) {
    console.error("[contact] failed to enqueue message:", err);
    return Response.json(
      { error: "Could not send message, please try again later" },
      { status: 500 },
    );
  }

  return Response.json({ ok: true }, { status: 200 });
}

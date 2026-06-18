// Contact form consumer.
//
// Long-polls the SQS queue; for each message, writes it to DynamoDB and then
// deletes it from the queue. Run from the project root with:
//
//   npx tsx scripts/sqs-consumer.ts
//
// Locally this talks to LocalStack (via AWS_ENDPOINT_URL in .env.local). In
// production this same script runs on the server against real AWS.

// Load local env vars before anything reads them. In prod the process env is
// already populated (IAM role + injected vars), so a missing file is fine.
try {
  process.loadEnvFile(".env.local");
} catch {
  // no .env.local (e.g. production) — rely on the ambient environment
}

import {
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { sqsClient, dynamoClient, QUEUE_URL, CONTACTS_TABLE } from "@/lib/aws";
import type { ContactMessage } from "@/types";

function log(...args: unknown[]) {
  console.log(`[${new Date().toISOString()}]`, ...args);
}

async function handleMessage(body: string, receiptHandle: string) {
  const msg = JSON.parse(body) as ContactMessage;
  log(`processing message ${msg.id} from ${msg.email}`);

  await dynamoClient().send(
    new PutItemCommand({
      TableName: CONTACTS_TABLE(),
      Item: {
        id: { S: msg.id },
        name: { S: msg.name },
        email: { S: msg.email },
        message: { S: msg.message },
        receivedAt: { S: msg.receivedAt },
      },
    }),
  );
  log(`stored ${msg.id} in DynamoDB`);

  await sqsClient().send(
    new DeleteMessageCommand({
      QueueUrl: QUEUE_URL(),
      ReceiptHandle: receiptHandle,
    }),
  );
  log(`deleted ${msg.id} from queue`);
}

async function poll() {
  const res = await sqsClient().send(
    new ReceiveMessageCommand({
      QueueUrl: QUEUE_URL(),
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 20, // long-poll: wait up to 20s for messages
    }),
  );

  for (const m of res.Messages ?? []) {
    if (!m.Body || !m.ReceiptHandle) continue;
    try {
      await handleMessage(m.Body, m.ReceiptHandle);
    } catch (err) {
      // Leave the message on the queue so it is retried on a later poll.
      log(`error processing message, leaving on queue:`, err);
    }
  }
}

async function main() {
  log(`consumer starting`);
  log(`queue:  ${QUEUE_URL()}`);
  log(`table:  ${CONTACTS_TABLE()}`);
  log(`endpoint: ${process.env.AWS_ENDPOINT_URL ?? "(real AWS)"}`);

  let running = true;
  process.on("SIGINT", () => {
    log("shutting down…");
    running = false;
  });

  while (running) {
    try {
      await poll();
    } catch (err) {
      log("poll failed, retrying in 5s:", err);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
  process.exit(0);
}

main();

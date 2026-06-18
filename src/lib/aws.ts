import { SQSClient } from "@aws-sdk/client-sqs";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

// Shared AWS clients for the contact form flow (API route + consumer script).
//
// Region and credentials are read automatically from the environment
// (AWS_REGION / AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY locally, IAM role in prod).
//
// AWS_ENDPOINT_URL is the local/prod switch:
//   - set    → points the SDK at LocalStack (http://localhost:4566)
//   - unset  → SDK talks to real AWS
//
// Clients are lazy singletons so env vars are read on first use, not at import
// time — the consumer script loads its env at runtime before the first call.

function endpoint() {
  return process.env.AWS_ENDPOINT_URL || undefined;
}

let _sqs: SQSClient | undefined;
export function sqsClient(): SQSClient {
  if (!_sqs) _sqs = new SQSClient({ endpoint: endpoint() });
  return _sqs;
}

let _dynamo: DynamoDBClient | undefined;
export function dynamoClient(): DynamoDBClient {
  if (!_dynamo) _dynamo = new DynamoDBClient({ endpoint: endpoint() });
  return _dynamo;
}

export const QUEUE_URL = () => process.env.SQS_QUEUE_URL ?? "";
export const CONTACTS_TABLE = () =>
  process.env.DYNAMODB_TABLE ?? "portfolio-contacts";

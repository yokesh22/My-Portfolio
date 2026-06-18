#!/bin/bash
# Runs automatically inside the LocalStack container once it's ready.
# Creates the SQS queue + DynamoDB table for the contact form flow.
# `awslocal` is LocalStack's wrapper around the AWS CLI (preconfigured endpoint + creds).

set -e

echo "[init] creating SQS queue: portfolio-contact-queue"
awslocal sqs create-queue --queue-name portfolio-contact-queue

echo "[init] creating DynamoDB table: portfolio-contacts"
awslocal dynamodb create-table \
  --table-name portfolio-contacts \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

echo "[init] done — queue + table ready"

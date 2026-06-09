# Phase 2 — AWS Infrastructure Setup

> Do not start this phase until Phase 1 is fully complete.
> Read `.claude/phases/phase-1-local-dev.md` and verify all checkboxes are marked.

## Prerequisites
- [ ] AWS account with free tier eligibility verified
- [ ] AWS CLI installed and configured (`aws configure`)
- [ ] Docker image builds and runs locally

## 2.1 Networking (VPC)
- [ ] Create VPC (10.0.0.0/16)
- [ ] Create 2 public subnets in different AZs (for ALB requirement)
- [ ] Create Internet Gateway, attach to VPC
- [ ] Route table: public subnets → IGW
- [ ] Security groups:
  - ALB SG: inbound 80/443 from 0.0.0.0/0
  - EC2 SG: inbound 3000 from ALB SG only, SSH from your IP
  - DB SG: inbound 5432 from EC2 SG only

## 2.2 EC2 + Docker deployment
- [ ] Launch t2.micro (Amazon Linux 2023 / Ubuntu 22.04)
- [ ] Install Docker + Docker Compose on EC2
- [ ] Push Docker image to ECR (or pull from GitHub Container Registry)
- [ ] Run the app container on EC2
- [ ] Verify app accessible via EC2 public IP:3000

## 2.3 ALB + Target Groups
- [ ] Create ALB in the 2 public subnets
- [ ] Create Target Group "blue" → register the running EC2 instance
- [ ] Create Target Group "green" → leave empty (used during deploys)
- [ ] ALB listener rule: forward to "blue" target group
- [ ] Health check: GET / with 200 response
- [ ] Verify: app accessible via ALB DNS name

## 2.4 Auto Scaling Group
- [ ] Create Launch Template from the running EC2 config
  - User data script: pull Docker image + docker-compose up
- [ ] Create ASG:
  - Min: 1, Max: 2, Desired: 1
  - Attach to ALB target group "blue"
  - Scaling policy: CPU > 70% → scale out, CPU < 30% → scale in
  - Cooldown: 300 seconds
- [ ] Terminate the manually launched EC2 (ASG will create its own)
- [ ] Verify: ASG launches an instance, ALB routes to it

## 2.5 SQS + DynamoDB (real AWS)
- [ ] Create SQS standard queue: `portfolio-contact-queue`
- [ ] Create DynamoDB table: `portfolio-contacts` (partition key: id)
- [ ] Update .env with real AWS endpoints (remove LocalStack override)
- [ ] IAM role for EC2: allow sqs:*, dynamodb:PutItem
- [ ] Test: contact form → real SQS → real DynamoDB

## 2.6 PostgreSQL on your server
- [ ] Set up PostgreSQL on your personal server
- [ ] Create database + user for the portfolio
- [ ] Run Prisma migrations against remote DB
- [ ] Update DATABASE_URL in EC2 environment
- [ ] Secure: allow connections only from EC2 SG

## Phase 2 complete when:
- [ ] App runs behind ALB on EC2 via ASG
- [ ] ALB health checks pass
- [ ] Auto scaling triggers on CPU load
- [ ] Contact form flows through real SQS → DynamoDB
- [ ] Blog data lives in self-hosted PostgreSQL
- [ ] Blue and green target groups exist (green is empty, ready for deploys)

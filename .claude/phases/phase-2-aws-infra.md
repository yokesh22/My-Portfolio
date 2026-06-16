# Phase 2 — AWS Infrastructure Setup

> Do not start this phase until Phase 1 is fully complete.
> Read `.claude/phases/phase-1-local-dev.md` and verify all checkboxes are marked.

## Prerequisites
- [x] AWS account with free tier eligibility verified
- [ ] AWS CLI installed and configured (`aws configure`) — needed now for ECR push (Console-first for everything else)
- [x] Docker image builds and runs locally — output:'standalone' + multi-stage Dockerfile; portfolio:local 307MB, verified at localhost:3000

## 2.1 Networking (VPC) ✅ COMPLETE (Console, region: ap-south-1)
- [x] Create VPC (10.0.0.0/16) — portfolio-vpc (vpc-0a1dc8f3c536d1807)
- [x] Create 2 public subnets in different AZs (for ALB requirement) — portfolio-public-a (10.0.1.0/24), portfolio-public-b (10.0.2.0/24)
- [x] Create Internet Gateway, attach to VPC — portfolio-igw
- [x] Route table: public subnets → IGW — portfolio-public-rt (0.0.0.0/0 → igw), both subnets associated
- [x] Security groups:
  - [x] ALB SG (portfolio-alb-sg): inbound 80/443 from 0.0.0.0/0
  - [x] EC2 SG (portfolio-ec2-sg): inbound 3000 from ALB SG only, SSH from my IP
  - [x] DB SG (portfolio-db-sg): inbound 5432 from EC2 SG only (unused if Postgres stays external — decide at 2.6)

## 2.2 EC2 + Docker deployment ✅ COMPLETE
- [x] Launch t3.micro (Ubuntu 24.04 LTS) — portfolio-ec2 (i-028f2c5b80d127418), in public-a, portfolio-ec2-sg, IAM role portfolio-ec2-role (ECR read)
- [x] Install Docker on EC2 (get.docker.com) + AWS CLI v2
- [x] Push Docker image to ECR — repo: 533267039771.dkr.ecr.ap-south-1.amazonaws.com/portfolio:latest (pushed from laptop)
- [x] Run the app container on EC2 — docker run -d --restart unless-stopped -p 3000:3000
- [x] Verified via `curl -I localhost:3000` on the instance (public :3000 intentionally blocked by SG; ALB is the public path)

## 2.3 ALB + Target Groups ✅ COMPLETE
- [x] Create ALB in the 2 public subnets — portfolio-alb (internet-facing, portfolio-alb-sg, both AZs)
- [x] Create Target Group "blue" (portfolio-blue, HTTP:3000) → registered portfolio-ec2 → HEALTHY
- [x] Create Target Group "green" (portfolio-green) → empty (standby for deploys)
- [x] ALB listener HTTP:80 → forward to portfolio-blue
- [x] Health check: GET / → 200 → target healthy
- [x] Verified: site loads in browser via ALB DNS name. SITE IS LIVE.
- Note: HTTPS:443 + custom domain (Route 53 + ACM) deferred — optional step after build.
- Cost hygiene: free-tier status pending ($0 budget alert set). Stop EC2 + delete ALB between sessions if free tier expired.

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

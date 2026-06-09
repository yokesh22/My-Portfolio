# Phase 3 — CI/CD + Blue-Green Deployment

> Do not start until Phase 2 is fully complete.

## 3.1 GitHub Actions — build + push
- [ ] Create `.github/workflows/deploy.yml`
  - Trigger: push to `main` branch
  - Steps:
    1. Checkout code
    2. Build Docker image
    3. Push to ECR / GitHub Container Registry
    4. Trigger deployment (next step)
- [ ] Test: push to main → image appears in registry

## 3.2 Blue-green deployment script
- [ ] Create `scripts/deploy-blue-green.sh`
  - Determine current active TG (blue or green)
  - Launch new instance in the inactive TG with new image
  - Wait for health check to pass (poll ALB health)
  - Flip ALB listener to the new TG
  - Wait 60s for in-flight requests to drain
  - Terminate instances in old TG
  - The new TG is now "blue" (active)
- [ ] Add to GitHub Actions as deployment step
  - Use AWS CLI in the action (configure credentials via secrets)

## 3.3 Rollback mechanism
- [ ] If health check fails on green: terminate green, keep blue active
- [ ] Store last known good image tag in SSM Parameter Store
- [ ] Manual rollback script: flip ALB back + launch previous image

## 3.4 Secrets management
- [ ] Store all env vars in AWS Systems Manager Parameter Store
  - DATABASE_URL, NEXTAUTH_SECRET, etc.
- [ ] EC2 user data script pulls secrets on boot
- [ ] GitHub Actions secrets: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY

## Phase 3 complete when:
- [ ] Push to main → auto build → deploy to green → health check → flip traffic
- [ ] Zero-downtime deployment verified
- [ ] Rollback tested and working
- [ ] All secrets managed via SSM, not hardcoded

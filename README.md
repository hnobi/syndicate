# Syndicate

## Overview

Syndicate is a cloud-native, scalable platform for community-driven applications. Built with [NestJS](https://nestjs.com/), MongoDB, Redis, and AWS, it leverages modern DevOps practices, Infrastructure as Code (IaC), and CI/CD automation for robust production deployments.

---

## Architecture

- **Backend:** TypeScript, NestJS, modular DDD structure
- **Database:** MongoDB (document store), Redis (cache, queue)
- **Infrastructure:** AWS ECS Fargate, ECR, ElastiCache, ALB, S3, Secrets Manager
- **IaC:** Terraform modules (see `infra/`)
- **CI/CD:** GitHub Actions (`.github/workflows/deploy.yml`)
- **Containerization:** Docker multi-stage builds

---

## Features

- **Authentication:** JWT, role-based access, guards
- **Community Management:** CRUD, membership, visibility controls
- **User Management:** Registration, profile, update
- **Email Notifications:** BullMQ queue, Nodemailer integration
- **Caching & Queues:** Redis for performance and async jobs
- **Secrets Management:** AWS Secrets Manager via Terraform
- **Auto-scaling:** ECS Fargate, ALB health checks
- **Continuous Deployment:** Automated build, test, and deploy pipeline

---

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- AWS CLI (for infra management)
- Terraform >= 1.5
- MongoDB & Redis (local or cloud)
- AWS account with IAM permissions

### Local Development

1. **Install dependencies**
   ```sh
   yarn install
   ```

2. **Configure environment**
   - Copy `.env.example` to `.env` and set secrets.

3. **Start local stack**
   ```sh
   make up
   ```

4. **Run tests**
   ```sh
   yarn test
   ```

5. **Lint & format**
   ```sh
   yarn lint
   yarn format
   ```

---

## Infrastructure & Deployment

### Terraform Modules

- Located in `infra/modules/`
- Modularized for ECR, ECS, Secrets, State, etc.
- Example usage:
  ```sh
  cd infra
  terraform init
  terraform plan
  terraform apply
  ```

### CI/CD Pipeline

Automated via GitHub Actions (`.github/workflows/deploy.yml`):

- **Trigger:** On push to `main`
- **Steps:**
  1. Checkout code
  2. Configure AWS credentials
  3. Build Docker image (production target)
  4. Tag and push image to ECR
  5. Download current ECS task definition
  6. Update task definition with new image
  7. Deploy updated task to ECS service
  8. Wait for service stability
  9. Output deployment summary

#### Secrets

- AWS credentials and region are stored in GitHub repository secrets:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_REGION`

#### Example Workflow

```yaml
# See .github/workflows/deploy.yml for full details
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
      - name: Configure AWS credentials
      - name: Build, tag, and push Docker image
      - name: Update ECS task definition
      - name: Deploy to ECS
```

---

## Project Structure

```
infra/         # Terraform modules and state
src/           # NestJS application code
  auth/        # Authentication logic
  community/   # Community features
  user/        # User management
  mail/        # Email queue and service
  queue/       # Queue integration
  common/      # Shared decorators, enums, interfaces
  main.ts      # App entrypoint
.github/       # CI/CD workflows
Dockerfile     # Multi-stage build
```

---

## API Endpoints

- **Auth:** `/auth/signup`, `/auth/login`
- **User:** `/users`, `/users/:id`
- **Community:** `/communities`, `/communities/:slug`
- **Health:** `/health`

See controller files in `src/` for details.

---

## Operations

- **Build:** `yarn build`
- **Start:** `yarn start:prod`
- **Test:** `yarn test`
- **Lint:** `yarn lint`
- **Format:** `yarn format`
- **Docker Compose:** `make up`, `make down`
- **Terraform:** `terraform plan`, `terraform apply`

---

## Contributing

- Fork and clone the repo
- Create feature branches
- Submit PRs with clear descriptions
- Ensure tests and lint pass

---

## License

UNLICENSED

---

## References

- [NestJS Docs](https://docs.nestjs.com/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [GitHub Actions](https://docs.github.com/en/actions)
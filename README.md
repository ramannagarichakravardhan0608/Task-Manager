# Task Manager API

Task Manager API is a production-oriented FastAPI application for creating, updating, completing, and deleting tasks. It includes a responsive Bootstrap UI, PostgreSQL persistence, Docker-based local development, and an ECS/Fargate deployment path with GitHub Actions.

## Project Overview

- Backend: Python, FastAPI, SQLAlchemy, PostgreSQL, Pydantic
- Frontend: HTML, CSS, Vanilla JavaScript, Bootstrap
- Deployment: Docker, Docker Compose, GitHub Actions, Amazon ECR, Amazon ECS Fargate, Application Load Balancer
- Architecture: Clean, modular layout with API, service, model, schema, and database layers
- Infrastructure as Code: Terraform for AWS provisioning

## Architecture Diagram

```mermaid
flowchart TD
  Users --> ALB[Application Load Balancer]
  ALB --> ECS[Amazon ECS Service]
  ECS --> Container[Docker Container]
  Container --> App[FastAPI Application]
  App --> DB[(PostgreSQL)]
```

## Features

- Home page for managing tasks
- Create, view, update, delete, and complete tasks
- Validation with Pydantic and FastAPI
- Health endpoint for container and load balancer checks
- Responsive UI with Bootstrap
- Structured logging
- Environment-variable configuration
- Docker Compose for local development

## API Documentation

Base URL: `http://localhost:8000`

### Endpoints

- `GET /health`
- `GET /tasks`
- `GET /tasks/{id}`
- `POST /tasks`
- `PUT /tasks/{id}`
- `DELETE /tasks/{id}`
- `PATCH /tasks/{id}/complete`

### Task Schema

- `id`
- `title`
- `description`
- `priority`
- `status`
- `created_at`

### Example Request

```bash
curl -X POST http://localhost:8000/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ship Task Manager",
    "description": "Deploy the app to ECS",
    "priority": "high"
  }'
```

## Folder Structure

```text
task-manager/
├── app/
│   ├── api/
│   ├── models/
│   ├── schemas/
│   ├── database/
│   ├── services/
│   ├── static/
│   ├── templates/
│   ├── main.py
│   └── config.py
├── tests/
├── deploy/
├── infra/
│   └── terraform/
├── .github/workflows/
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── .gitignore
├── .dockerignore
└── README.md
```

## Local Setup

### Prerequisites

- Docker
- Docker Compose

### Run Locally

```bash
docker compose up --build
```

Open:

- UI: `http://localhost:8000`
- Health: `http://localhost:8000/health`
- OpenAPI: `http://localhost:8000/docs`

## Docker Setup

The project uses a multi-stage Dockerfile:

- Builder stage installs dependencies into wheels
- Runtime stage uses a slim Python base image
- Container runs as a non-root user
- Healthcheck calls `/health`
- Configuration is driven by environment variables

### Example Variables

```bash
APP_NAME=Task Manager API
DEBUG=false
LOG_LEVEL=INFO
DATABASE_URL=postgresql+psycopg://taskuser:taskpassword@db:5432/taskmanager
ALLOWED_ORIGINS=http://localhost:8000
HOST=0.0.0.0
PORT=8000
```

## GitHub Actions

The workflow at `.github/workflows/ci-cd.yml` runs automatically on push to `main`.

Pipeline stages:

1. Lint with `ruff`
2. Run tests with `pytest`
3. Build Docker image
4. Push image to Amazon ECR
5. Deploy the updated task definition to Amazon ECS

### Required GitHub Secrets

- `AWS_REGION`
- `AWS_ROLE_ARN`
- `ECR_REPOSITORY`
- `ECS_CLUSTER`
- `ECS_SERVICE`

### AWS Inputs Used by the Deployment

- AWS account: `810448722017`
- Example ECR repository: `task-manager-api`
- Example ECS service name: `task-manager-api-service`

## AWS Deployment

This project is designed to run on:

```text
Users
↓
Application Load Balancer
↓
Amazon ECS Service
↓
Docker Container
↓
FastAPI Application
↓
PostgreSQL
```

### Required AWS Resources

- Amazon ECR repository
- ECS cluster
- ECS Fargate service
- ECS task execution role
- ECS task role
- Application Load Balancer
- Target group for container port `8000`
- CloudWatch Logs group
- PostgreSQL database accessible from ECS tasks
- AWS SSM parameters for secrets

## Terraform Setup

The AWS infrastructure is provisioned from `infra/terraform`.

### What Terraform Creates

- VPC, subnets, routes, NAT gateway
- Security groups
- Application Load Balancer
- ECR repository
- ECS cluster, task definition, and service
- RDS PostgreSQL instance
- CloudWatch log group
- SSM parameters
- GitHub OIDC role for deployment

### Quick Start

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars
```

### Terraform Outputs

After apply, Terraform prints:

- ALB DNS name and URL
- ECR repository URL
- ECS cluster and service names
- GitHub Actions role ARN
- Database endpoint
- SSM parameter names

### GitHub Actions Integration

After Terraform finishes, add these values to your GitHub repository secrets:

- `AWS_REGION`
- `AWS_ROLE_ARN` from Terraform output `github_actions_role_arn`
- `ECR_REPOSITORY` as the repository name, for example `task-manager-api`
- `ECS_CLUSTER` from Terraform output `ecs_cluster_name`
- `ECS_SERVICE` from Terraform output `ecs_service_name`

### Load Balancer Health Check

- Path: `/health`
- Success codes: `200`
- Container port: `8000`

## Validation and Error Handling

- Request validation is handled by Pydantic
- Missing resources return `404`
- Unexpected errors are logged and return safe JSON responses

## Logging

The application writes structured logs to stdout, which is compatible with Docker, ECS, and CloudWatch Logs.

## Future Improvements

- Add Alembic migrations
- Add authentication and authorization
- Add pagination and filtering
- Add audit fields such as `updated_at` and `deleted_at`
- Add observability with OpenTelemetry
- Add unit tests for the service layer

## Testing

Run tests locally:

```bash
pytest -q
```

Run linting:

```bash
ruff check .
```

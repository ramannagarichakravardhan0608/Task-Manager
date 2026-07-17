# Terraform

This directory provisions the AWS infrastructure for Task Manager API.

## Resources Created

- VPC with public and private subnets
- Internet gateway and NAT gateway
- Security groups for ALB, ECS, and PostgreSQL
- Application Load Balancer and target group
- ECR repository
- ECS cluster, task definition, and Fargate service
- RDS PostgreSQL instance
- CloudWatch log group
- SSM parameters for application secrets
- GitHub Actions OIDC role for deployment

## Usage

```bash
cd infra/terraform
terraform init
terraform plan -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars
```

## Recommended Files

Copy the example variable file:

```bash
cp terraform.tfvars.example terraform.tfvars
```

## Notes

- The GitHub Actions deployment role is restricted to pushes from the `main` branch of the configured repository.
- The ECS service ignores Terraform drift on `task_definition` so application deployments from GitHub Actions do not get reset on the next Terraform run.
- The application is deployed through the ALB on HTTP port `80`.


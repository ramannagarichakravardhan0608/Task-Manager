output "vpc_id" {
  value = aws_vpc.this.id
}

output "alb_dns_name" {
  value = aws_lb.app.dns_name
}

output "alb_url" {
  value = "http://${aws_lb.app.dns_name}"
}

output "ecr_repository_url" {
  value = aws_ecr_repository.app.repository_url
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.this.name
}

output "ecs_service_name" {
  value = aws_ecs_service.app.name
}

output "github_actions_role_arn" {
  value = aws_iam_role.github_actions.arn
}

output "database_endpoint" {
  value = aws_db_instance.postgres.address
}

output "ssm_parameter_names" {
  value = {
    database_url    = aws_ssm_parameter.database_url.name
    secret_key      = aws_ssm_parameter.secret_key.name
    allowed_origins = aws_ssm_parameter.allowed_origins.name
  }
}


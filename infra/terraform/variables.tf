variable "aws_region" {
  description = "AWS region to deploy into."
  type        = string
  default     = "ap-south-2"
}

variable "project_name" {
  description = "Project name used for resource naming."
  type        = string
  default     = "task-manager"
}

variable "app_name" {
  description = "Application name exposed to the container."
  type        = string
  default     = "Task Manager API"
}

variable "github_owner" {
  description = "GitHub organization or username that owns the repository."
  type        = string
  default     = "ramannagarichakravardhan0608"
}

variable "github_repo" {
  description = "GitHub repository name."
  type        = string
  default     = "Task-Manager"
}

variable "github_branch" {
  description = "Git branch allowed to assume the GitHub Actions deployment role."
  type        = string
  default     = "main"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC."
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets."
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets."
  type        = list(string)
  default     = ["10.0.11.0/24", "10.0.12.0/24"]
}

variable "container_port" {
  description = "Container port exposed by FastAPI."
  type        = number
  default     = 8000
}

variable "task_cpu" {
  description = "Fargate task CPU units."
  type        = number
  default     = 256
}

variable "task_memory" {
  description = "Fargate task memory in MiB."
  type        = number
  default     = 512
}

variable "desired_count" {
  description = "Desired number of ECS tasks."
  type        = number
  default     = 2
}

variable "db_name" {
  description = "PostgreSQL database name."
  type        = string
  default     = "taskmanager"
}

variable "db_username" {
  description = "PostgreSQL master username."
  type        = string
  default     = "taskuser"
}

variable "db_instance_class" {
  description = "RDS instance class."
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "RDS allocated storage in GB."
  type        = number
  default     = 20
}

variable "allowed_origins" {
  description = "Comma-separated CORS origins. Leave empty for same-origin deployments."
  type        = string
  default     = ""
}

variable "enable_deletion_protection" {
  description = "Enable deletion protection on the load balancer and database."
  type        = bool
  default     = false
}

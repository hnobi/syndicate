variable "app_name" {
  description = "Application name for resource naming"
  type        = string
  default = "syndicate"
}

variable "jwt_secret" {
  description = "JWT secret key"
  type        = string
  sensitive   = true
}

variable "email_user" {
  description = "Email username"
  type        = string
  sensitive   = true
}

variable "email_pass" {
  description = "Email password"
  type        = string
  sensitive   = true
}

variable "mongo_url" {
  description = "MongoDB connection URL"
  type        = string
  sensitive   = true
}

variable "ecs_execution_role_id" {
  description = "ECS task execution role ID"
  type        = string
}

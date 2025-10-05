variable "syndicate_cluster_name" {
  description = "The name of the ECS cluster"
  type        = string
}

variable "ecr_repo_url" {
  type = string
}

variable "syndicate_task_family" {
  description = "The family of the ECS task definition"
  type        = string
}

variable "syndicate_task_name" {
  description = "The name of the ECS task"
  type        = string
}

variable "container_port" {
  type = number
}
variable "NODE_ENV" {
  type    = string
  default = "production"
}

variable "ecs_task_execution_role_name" {
  type = string
}

variable "application_load_balancer_name" {
  type = string
}

variable "target_group_name" {
  type = string
}

variable "syndicate_service_name" {
  description = "The name of the ECS service"
  type        = string
}
variable "availability_zones" {
  type = list(string)
}
variable "autoscaling_policy_name" {
  type = string
  default = "cpu-autoscaling"
}

variable "redis_port" {
  type    = number
  default = 6379
}

variable "secrets" {
  description = "List of secrets for the ECS task"
  type        = list(object({
    name      = string
    valueFrom = string
  }))
  default = []
}

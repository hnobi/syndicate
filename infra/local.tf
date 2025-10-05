locals {
  bucket_name                    = "syndicate-bucket-state"
  table_name                     = "syndicate-table-name-state-lock"
  ecr_repo_name                  = "syndicate-repository"
  syndicate_cluster_name         = "syndicate-cluster"
  syndicate_task_family          = "syndicate_task-family"
  syndicate_task_name            = "syndicate_task"
  container_port                 = 3000 # Port Exposed by the Docker Container
  ecs_task_execution_role_name   = "syndicate-ecs-task-execution-role"
  application_load_balancer_name = "syndicate-application-lb"
  availability_zones             = ["eu-west-2a", "eu-west-2b", "eu-west-2c"]
  target_group_name              = "syndicate-target-group"
  syndicate_service_name         = "syndicate-service"
}
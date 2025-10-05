terraform {
  required_version = "~> 1.13.3"
  backend "s3" {
    bucket         = "syndicate-bucket-state"
    key            = "tf-infra/terraform.tfstate"
    region         = "eu-west-2"
    dynamodb_table = "syndicate-table-name-state-lock"
    encrypt        = true
  }
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.15.0"
    }
  }
}


module "tf-state" {
  source      = "./modules/tf-state"
  bucket_name = local.bucket_name
  table_name  = local.table_name
}

module "ecr-repository" {
  source            = "./modules/ecr"
  aws_ecr_repo_name = local.ecr_repo_name
}

# Secrets module
module "secrets" {
  source = "./modules/secrets"

  jwt_secret             = var.jwt_secret
  email_user             = var.email_user
  email_pass             = var.email_pass
  mongo_url              = var.mongo_url
  ecs_execution_role_id  = module.ecsCluster.execution_role_id
}


module "ecsCluster" {
  source                         = "./modules/ecs"

  ecr_repo_url                   = "${module.ecr-repository.repository_url}:${var.image_tag}" #from ecr module output
  syndicate_cluster_name         = local.syndicate_cluster_name
  syndicate_task_family          = local.syndicate_task_family
  syndicate_task_name            = local.syndicate_task_name
  container_port                 = local.container_port
  ecs_task_execution_role_name   = local.ecs_task_execution_role_name
  application_load_balancer_name = local.application_load_balancer_name
  availability_zones             = local.availability_zones
  target_group_name              = local.target_group_name
  syndicate_service_name         = local.syndicate_service_name
  secrets = [
    {
      name      = "JWT_SECRET"
      valueFrom = module.secrets.jwt_secret_arn
    },
    {
      name      = "EMAIL_USER"
      valueFrom = module.secrets.email_user_arn
    },
    {
      name      = "EMAIL_PASS"
      valueFrom = module.secrets.email_pass_arn
    },
    {
      name      = "MONGO_URL"
      valueFrom = module.secrets.mongo_url_arn
    }
  ]

}
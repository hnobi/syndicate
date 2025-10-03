terraform {
  required_version = "~> 1.13.3"
  backend "s3" {
    bucket = "syndicate-bucket-state"
    key= "tf-infra/terraform.tfstate"
    region = "eu-west-2"
    dynamodb_table = "syndicate-table-name-state-lock"
    encrypt = true
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

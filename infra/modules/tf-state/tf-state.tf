# S3 bucket for storing Terraform state files
resource "aws_s3_bucket" "syndicate-terraform-state" {
  bucket = var.bucket_name
  tags = {
    Name        = "syndicate-terraform-state"
    Environment = "Dev"
  }
}

resource "aws_s3_bucket_versioning" "versioning" {
  bucket = aws_s3_bucket.syndicate-terraform-state.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state_encryption" {
  bucket = aws_s3_bucket.syndicate-terraform-state.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }

}

# DynamoDB table for Terraform state locking
resource "aws_dynamodb_table" "syndicate-terraform-lock" {
  name         = var.table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"
  attribute {
    name = "LockID"
    type = "S"
  }
  tags = {
    Name        = "syndicate-terraform-lock"
    Environment = "Dev"
  }
}
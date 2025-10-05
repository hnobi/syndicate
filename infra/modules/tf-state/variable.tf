variable "bucket_name" {
  description = "The name of the S3 bucket"
  type        = string
  default     = "syndicate-terraform-state-bucket"

}

variable "table_name" {
  description = "The name of the DynamoDB table"
  type        = string
  default     = "syndicate-terraform-lock-table"
}

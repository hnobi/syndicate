
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

variable "image_tag" {
  description = "Docker image tag to deploy"
  type        = string
  default     = "1.0"
}

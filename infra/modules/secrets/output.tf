output "jwt_secret_arn" {
  description = "ARN of JWT secret parameter"
  value       = aws_ssm_parameter.jwt_secret.arn
}

output "email_user_arn" {
  description = "ARN of email user parameter"
  value       = aws_ssm_parameter.email_user.arn
}

output "email_pass_arn" {
  description = "ARN of email password parameter"
  value       = aws_ssm_parameter.email_pass.arn
}

output "mongo_url_arn" {
  description = "ARN of MongoDB URL parameter"
  value       = aws_ssm_parameter.mongo_url.arn
}
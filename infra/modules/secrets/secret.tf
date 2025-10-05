resource "aws_ssm_parameter" "jwt_secret" {
  name        = "/${var.app_name}/jwt_secret"
  description = "JWT secret for authentication"
  type        = "SecureString"
  value       = var.jwt_secret
}

resource "aws_ssm_parameter" "email_user" {
  name        = "/${var.app_name}/email_user"
  description = "Email service username"
  type        = "SecureString"
  value       = var.email_user
}

resource "aws_ssm_parameter" "email_pass" {
  name        = "/${var.app_name}/email_pass"
  description = "Email service password"
  type        = "SecureString"
  value       = var.email_pass
}

resource "aws_ssm_parameter" "mongo_url" {
  name        = "/${var.app_name}/mongo_url"
  description = "MongoDB connection URL"
  type        = "SecureString"
  value       = var.mongo_url
}

# IAM policy for ECS to read these secrets
resource "aws_iam_role_policy" "ecs_ssm_policy" {
  name = "${var.app_name}-ecs-ssm-policy"
  role = var.ecs_execution_role_id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameters",
          "ssm:GetParameter"
        ]
        Resource = [
          aws_ssm_parameter.jwt_secret.arn,
          aws_ssm_parameter.email_user.arn,
          aws_ssm_parameter.email_pass.arn,
          aws_ssm_parameter.mongo_url.arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt"
        ]
        Resource = "*"
      }
    ]
  })
}
resource "aws_ecs_cluster" "syndicate-cluster" {
  name = var.syndicate_cluster_name
}

resource "aws_default_vpc" "syndicate-default-vpc" {}

resource "aws_default_subnet" "syndicate_default_subnet_a" {
  availability_zone = var.availability_zones[0]
}

resource "aws_default_subnet" "syndicate_default_subnet_b" {
  availability_zone = var.availability_zones[1]
}

resource "aws_default_subnet" "syndicate_default_subnet_c" {
  availability_zone = var.availability_zones[2]
}

// IAM ROLE FOR ECS TASK EXECUTION
resource "aws_iam_role" "ecs_task_execution_role" {
  name               = var.ecs_task_execution_role_name
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy.json
}

resource "aws_cloudwatch_log_group" "ecs_logs" {
  name              = "/ecs/syndicate"
  retention_in_days = 14
}
resource "aws_ecs_task_definition" "syndicate_task" {
  family                   = var.syndicate_task_family
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "X86_64"  # or "X86_64" for AMD64
  }

 container_definitions = jsonencode([
  {
    name      = var.syndicate_task_name
    image     = var.ecr_repo_url
    essential = true
    portMappings = [
      {
        containerPort = var.container_port
        hostPort      = var.container_port
      }
    ]
    secrets = var.secrets
    environment = [
      {
        name  = "REDIS_HOST"
        value = aws_elasticache_cluster.redis.cache_nodes[0].address
      },
      {
        name  = "REDIS_PORT"
        value = tostring(var.redis_port)
      },
      {
        name  = "NODE_ENV"
        value = var.NODE_ENV
  },
    ]
     logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = "/ecs/syndicate"
        awslogs-stream-prefix = "ecs"
          "awslogs-region"        = "eu-west-2" 
      }
    }
  }
])

}

# ATTACH POLICY TO THE ABOVE ROLE(ecs_task_execution_role) TO ALLOW ECS TASKS TO PULL IMAGES FROM ECR AND WRITE LOGS TO CLOUDWATCH
resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy_attachment" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_lb" "application_load_balancer" {
  name               = var.application_load_balancer_name
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.load_balancer_security_group.id]
  subnets = [
    aws_default_subnet.syndicate_default_subnet_a.id,
    aws_default_subnet.syndicate_default_subnet_b.id,
    aws_default_subnet.syndicate_default_subnet_c.id
  ]

}

# Security group for the load balancer
resource "aws_security_group" "load_balancer_security_group" {
  vpc_id = aws_default_vpc.syndicate-default-vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

}

resource "aws_lb_target_group" "target_group" {
  name     = var.target_group_name
  port     = var.container_port
  protocol = "HTTP"
  vpc_id   = aws_default_vpc.syndicate-default-vpc.id
   target_type = "ip" 
  deregistration_delay = 300 
  health_check {
    path                = "/health"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 3
    unhealthy_threshold = 2
    matcher             = "200-399"
  }

}
# Internet → Load Balancer → Listener → Target Group → Targets (EC2, IPs, etc.)
resource "aws_lb_listener" "listener" {
  load_balancer_arn = aws_lb.application_load_balancer.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.target_group.arn
  }
}

# ECS Service Autoscaling Target
resource "aws_appautoscaling_target" "ecs_target" {
  max_capacity       = 3
  min_capacity       = 1
  resource_id        = "service/${aws_ecs_cluster.syndicate-cluster.name}/${aws_ecs_service.syndicate_service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

# ECS Service Autoscaling Policy
resource "aws_appautoscaling_policy" "ecs_service_cpu" {
  name               = var.autoscaling_policy_name
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_target.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_target.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = 50.0
    scale_in_cooldown  = 60
    scale_out_cooldown = 60
  }
}
// The main ECS SERVICE
resource "aws_ecs_service" "syndicate_service" {
  name            = var.syndicate_service_name
  cluster         = aws_ecs_cluster.syndicate-cluster.id
  task_definition = aws_ecs_task_definition.syndicate_task.arn
  launch_type     = "FARGATE"
  desired_count   = 2
  health_check_grace_period_seconds = 60

  network_configuration {
    subnets = [
      aws_default_subnet.syndicate_default_subnet_a.id,
      aws_default_subnet.syndicate_default_subnet_b.id,
      aws_default_subnet.syndicate_default_subnet_c.id
    ]
    security_groups  = [aws_security_group.ecs_service_security_group.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.target_group.arn
    container_name   = var.syndicate_task_name
    container_port   = var.container_port
  }

  depends_on = [aws_lb_listener.listener]
}



# security group for the ECS service
resource "aws_security_group" "ecs_service_security_group" {
  description = "Security group for the ECS service"
  vpc_id      = aws_default_vpc.syndicate-default-vpc.id

  ingress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    security_groups = [aws_security_group.load_balancer_security_group.id]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Redis Provisioning
# ElastiCache subnet group
resource "aws_elasticache_subnet_group" "redis" {
  name       = "syndicate-redis-subnet"
  subnet_ids = [
    aws_default_subnet.syndicate_default_subnet_a.id,
    aws_default_subnet.syndicate_default_subnet_b.id,
    aws_default_subnet.syndicate_default_subnet_c.id
  ]
}

# Security group for Redis
resource "aws_security_group" "redis_security_group" {
  name        = "syndicate-redis-sg"
  description = "Security group for Redis"
  vpc_id      = aws_default_vpc.syndicate-default-vpc.id

  ingress {
    from_port       = var.redis_port
    to_port         = var.redis_port
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs_service_security_group.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ElastiCache Redis cluster
resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "syndicate-redis2"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  engine_version       = "7.0"
  port                 = var.redis_port
  subnet_group_name    = aws_elasticache_subnet_group.redis.name
  security_group_ids   = [aws_security_group.redis_security_group.id]
}



# GitHub Actions IAM Role and Policy for ECR and ECS Deployment
# IAM Policy for GitHub Actions ECS Deployment
resource "aws_iam_policy" "github_actions_ecs_deployment" {
  name        = "GitHubActionsECSDeployment"
  description = "Allows GitHub Actions to deploy to ECS"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ECSDeploymentPermissions"
        Effect = "Allow"
        Action = [
          "ecs:DescribeTaskDefinition",
          "ecs:RegisterTaskDefinition",
          "ecs:UpdateService",
          "ecs:DescribeServices",
          "ecs:ListTasks",
          "ecs:DescribeTasks"
        ]
        Resource = "*"
      },
      {
        Sid    = "IAMPassRole"
        Effect = "Allow"
        Action = "iam:PassRole"
        Resource = [
          aws_iam_role.ecs_task_execution_role.arn
        ]
        Condition = {
          StringLike = {
            "iam:PassedToService" = "ecs-tasks.amazonaws.com"
          }
        }
      },
      {
        Sid    = "ECRPermissions"
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:PutImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload"
        ]
        Resource = "*"
      }
    ]
  })
}
resource "aws_iam_user_policy_attachment" "tf_dev_ecs_deployment" {
  user       = "tf-dev"
  policy_arn = aws_iam_policy.github_actions_ecs_deployment.arn
}




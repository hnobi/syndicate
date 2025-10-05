output "redis_endpoint" {
  value = aws_elasticache_cluster.redis.cache_nodes[0].address
}

output "execution_role_id" {
  description = "ECS task execution role ID"
  value       = aws_iam_role.ecs_task_execution_role.id
}

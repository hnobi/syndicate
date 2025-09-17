# ==========================
# Variables
# ==========================
COMPOSE_FILE=docker-compose.yaml
APP_CONTAINER=syndicate-api
MONGO_VOLUME=mongodb_data
REDIS_VOLUME=redis_data

# ==========================
# Commands
# ==========================

.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make up             - Build and start dev containers"
	@echo "  make down           - Stop containers"
	@echo "  make logs           - Tail app logs"
	@echo "  make rebuild        - Rebuild app image and start"
	@echo "  make clean          - Remove containers, volumes and rebuild"
	@echo "  make mongo-shell    - Open MongoDB shell"
	@echo "  make reset-db       - Clear MongoDB volume and restart"

# Start dev containers
.PHONY: up
up:
	docker compose -f $(COMPOSE_FILE) up -d --build

# Stop containers
.PHONY: down
down:
	docker compose -f $(COMPOSE_FILE) down

# Tail app logs
.PHONY: logs
logs:
	docker logs -f $(APP_CONTAINER)

# Rebuild app image
.PHONY: rebuild
rebuild:
	docker compose -f $(COMPOSE_FILE) build --no-cache
	docker compose -f $(COMPOSE_FILE) up -d

# Remove containers and volumes
.PHONY: clean
clean:
	docker compose -f $(COMPOSE_FILE) down -v
	docker volume rm -f $(MONGO_VOLUME) $(REDIS_VOLUME)

# Open MongoDB shell
.PHONY: mongo-shell
mongo-shell:
	docker exec -it mongodb mongo -u admin -p password --authenticationDatabase admin

# Reset MongoDB data
.PHONY: reset-db
reset-db:
	docker compose -f $(COMPOSE_FILE) down
	docker volume rm -f $(MONGO_VOLUME)
	docker compose -f $(COMPOSE_FILE) up -d

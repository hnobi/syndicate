# Roadmap

Planned work for Syndicate, roughly in priority order.

## Community features
- [ ] Join / leave a community (`POST /communities/:slug/join`, `/leave`) using the existing `CommunityMembers` schema
- [ ] List community members (`GET /communities/:slug/members`) with pagination
- [ ] Member roles: promote/demote moderators, remove members (owner/admin only)
- [ ] Enforce visibility rules: private communities hidden from non-members, invite/approval flow
- [ ] Delete / archive a community
- [ ] Avatar and cover image upload to S3 (pre-signed URLs)
- [ ] Search and pagination on `GET /communities`
- [ ] Keep `memberCount` in sync on join/leave

## Users & auth
- [ ] Email verification on signup (via the existing BullMQ mail queue)
- [ ] Password reset flow
- [ ] Refresh tokens and logout
- [ ] Rate limiting on auth endpoints (`@nestjs/throttler`)

## Quality
- [ ] Unit tests for auth, user and community services (current specs are scaffolding only)
- [ ] E2E tests against MongoDB/Redis test containers
- [ ] Run lint and tests in GitHub Actions on every PR, before deploy
- [ ] Global validation pipe and consistent error response format
- [ ] Centralised config validation for environment variables

## Docs
- [ ] OpenAPI / Swagger docs (`@nestjs/swagger`)
- [ ] Architecture diagram and local setup troubleshooting in README

## Infrastructure
- [ ] Add missing `mongo-init.js` (referenced by docker-compose) or remove the mount
- [ ] Separate staging and production environments in Terraform
- [ ] CloudWatch alarms and dashboard for the ECS service
- [ ] Switch CI AWS auth to GitHub OIDC instead of long-lived access keys

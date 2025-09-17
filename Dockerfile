
# Development stage
FROM node:20-alpine AS dev
WORKDIR /usr/src/app
COPY package.json ./
COPY yarn.lock ./
RUN yarn install && npm cache clean --force
COPY . .
EXPOSE 3000
CMD ["yarn", "start:dev"]

# Build stage
FROM node:20-alpine AS build
WORKDIR /usr/src/app
COPY package*.json ./
COPY yarn.lock ./
RUN yarn install && npm cache clean --force
COPY . .
RUN yarn build

# Production stage
FROM node:20-alpine AS production
WORKDIR /usr/src/app
COPY package*.json ./
COPY yarn.lock ./
RUN yarn install && npm cache clean --force

COPY --from=build /usr/src/app/dist ./dist
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]
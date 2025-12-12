FROM oven/bun:alpine

WORKDIR /app
# INSTALL DEPENDENCIES
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
# COPY CONFIG
COPY config/ .

COPY . .
EXPOSE 8080
ENV NODE_ENV="dev"
CMD [ "bun", "run", "dev" ]

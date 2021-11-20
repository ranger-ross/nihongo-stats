## Build App ##

# FROM node:10 AS builder
# WORKDIR /app

# # Install Dependencies
# COPY package*.json .
# RUN npm install

# # Build App
# COPY . .
# RUN npm run build


## Build Image ##

FROM nginx:alpine
# Clean html directory
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*

COPY conf /etc/nginx

# Copy static assets from builder stage
# COPY --from=builder /app/build .
COPY dist .
# Containers run nginx with global directives and daemon off
ENTRYPOINT ["nginx", "-g", "daemon off;"]
FROM nginx:alpine
# Clean html directory
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*

COPY conf /etc/nginx
COPY dist .

LABEL org.opencontainers.image.source https://github.com/ranger-ross/nihongo-stats

# Containers run nginx with global directives and daemon off
ENTRYPOINT ["nginx", "-g", "daemon off;"]

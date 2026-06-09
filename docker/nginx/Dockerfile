# syntax=docker/dockerfile:1.7
ARG NGINX_VERSION=1.27
FROM nginx:${NGINX_VERSION}-alpine

# Limpio default y copio config propia
RUN rm -f /etc/nginx/conf.d/default.conf
COPY docker/nginx/nginx.conf /etc/nginx/conf.d/app.conf

EXPOSE 80

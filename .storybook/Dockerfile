FROM nginx:alpine-slim

# The nginx image on Docker Hub lags behind Alpine security updates: install them at build time
RUN apk upgrade --no-cache

COPY storybook-static /usr/share/nginx/html

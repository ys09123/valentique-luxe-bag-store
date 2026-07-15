# ---- Build stage ----
FROM node:20-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Both env vars are baked into the static bundle at build time (Vite requires this).
# Override these via --build-arg or docker-compose build args.
# NOTE: VITE_API_URL default uses the docker-compose service name "backend".
#       Change to your actual backend host/URL when deploying.
ARG VITE_API_URL=http://backend:5000/api
ENV VITE_API_URL=$VITE_API_URL

ARG VITE_RAZORPAY_KEY_ID
ENV VITE_RAZORPAY_KEY_ID=$VITE_RAZORPAY_KEY_ID

RUN npm run build

# ---- Serve stage ----
FROM nginx:1.27-alpine

COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

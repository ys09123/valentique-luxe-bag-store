FROM node:20-slim

WORKDIR /app

# Install deps first for layer caching
COPY package*.json ./
RUN npm ci --omit=dev

# Copy rest of source
COPY . .

# Local upload storage (in case cloudinary isn't configured / dev fallback)
RUN mkdir -p uploads

# Run as non-root
RUN groupadd -r appuser && useradd -r -g appuser appuser \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 5000

CMD ["node", "server.js"]

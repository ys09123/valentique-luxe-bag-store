FROM node:20-slim

WORKDIR /app

# Create non-root user early
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Install deps first for layer caching
COPY --chown=appuser:appuser package*.json ./
RUN npm ci --omit=dev

# Copy rest of source with correct ownership set at copy time (no slow recursive chown)
COPY --chown=appuser:appuser . .

# Local upload storage (in case cloudinary isn't configured / dev fallback)
RUN mkdir -p uploads && chown appuser:appuser uploads

USER appuser

EXPOSE 5000

CMD ["node", "server.js"]

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
EXPOSE 3000
ENV NEXT_TELEMETRY_DISABLED=1
CMD ["npm", "run", "dev"]

FROM node:20.10.0-alpine3.19

# Supports Puppeteer
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      udev \
      tzdata

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN cp /usr/share/zoneinfo/America/Whitehorse /etc/localtime
RUN echo "America/Whitehorse" > /etc/timezone
RUN apk del tzdata

RUN mkdir /home/node/web && chown -R node:node /home/node/web
WORKDIR /home/node/web
COPY --chown=node:node web/package*.json ./
RUN npm install && npm cache clean --force --loglevel=error
COPY --chown=node:node web ./

RUN mkdir /home/node/app && chown -R node:node /home/node/app
RUN mkdir /home/node/app/db && chown -R node:node /home/node/app/db
WORKDIR /home/node/app
COPY --chown=node:node api/package*.json ./

ENV NODE_ENV=test
USER node
RUN npm install && npm cache clean --force --loglevel=error
COPY --chown=node:node api ./

RUN npm run build

WORKDIR /home/node/web
ENV NODE_ENV=production
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
ENV NODE_OPTIONS=--openssl-legacy-provider

RUN npm run build:docker

WORKDIR /home/node/app
EXPOSE 3000
USER node

COPY --chown=node:node api/src/templates/* /home/node/app/dist/templates/
COPY --chown=node:node api/src/templates/email/* /home/node/app/dist/templates/email/
COPY --chown=node:node api/src/templates/pdf/* /home/node/app/dist/templates/pdf/
COPY --chown=node:node api/src/web/*.png /home/node/app/dist/web/
COPY --chown=node:node api/src/data/departments.json /home/node/app/dist/data/departments.json

CMD ["node", "./dist/index.js"]

FROM node:14-alpine3.10

RUN mkdir /home/node/web && chown -R node:node /home/node/web
WORKDIR /home/node/web
COPY --chown=node:node web/package*.json ./
RUN npm install && npm cache clean --force --loglevel=error
COPY --chown=node:node web ./

RUN mkdir /home/node/app && chown -R node:node /home/node/app
RUN mkdir /home/node/app/db && chown -R node:node /home/node/app/db
WORKDIR /home/node/app
COPY --chown=node:node api/package*.json ./
COPY --chown=node:node api/.env* ./

ENV NODE_ENV=test
USER node
RUN npm install && npm cache clean --force --loglevel=error
COPY --chown=node:node api ./

RUN npm run build

COPY api/src/data/mailcodes.json /home/node/app/dist/data/mailcodes.json
WORKDIR /home/node/web
ENV NODE_ENV=production
RUN npm run build:docker

WORKDIR /home/node/app

CMD ["node", "./dist/index.js"]

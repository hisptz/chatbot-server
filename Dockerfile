FROM node:lts-bullseye-slim
LABEL authors="HISP Tanzania"

WORKDIR /chat-bot

COPY app /chat-bot/app/
COPY prisma /chat-bot/prisma/
COPY package.json /chat-bot/
COPY yarn.lock /chat-bot/

RUN yarn install --production

EXPOSE 3000

ENTRYPOINT ["node", "app/src/index.js"]

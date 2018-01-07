FROM node:8

WORKDIR /app

COPY . .

ENV NODE_ENV production

RUN npm install --only=production

CMD [ "npm", "start" ]

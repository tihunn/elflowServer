FROM node:16

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 3007

CMD ["npm", "run", "serve"]


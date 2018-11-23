FROM node:10.13.0-alpine
ENV PORT 8080
WORKDIR /usr/src/app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 8080
CMD ["npm", "start"]
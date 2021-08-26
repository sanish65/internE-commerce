FROM node:14-slim

WORKDIR /app
ENV NODE_ENV development

COPY . /app
RUN yarn install

EXPOSE 8080
CMD ["yarn","start"]

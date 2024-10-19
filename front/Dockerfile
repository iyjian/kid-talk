FROM node:20.17.0-alpine as builder

WORKDIR /app

ADD package.json .

ADD pnpm-lock.yaml .

ENV VITE_API_ENDPOINT=/api

RUN npm install -g pnpm && pnpm i

COPY . .

RUN pnpm build

RUN ls /app/dist

FROM nginx:stable-alpine as production-stage

COPY --from=builder /app/dist /usr/share/nginx/html/admin-panel

COPY ./quickStart/nginx/nginx.conf /etc/nginx/nginx.conf

COPY ./quickStart/nginx/site-enabled/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

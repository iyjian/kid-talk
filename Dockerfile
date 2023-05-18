FROM node:16.15.0-slim

ENV TZ=Asia/Shanghai \
    DEBIAN_FRONTEND=noninteractive

ENV NODE_ENV=development

RUN ln -fs /usr/share/zoneinfo/${TZ} /etc/localtime \
    && echo ${TZ} > /etc/timezone \
    && dpkg-reconfigure --frontend noninteractive tzdata \
    && rm -rf /var/lib/apt/lists/*

RUN apt-get update -y && apt install ffmpeg -y

RUN npm install pnpm -g

WORKDIR /app

ADD package.json .

ADD pnpm-lock.yaml .

RUN pnpm i

COPY . .

RUN pnpm build

ENTRYPOINT ["yarn", "run", "start:prod"]

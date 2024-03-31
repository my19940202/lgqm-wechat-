FROM dockette/nodejs:v18 AS app

WORKDIR /app
COPY package*.json ./
RUN npm config set registry https://registry.npmmirror.com

RUN npm install

COPY . ./

CMD [ "node", "index.js"]
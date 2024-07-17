FROM node:18.18.0

# Instalar dependências necessárias para Puppeteer
RUN apt-get update && apt-get install -y \
    libnss3 \
    libxss1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libdrm2 \
    libgbm1 \
    libxcb-dri3-0

RUN mkdir -p /app/whatsapp-bot-api2/node_modules && chown -R node:node /app/whatsapp-bot-api2

# Definir o diretório de trabalho
WORKDIR /app/whatsapp-bot-api2

# Instalar as dependências
RUN npm install venom-bot express npm-check-updates libphonenumber-js nodemailer

COPY package*.json ./

COPY --chown=node:node . .

# Expor a porta 3010
EXPOSE 3010

# Definir o comando para executar o aplicativo
CMD ["node", "index.js"]
FROM node:18.18.0

RUN mkdir -p /app/whatsapp-bot-api2/node_modules && chown -R node:node /app/whatsapp-bot-api2

# Definir o diretório de trabalho
WORKDIR /app/whatsapp-bot-api2

# Instalar as dependências
RUN npm init -y venom-bot express npm-check-updates libphonenumber-js nodemailer

COPY package*.json ./

COPY --chown=node:node . .

# Expor a porta 3010
EXPOSE 3010

# Definir o comando para executar o aplicativo
CMD ["node", "index.js"]
FROM node:20-alpine

WORKDIR /app

# Copia os arquivos de dependência
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código (inclusive src/app)
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
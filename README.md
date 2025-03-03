# Телеграм-бот для покер планирования

## Запуск проекта на ПРОМ-е

1. Открыть в телеграмме бота [`@BotFather`](https://telegram.me/BotFather)
2. Создать бота через команду `/newbot`
3. В конце он выдаст API Token, примерно такого вида: `7775805586:AAF555AAAzzzHbKuyxe6-vBARg-hhhZ9pAI`
4. Склонировать репозиторий
5. Скопировать файл `config.example.yml` как `config.prod.yml`, на той же папке
6. Прописать в файле `config.prod.yml` конфиги для mongodb, например, если использовать mongodb который указан в `docker-compose.yml` без дополнительных настроек, то:
```yml
mongo:
  connectionString: mongodb://mongo:27017
  databaseName: subtle-team
```
7. Прописать ранее выданный API Token в конфиг `botToken`:
```yml
telegram:
  botToken: 7775805586:AAF555AAAzzzHbKuyxe6-vBARg-hhhZ9pAI
```
9. Запустить `docker compose up -d`

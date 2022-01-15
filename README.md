Horizontally scalable chat back-end using Server-Sent events. Stack: NestJS, TypeScript, TypeORM, Postgres, Redis, Jest.

Deployed at https://api.grygoryz.ru/. Swagger documentation: https://api.grygoryz.ru/api

## Features
- SSE instead of WebSockets
- horizontally scalable (Redis pub/sub)
- Gitlab ci/cd and Docker swarm
- Jest unit tests
- session based auth
- Swagger documentation

## How to see how it works
All endpoints except **GET /chat** you can test with swagger ui at https://api.grygoryz.ru/api.

**GET /chat** endpoint you can test with curl, for example:

`curl -N --cookie "sessionId=*your sessionId. take it from devtools*" -H "Accept:text/event-stream" https://api.grygoryz.ru/chat`


# socratic-bot

## Getting started

From the root of the repository:

```
$ docker build -f pyprojs/chatserver/Dockerfile -t socraticbot .
$ docker run -p 8000:8000 -e OPENAI_API_KEY="<insert your own openai key>" -e SOCRATIC_CHATSERVER_TOKEN="any string" socraticbot
```

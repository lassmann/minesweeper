# Minesweeper RESTful API

## Swagger
* `<url>/api-docs`

## URL:
* *  [swagger](https://deviget-minesweeper-api.herokuapp.com/api-docs/)

## Commands
* **installation:** `yarn install`
* **dev:** `yarn start:local` *build tsoa routes, swagger definitions and starts the server on development mode listening to file 

## Endpoints
* POST `/board`
With this you can create a new board
```
{
  "mines": 1,
  "rows": 3,
  "columns": 3
}
```
* GET `/board/${id}`
You can get all board with this endpoint

* POST `/board/play`
```
{
  "boardId": "b3c0f139-59b9-41f5-b69b-fefc6e788413",
  "x": 0,
  "y": 2,
  "instruction": "flag"
}
```
* Instruction could be `flag` or `reveal`
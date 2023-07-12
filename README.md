# Chat bot Engine

## Introduction

A simple server that uses decision tree based algorithm to perform different actions based on the user selection

## Getting started

To set up the server, download the [latest release](https://github.com/hisptz/chatbot-server/releases). Then create copy
the `.env.example` file to `.env` and change the required environment variables.

### Environment variables

- `DATABASE_URL`: The postgres database url for the server with the
  format `postgres://user:password@server_name:port/db_name`
- `POSTGRES_PASSWORD`: The database password (Only applies to docker compose setup)
- `POSTGRES_USER`: The database user (Only applies to docker compose setup)
- `PORT`: The port where the server should run on.
- `API_MOUNT_POINT`: The endpoint on which the server API will be accessible
- `API_KEY_ADMIN`: An API key that every request must set in the header as `x-api-key`

### Using node

This requires at least `Node` version `16.x`.

Run

```shell
 yarn install --prod
```

To get required dependencies and run the app using the command:

```shell
yarn start
```

### Using Docker (Recommended)

This requires at least `Docker Engine` version `23.0.5` and `Docker Compose Plugin` version `v2.15.1`.
To run the app using docker there are 2 ways:

#### Docker build

First, build the docker image

```shell
docker build . <image_name>:<app-version>
```

And then run the app container using:

```shell
docker run <image_name>:<app-version> --port 3000:<port>
```

Make sure the `DATABASE_URL` points to an existing Postgres database

### Docker compose

This is recommended if you don't have an external Postgres database. To run the app use:

```shell
docker compose up -d --build
```

## Development

You can set up the project by cloning into your local machine.

### Get dependencies

Get the required dependencies by running:

```shell
yarn install
```

### Environment

Copy `.env.example` to `.env` file and change the variables as required.

### Run in development mode

To run the server in development mode use:

```shell
yarn dev
```

### Build

To build the app run:

```shell
yarn build
```

This will create a zipped build in the `build` folder


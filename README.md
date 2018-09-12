# grpc-web-proxy
An api to proxy gRPC and a web ui for interacting with gRPC services

## Installation

```
npm i -g grpc-web-proxy
```

## Usage

### Startup

```
grpc-web-proxy
```
Will start the proxy on default port 8080

Execute with `---port <port>` or `-p <port>` command line argument to start on a custom port.
```
grpc-web-proxy --port 8082
```

### Requests

The gRPC proxy can be used with API testing tools like [Postman](https://www.getpostman.com/).

#### connect to gRPC service
```
POST 0.0.0.0:<port>/connect
```
with JSON body:
```
{
  "address": "<gRPC service address>:<gRPC service port>",
  "pathToProtoFile": "<absolute path to gRPC service definition proto file>",
  "servicePath": "[<package name>.]<service name>"
}
```
Creates gRPC client and responds with service info.

#### get connection info
```
GET 0.0.0.0:<port>/connection
```
Responds with service info if connection is established.

#### execute gRPC procedure
```
POST 0.0.0.0:<port>/execute
```
with JSON body:
```
{
	"methodName": "<method name>",
  "params": {
    // method params
  }
}
```

#### disconnect from gRPC service
```
POST 0.0.0.0:<port>/disconnect
```
Destroys gRPC client.

### Web UI

WIP. Not available yet.

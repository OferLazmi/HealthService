const http = require('http');
const WebSocketServer = require('websocket').server;

export interface IWebsocketClient {
    sendUTF(message: string): void;
}

export interface IWebSocketServerNotification {

    onMessageArrived(message: string, client: IWebsocketClient): void;
    onClientConnected(origin: string): void;
    onClientDisconnected(reasonCode: string, description: string): void;
}

export interface IWebsocketServer {
    broadcast(message: string): void;
}

export class WebSocketServerWrapper implements IWebsocketServer {

    private wsServer: any;

    constructor(
        private port: number,
        private notification: IWebSocketServerNotification) {
        
    }

    public listen() {
        const self = this;
        const server = http.createServer();
        server.listen(this.port);
        this.wsServer = new WebSocketServer({
            httpServer: server
        });

        this.wsServer.on('request', function (request) {
            const connection = request.accept(null, request.origin);
            if(self.notification) {
                self.notification.onClientConnected(request.origin);
            }
            connection.on('message', function (message) {
                if(self.notification) {
                    self.notification.onMessageArrived(message.utf8Data, connection);
                }
            });
            connection.on('close', function (reasonCode, description) {
                if(self.notification) {
                    self.notification.onClientDisconnected(reasonCode, description);
                }
            });
        });
    }

    public broadcast(message: string) {
        this.wsServer.broadcast(message);
    }
}
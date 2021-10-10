import { WebSocketWrapper } from './webSocketWrapper';

export interface ISocketCloseError {
  closeDescription: string;
  closeReasonCode: string;
}

export interface IWebsocketNotifications {
  onSocketOpened(socketWrapper: WebSocketWrapper): void;
  onSocketClosed(socketWrapper: WebSocketWrapper, error: ISocketCloseError): void;
  onSocketMessgae(socketWrapper: WebSocketWrapper, message: string): void;
  onSocketError(socketWrapper: WebSocketWrapper, error: string): void;
}

import { IWebsocketNotifications } from './iwebsocketNotifications';
import WebSocket from 'ws';
import { Utils } from '../utils';

// https://www.npmjs.com/package/ws
export class WebSocketWrapper {
  notifications: IWebsocketNotifications;
  url: string;
  websocket: any = null;
  messagesCount = 0;
  isClosedManualy = false;
  isSocketOpened = false;
  socketError: string = null;
  startTime: Date | undefined;
  endTime: Date | undefined;
  lastMessageTime: Date | undefined;

  constructor(
    url: string,
    notifications: IWebsocketNotifications) {
    if (url === undefined || url.length === 0) {
      throw new Error('url is null or empty');
    }

    this.url = url;
    this.notifications = notifications;
  }

  public open(): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      try {
        if (this.isOpen()) {
          return;
        }

        this.socketError = null;
        this.isSocketOpened = false;
        this.websocket = new WebSocket(this.url);
        this.registerWebSocketEvents();
        await this.waitForSocket();
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }

  public close() {
    this.isClosedManualy = true;
    if (this.websocket) {
      this.websocket.close();
    }
    this.websocket = null;
  }

  public isOpen(): boolean {
    return this.websocket != null;
  }

  public send(message: string) {
    if (this.websocket) {
      this.websocket.send(message);
    }
  }

  protected registerWebSocketEvents() {
    const self = this;
    // https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
    this.websocket.on('close', function (error) {
      self.endTime = new Date();
      this.socketError = error === 1000 ? null : error;
      self.notifications.onSocketClosed(self, {
        closeDescription: error,
        closeReasonCode: error,
      });

      self.websocket = null;

      if (!self.isClosedManualy) {
        setTimeout(() => {
          self.open();
        }, 10);
      }
    });

    this.websocket.on('error', function (error) {
      console.log("Connection Error: " + error.toString());
      self.endTime = new Date();
      this.socketError = error;
      self.notifications.onSocketError(self, error);
    });

    this.websocket.on('message', function (message) {
      self.lastMessageTime = new Date();
      self.messagesCount++;
      self.notifications.onSocketMessgae(self, message);
    });

    this.websocket.on('open', function (connection) {
      self.messagesCount = 0;
      self.startTime = new Date();
      self.endTime = undefined;
      self.isClosedManualy = false;
      self.isSocketOpened = true;
      self.notifications.onSocketOpened(self);
    });
  }

  public getCurrentTime(): string {
    const d = new Date();
    const dformat = [d.getHours(), d.getMinutes(), d.getSeconds()].join(':');

    return dformat;
  }

  private async waitForSocket(): Promise<void> {
    let isLoaded = this.isSocketOpened || this.socketError;
    while (!isLoaded) {
      await Utils.wait(100);
      isLoaded = this.isSocketOpened || this.socketError;
    }
  }
}

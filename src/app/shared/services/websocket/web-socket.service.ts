import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WebSocketSubject } from 'rxjs/webSocket';
import { WEB_SOCKET } from 'src/app/constants/web-socket';
import { delay, retry } from 'rxjs/operators';
import { CHANNEL } from 'src/app/constants/channel';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private webSocketSubject$!: WebSocketSubject<string>;
  private isConnected: boolean = false;

  constructor() {
    this.connect(WEB_SOCKET.PIE_SOCKET_URL);
  }

  public sendMessage(msg: string): void {
    if (this.isConnected) {
      this.webSocketSubject$.next(msg);
    } else {
      console.error('WebSocket is closed, message not sent');
    }
  }

  public listenMessage(): Observable<string> {
    return this.webSocketSubject$.asObservable();
  }

  private connect(
    url: string,
    reconnectInterval: number = 5000,
    reconnectAttempts: number = 2
  ): void {
    this.createWebSocketSubject(url);
    this.subscribeToSubject(reconnectInterval, reconnectAttempts);
  }

  public disconnect(): void {
    this.webSocketSubject$.complete();
  }

  private createWebSocketSubject(url: string): void {
    this.webSocketSubject$ = new WebSocketSubject({
      url: url,
      openObserver: {
        next: () => {
          this.isConnected = true;
        },
      },
      closeObserver: {
        next: () => {
          this.isConnected = false;
        },
      },
      serializer: (msg: string) =>
        JSON.stringify({
          channel: CHANNEL.WEB_SOCKET,
          msg: msg,
          timestamp: Date.now(),
        }),
    });
  }

  private subscribeToSubject(
    reconnectInterval: number,
    reconnectAttempts: number
  ): void {
    this.webSocketSubject$
      .pipe(retry(reconnectAttempts), delay(reconnectInterval))
      .subscribe({
        next: (msg) => console.log('message received: ' + msg),
        error: (err) => console.error(err),
        complete: () => console.log('complete'),
      });
  }

}

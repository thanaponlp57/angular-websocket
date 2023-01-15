import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { WebSocketService } from './shared/services/websocket/web-socket.service';

@Component({
  selector: 'app-root',
  template: ` <button (click)="sendMessage()">Send Message</button> `,
})
export class AppComponent {
  private messageSubscription: Subscription;

  constructor(private socketService: WebSocketService) {
    this.messageSubscription = this.socketService
      .listenMessage()
      .subscribe((msg) => {
        console.log('messageSubscription: ', msg);
      });
  }

  sendMessage(): void {
    this.socketService.sendMessage('Hello, server!');
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
    this.messageSubscription.unsubscribe();
  }
}

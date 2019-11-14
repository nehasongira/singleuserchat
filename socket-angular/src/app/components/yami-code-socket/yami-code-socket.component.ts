import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { environment } from '../../../environments/environment';
//import { SocketService } from '../../services/socket.service';
import { ToastrService } from 'ngx-toastr';
import { Message } from '../../model/message';
import { MessageGrp } from '../../model/MessageGrp';

@Component({
  selector: 'app-yami-code-socket',
  templateUrl: './yami-code-socket.component.html',
  styleUrls: ['./yami-code-socket.component.css']
})
export class YamiCodeSocketComponent implements OnInit {
  private serverUrl = environment.url + 'socket'
  isLoaded: boolean = false;
  isCustomSocketOpened = false;
  private stompClient;
  private form: FormGroup;
  private formgrp: FormGroup;
  private userForm: FormGroup;
  private userFormGrp: FormGroup;
  messages: Message[] = [];
  messagesgrp: MessageGrp[] = [];
  
  // constructor(private socketService: SocketService, private toastr: ToastrService
  // ) { }

  ngOnInit() {
    this.form = new FormGroup({
      message: new FormControl(null, [Validators.required])
    })
    this.formgrp = new FormGroup({
      message: new FormControl(null, [Validators.required])
    })
    this.userForm = new FormGroup({
      fromId: new FormControl(null, [Validators.required]),
      toId: new FormControl(null)
    })
    this.userFormGrp = new FormGroup({
      fromId: new FormControl(null, [Validators.required]),
      grpId: new FormControl(null)
    })
    this.initializeWebSocketConnection();
  }

  sendMessageUsingSocket() {
    if (this.form.valid) {
      let message: Message = { message: this.form.value.message, fromId: this.userForm.value.fromId, toId: this.userForm.value.toId };
      this.stompClient.send("/socket-subscriber/send/message", {}, JSON.stringify(message));
    }
  }
  sendMessageUsingSocketGrp() {
    if (this.formgrp.valid) {
      let message: MessageGrp = { message: this.formgrp.value.message, fromId: this.userFormGrp.value.fromId, grpId: this.userFormGrp.value.grpId };
      this.stompClient.send("/socket-subscriber/send/grpMessage", {}, JSON.stringify(message));
    }
  }

  // sendMessageUsingRest() {
  //   if (this.form.valid) {
  //     let message: Message = { message: this.form.value.message, fromId: this.userForm.value.fromId, toId: this.userForm.value.toId };
  //     this.socketService.post(message).subscribe(res => {
  //       console.log(res);
  //     })
  //   }
  // }

  initializeWebSocketConnection() {
    let ws = new SockJS(this.serverUrl);
    this.stompClient = Stomp.over(ws);
    let that = this;
    this.stompClient.connect({}, function (frame) {
      that.isLoaded = true;
     // that.openGlobalSocket()
    });
  }

  openGlobalSocket() {
    if (this.isLoaded) {
      this.isCustomSocketOpened = true;
      this.stompClient.subscribe("/socket-publisher/"+this.userFormGrp.value.grpId, (message) => {
        this.handleResultGrp(message);
    });
  }
  this.isCustomSocketOpened = false;
  }

  openSocket() {
    if (this.isLoaded) {
      this.isCustomSocketOpened = true;
      this.stompClient.subscribe("/socket-publisher/"+this.userForm.value.fromId, (message) => {
        this.handleResult(message);
      });
    }
    this.isCustomSocketOpened = false;
  }

  handleResult(message){
    if (message.body) {
      let messageResult: Message = JSON.parse(message.body);
      console.log(messageResult);
      this.messages.push(messageResult);
      // this.toastr.success("new message recieved", null, {
      //   'timeOut': 3000
      // });
    }
  }
  handleResultGrp(message){
    if (message.body) {
      let messageResult: MessageGrp = JSON.parse(message.body);
      console.log(messageResult);
      this.messagesgrp.push(messageResult);
      // this.toastr.success("new message recieved", null, {
      //   'timeOut': 3000
      // });
    }
  }

}

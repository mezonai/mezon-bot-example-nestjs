import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Events, ChannelMessage, MezonClient } from 'mezon-sdk';
import { MezonClientService } from 'src/mezon/client.service';

import { messagesBusy } from '../constants/text';
import { BOT_ID } from '../constants/config';

@Injectable()
export class ChannelMessageEventHandler {
  private client: MezonClient;
  constructor(private clientService: MezonClientService) {
    this.client = clientService.getClient();
  }

  getRandomMessage(): string {
    const randomIndex = Math.floor(Math.random() * messagesBusy.length);
    return messagesBusy[randomIndex];
  }

  @OnEvent(Events.ChannelMessage)
  async handleMessage(message: ChannelMessage) {
    try {
      // Ignore messages from the bot itself
      if (message.sender_id && message.sender_id === BOT_ID) {
        return;
      }
      // reply mentioned only
      if ((!message.mentions || !message.mentions.length) && message.mentions?.findIndex(m => m.user_id == BOT_ID?.toString()) === -1) {
        return;
      }

      this.client.channels
        .fetch(message.channel_id)
        .then((channel) => {
          channel.messages.fetch(message.id).then((msg) => {
            msg.reply({
              t: this.getRandomMessage(),  
            })  
          })
        })
    } catch (error) {
      console.log(error);
    }
  }
}

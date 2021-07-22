import axios from 'axios';
import TelegramBot from 'node-telegram-bot-api';
import {config} from './config';
import {DiscordWebhookResponse} from './types';

const {PubSub} = require('@google-cloud/pubsub');

export const pubSubClient = new PubSub();

export const postToDiscord = (
  response: DiscordWebhookResponse | undefined,
  discord_webhook_url: string
) => {
  return axios.post(discord_webhook_url, response);
};

export const constructDiscordMessageFromTelegramMessage = (
  msg: TelegramBot.Message
): DiscordWebhookResponse => {
  let content = '';
  let text = '';
  if (msg.caption) {
    text = msg.caption as string;
  }
  if (msg.text) {
    text = msg.text as string;
  }
  // This is a reply message
  if (msg.reply_to_message) {
    const quotedMessage = `**${msg.reply_to_message.from?.username}**: ${msg.reply_to_message.text}`;
    if (quotedMessage) {
      content = `${quotedMessage.replace(/^/gm, '> ')}\n${text}`;
    }
  } else {
    content = text;
  }

  let image;
  if (msg.photo) {
    // get largest image for discord (since discord does it's own processing anyway)
    const photo = msg.photo?.sort((_x, _y) => {
      return (_y.file_size as number) - (_x.file_size as number);
    })[0];
    image = {
      url: `${config.base_url}/fileFromFileId/${photo?.file_id}.jpeg`,
    };
  }
  const webhookResponse: DiscordWebhookResponse = {
    username: getWebhookUsernameFromUsername(msg.from?.username as string),
    embeds: [
      {
        description: content as string,
        image: image,
      },
    ],
  };

  return webhookResponse;
};

export const publishTelegramMessageToPubSub = (msg: TelegramBot.Message) => {
  // Publishes the message as a string, e.g. "Hello, world!" or JSON.stringify(someObject)
  const dataBuffer = Buffer.from(JSON.stringify(msg));
  const message = {
    data: dataBuffer,
    orderingKey: 'msg.date',
  };
  return pubSubClient
    .topic(config.google.interaction_topic, {enableMessageOrdering: true})
    .publishMessage(message);
};

export const getWebhookUsernameFromUsername = (username: string) => {
  return `${username} (via Meeple Market)`;
};

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
  const webhookResponse: DiscordWebhookResponse = {
    username: msg.from?.username as string,
    content: msg.text as string,
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

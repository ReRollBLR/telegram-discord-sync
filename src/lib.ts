import axios from 'axios';
import TelegramBot from 'node-telegram-bot-api';
import {bot} from '.';
import {DiscordWebhookResponse} from './types';
import FormData from 'form-data';

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

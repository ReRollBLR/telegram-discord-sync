import express from 'express';
import FormData from 'form-data';
import TelegramBot from 'node-telegram-bot-api';
import {config} from './config';
import {constructDiscordMessageFromTelegramMessage, postToDiscord} from './lib';

export const bot = new TelegramBot(config.telegram.bot_token);
bot.setWebHook(
  `${config.base_url}/telegram/webhook/${config.telegram.webhook_token}`
);

console.log(
  `${config.base_url}/telegram/webhook/${config.telegram.webhook_token}`
);
const app = express();

app.post(`/telegram/webhook/${config.telegram.webhook_token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.status(200).send('ok!');
});

bot.on('message', async msg => {
  console.log(JSON.stringify(msg));
  if (!msg.text && !msg.photo) {
    return;
  }
  const discordWebhookUrls =
    config.mapping[msg.chat.id.toString() as '-1001440666371'];

  const discordPromises: any[] = [];
  discordWebhookUrls.forEach(discordWebhookUrl => {
    if (msg.text) {
      const discordMessaage = constructDiscordMessageFromTelegramMessage(msg);
      discordPromises.push(postToDiscord(discordMessaage, discordWebhookUrl));
    }
    if (msg.photo) {
      discordPromises.push(
        new Promise((resolve, reject) => {
          const form = new FormData();
          form.append('username', msg.from?.username);
          if (msg.caption) {
            form.append('content', msg.caption);
          }
          form.append(
            'file',
            bot.getFileStream(msg.photo?.[1]?.file_id as string),
            {
              filename: 'bar.jpg',
              contentType: 'image/jpeg',
              knownLength: msg.photo?.[1]?.file_size,
            }
          );
          form.submit(discordWebhookUrl, (error, response) => {
            if (error) reject(error);
            else resolve(response);
          });
        })
      );
    }
  });
  await Promise.all(discordPromises);
});

exports.telegramsync = app;

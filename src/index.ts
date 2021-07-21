import express from 'express';
import FormData from 'form-data';
import TelegramBot from 'node-telegram-bot-api';
import {config} from './config';
import {
  constructDiscordMessageFromTelegramMessage,
  postToDiscord,
  publishTelegramMessageToPubSub,
} from './lib';

export const bot = new TelegramBot(config.telegram.bot_token);
bot.setWebHook(
  `${config.base_url}/telegram/webhook/${config.telegram.webhook_token}`
);

console.log(
  `${config.base_url}/telegram/webhook/${config.telegram.webhook_token}`
);
const app = express();

app.post(
  `/telegram/webhook/${config.telegram.webhook_token}`,
  async (req, res) => {
    const update = req.body;
    if (!update.message) {
      res.status(200).send('ok');
      return;
    }

    const msg = update.message;
    if (!msg.text && !msg.photo) {
      res.status(200).send('ok');
      return;
    }
    await publishTelegramMessageToPubSub(msg);

    res.status(200).send('ok!');
  }
);

app.post('/telegram-subscription', async (req, res) => {
  const base64 = req.body.message.data;
  const decodedString = Buffer.from(base64, 'base64').toString();
  const msg = JSON.parse(decodedString) as TelegramBot.Message;

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
          form.append('username', `${msg.from?.username} (Meeple Market)`);
          if (msg.caption) {
            form.append('content', msg.caption);
          }
          // get largest image for discord (since discord does it's own processing anyway)
          const photo = msg.photo?.sort((_x, _y) => {
            return (_y.file_size as number) - (_x.file_size as number);
          })[0];
          form.append('file', bot.getFileStream(photo?.file_id as string), {
            filename: 'bar.jpg',
            contentType: 'image/jpeg',
            knownLength: photo?.file_size,
          });
          form.submit(discordWebhookUrl, (error, response) => {
            if (error) reject(error);
            else resolve(response);
          });
        })
      );
    }
  });
  await Promise.all(discordPromises);
  res.send();
});

exports.telegramsync = app;

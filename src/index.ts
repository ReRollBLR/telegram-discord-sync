import express from 'express';
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

    if (!config.mapping[msg.chat.id.toString()]) {
      console.log(`Don't recognize chat id :${msg.chat.id.toString()}`);
      res.status(200).send('ok');
      return;
    }

    await publishTelegramMessageToPubSub(msg);

    res.status(200).send('ok');
  }
);

app.post('/telegram-subscription', async (req, res) => {
  const base64 = req.body.message.data;
  const decodedString = Buffer.from(base64, 'base64').toString();
  const msg = JSON.parse(decodedString) as TelegramBot.Message;

  const discordWebhookUrls = config.mapping[msg.chat.id.toString()];

  const discordPromises: any[] = [];
  discordWebhookUrls.forEach(discordWebhookUrl => {
    if (msg.text || msg.photo) {
      const discordMessaage = constructDiscordMessageFromTelegramMessage(msg);
      discordPromises.push(postToDiscord(discordMessaage, discordWebhookUrl));
    }
  });
  await Promise.all(discordPromises);
  res.send();
});

app.get('/fileFromFileId/:fileId.jpeg', (req, res) => {
  if (!req.params.fileId) {
    res.status(400).send('You need to provide a file ID');
  }
  res.contentType('image/jpeg');
  const buffers: any[] = [];
  const stream = bot.getFileStream(req.params.fileId as string);
  stream.on('data', data => buffers.push(data));
  stream.on('end', () => {
    res.send(Buffer.concat(buffers));
  });
});

app.get('/', (req, res) => {
  res.send("We're running!");
});

exports.telegramsync = app;

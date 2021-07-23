import TelegramBot from 'node-telegram-bot-api';

export const getUsernameFromTelegramUser = (user: TelegramBot.User) => {
  let _name = user.first_name;
  if (user.last_name) {
    _name = `${_name} ${user.last_name}`;
  }
  if (user.username) {
    _name = user.username;
  }
  return _name;
};

export const getEscapedTextFromMessage = (msg: TelegramBot.Message) => {
  let _text = '';
  if (msg.caption) {
    _text = msg.caption as string;
  }
  if (msg.text) {
    _text = msg.text as string;
  }
  return _text;
};

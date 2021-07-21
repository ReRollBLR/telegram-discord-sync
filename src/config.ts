export const config: {
  telegram: {
    bot_token: string;
    webhook_token: string;
  };
  google: {
    interaction_topic: string;
  };
  mapping: {
    [telegram_chat_id: string]: string[];
  };
  base_url: string;
} = JSON.parse(
  Buffer.from(process.env.CONFIG || '', 'base64').toString('utf-8') || '{}'
);

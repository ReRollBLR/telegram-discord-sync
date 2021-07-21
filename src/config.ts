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
} = JSON.parse(process.env.CONFIG || '{}');

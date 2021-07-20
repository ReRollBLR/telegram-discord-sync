export const config = {
  telegram: {
    bot_token: process.env.TELEGRAM_BOT_TOKEN as string,
    webhook_token: process.env.TELEGRAM_WEBHOOK_TOKEN as string,
  },
  mapping: {
    '-1001440666371': [process.env.DISCORD_WEBHOOK_URL],
  },
  base_url: process.env.BASE_URL,
};

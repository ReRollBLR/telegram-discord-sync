export type DiscordEmbed = {
  title?: string;
  url?: string;
  description: string;
  color?: number;
  timestamp?: string;
  author: {
    name: string;
    icon_url: string;
  };
  image?: {
    url: string;
  };
  fields?: {
    name: string;
    value: string;
    inline?: boolean;
  }[];
};

export type DiscordWebhookResponse = {
  content?: string;
  username: string;
  file?: any;
  avatar_url?: string;
  embeds?: DiscordEmbed[];
};

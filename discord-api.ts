import { REST } from '@discordjs/rest';
import { Routes, APIUser } from 'discord-api-types/v10';
import { DISCORD_API_TOKEN } from './env';

export default function createDiscordApi() {
  const discordClient = new REST({ version: '10' }).setToken(DISCORD_API_TOKEN);

  return {
    discordClient,

    async getUser(userId: string) {
      const user = await discordClient.get(Routes.user(userId)) as APIUser;
      return {
        id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        avatarUrl: user.avatar,
      };
    },
  };
}

export type DiscordApi = ReturnType<typeof createDiscordApi>;

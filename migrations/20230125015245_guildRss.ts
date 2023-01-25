import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema
    .createTable('guildRss', table => {
      table
        .uuid('id')
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'))
        .primary();

      table
        .text('guildId')
        .notNullable()
        .references('id')
        .inTable('discordGuilds');

      table
        .text('url')
        .notNullable();

      table
        .text('lastPostId')
        .notNullable();

      table
        .text('destination')
        .notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema
    .dropTableIfExists('guildRss');
}

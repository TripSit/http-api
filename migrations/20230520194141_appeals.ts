import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('appeals', table => {
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
      .uuid('userId')
      .notNullable()
      .references('id')
      .inTable('users');

    table
      .text('reason')
      .notNullable();

    table
      .text('solution')
      .notNullable();

    table
      .text('future')
      .notNullable();

    table
      .text('extra')
      .nullable();

    table
      .enum('status', [
        'OPEN', // Default status for new tickets
        'ACCEPTED',
        'DENIED',
      ], {
        useNative: true,
        enumName: 'appeal_status',
      })
      .notNullable();

    table
      .timestamp('createdAt')
      .notNullable()
      .defaultTo(knex.fn.now());

    table
      .timestamp('remindedAt')
      .nullable();

    table
      .timestamp('decidedAt')
      .nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema
    .dropTableIfExists('appeals');

  await knex.raw('DROP TYPE IF EXISTS "appeal_status"');
}

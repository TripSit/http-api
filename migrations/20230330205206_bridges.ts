import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // REMEMBER TO ADD A CHANGE TO USERS TO ADD LASTFM FOR ANTEAC
  await knex.schema.alterTable('users', table => {
    table
      .text('lastfmUsername')
      .nullable();
  });

  await knex.schema.createTable('bridges', table => {
    table
      .uuid('id')
      .notNullable()
      .defaultTo(knex.raw('uuid_generate_v4()'))
      .primary();

    table
      .text('internal_channel')
      .notNullable();

    table
      .text('internal_webhook')
      .notNullable();

    table
      .enum('status', [
        'ACTIVE',
        'PAUSED',
      ], {
        useNative: true,
        enumName: 'bridge_status',
      })
      .notNullable()
      .defaultTo('ACTIVE');

    table
      .text('external_guild')
      .notNullable();

    table
      .text('external_channel')
      .notNullable();

    table
      .text('external_webhook')
      .nullable();

    // We can only bridge the channel with a single channel on an external guild
    table.unique(['internal_channel', 'external_guild']);
  });
}

export async function down(knex: Knex): Promise<void> {
  // await knex.schema.alterTable('users', table => {
  //   table.dropColumn('lastfmUsername');
  // });

  await knex.schema.dropTableIfExists('bridges');

  await knex.raw(`
    DROP TYPE IF EXISTS bridge_status
  `);
}

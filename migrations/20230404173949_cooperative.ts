import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', table => {
    table
      .boolean('partner')
      .notNullable()
      .defaultTo(false)
      .alter();
    table
      .boolean('supporter')
      .notNullable()
      .defaultTo(false)
      .alter();
  });

  await knex.schema.alterTable('discordGuilds', table => {
    table
      .boolean('partner')
      .defaultTo(false)
      .alter();
    table
      .boolean('supporter')
      .defaultTo(false)
      .alter();
    table
      .text('coop_mod_room_id')
      .nullable();
    table
      .text('mod_room_id')
      .nullable();
    table
      .text('mod_log_room_id')
      .nullable();
    table
      .text('mod_helpdesk_room_id')
      .nullable();
    table
      .text('mod_role_id')
      .nullable();
    table
      .text('team_role_id')
      .nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', table => {
    table
      .boolean('partner')
      .nullable()
      .defaultTo(true)
      .alter();
    table
      .boolean('supporter')
      .nullable()
      .defaultTo(true)
      .alter();
  });

  await knex.schema.alterTable('discordGuilds', table => {
    table
      .boolean('partner')
      .defaultTo(true)
      .alter();
    table
      .boolean('supporter')
      .defaultTo(true)
      .alter();
  });

  if (await knex.schema.hasColumn('discordGuilds', 'coop_mod_room_id') === true) {
    await knex.schema.alterTable('discordGuilds', table => {
      table.dropColumn('coop_mod_room_id');
    });
  }

  if (await knex.schema.hasColumn('discordGuilds', 'mod_room_id') === true) {
    await knex.schema.alterTable('discordGuilds', table => {
      table.dropColumn('mod_room_id');
    });
  }

  if (await knex.schema.hasColumn('discordGuilds', 'mod_log_room_id') === true) {
    await knex.schema.alterTable('discordGuilds', table => {
      table.dropColumn('mod_log_room_id');
    });
  }

  if (await knex.schema.hasColumn('discordGuilds', 'mod_role_id') === true) {
    await knex.schema.alterTable('discordGuilds', table => {
      table.dropColumn('mod_role_id');
    });
  }

  if (await knex.schema.hasColumn('discordGuilds', 'team_role_id') === true) {
    await knex.schema.alterTable('discordGuilds', table => {
      table.dropColumn('team_role_id');
    });
  }

  if (await knex.schema.hasColumn('discordGuilds', 'mod_helpdesk_room_id') === true) {
    await knex.schema.alterTable('discordGuilds', table => {
      table.dropColumn('mod_helpdesk_room_id');
    });
  }
}

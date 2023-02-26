import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', table => {
    table.text('modThreadId').nullable();
  });

  await knex.schema.alterTable('userActions', table => {
    table
      .text('description')
      .nullable()
      .alter();

    table.text('internalNote')
      .notNullable()
      .alter();
    // .defaultTo('No reason given');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', table => {
    table.dropColumn('modThreadId');
  });
  await knex.schema.alterTable('userActions', table => {
    table
      .text('description')
      .notNullable()
      .alter();

    table.text('internalNote')
      .nullable()
      .alter();
  });
}

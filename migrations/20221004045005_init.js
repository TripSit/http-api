'use strict';

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
exports.up = async function up(knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  await knex.schema
    .createTable('users', table => {
      table
        .uuid('id')
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'))
        .primary();

      table
        .string('email', 320)
        .unique();

      table
        .text('passwordHash');

      table
        .text('discordAccountName')
        .unique();

      table
        .text('ircAccountName')
        .unique();

      table
        .text('matrixAccountName')
        .unique();

      table
        .text('timezone');

      table
        .timestamp('birthday');

      table
        .integer('karmaGiven')
        .unsigned()
        .notNullable()
        .defaultTo(0);

      table
        .integer('karmaReceived')
        .unsigned()
        .notNullable()
        .defaultTo(0);

      table
        .integer('sparklePoints')
        .unsigned()
        .notNullable()
        .defaultTo(0);

      table
        .boolean('discordBotBan')
        .notNullable()
        .defaultTo(false);

      table
        .boolean('ticketBan')
        .notNullable()
        .defaultTo(false);

      table
        .timestamp('lastSeen')
        .notNullable()
        .defaultTo(knex.fn.now());

      table
        .timestamp('joinedAt')
        .notNullable()
        .defaultTo(knex.fn.now());
    })
    .createTable('drugs', table => {
      table
        .uuid('id')
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'))
        .primary();

      table.text('summary');
      table.text('psychonautWikiUrl');
      table.text('errowidExperiencesUrl');

      table
        .uuid('lastUpdatedBy')
        .notNullable()
        .references('id')
        .inTable('users');

      table
        .timestamp('updatedAt')
        .notNullable()
        .defaultTo(knex.fn.now());

      table
        .timestamp('createdAt')
        .notNullable()
        .defaultTo(knex.fn.now());
    })
    .createTable('drugNames', table => {
      table
        .uuid('id')
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'))
        .primary();

      table
        .uuid('drugId')
        .notNullable()
        .references('id')
        .inTable('drugs')
        .onDelete('CASCADE');

      table
        .text('name')
        .notNullable();

      // TODO: Check constraint
      table
        .boolean('isDefault')
        .notNullable()
        .defaultTo(false);

      table
        .enum('type', [
          'COMMON',
          'SUBSTITUTIVE',
          'SYSTEMATIC',
        ], {
          useNative: true,
          enumName: 'drug_name_type',
        })
        .notNullable()
        .defaultTo('COMMON');
    })
    .createTable('drugArticles', table => {
      table
        .uuid('id')
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'))
        .primary();

      table
        .uuid('drugId')
        .notNullable()
        .references('id')
        .inTable('drugs')
        .onDelete('CASCADE');

      table
        .string('url', 2048)
        .notNullable();

      table
        .text('title')
        .notNullable();

      table.text('description');
      table.timestamp('publishedAt');

      table
        .boolean('deleted')
        .notNullable()
        .defaultTo(false);

      table
        .uuid('postedById')
        .notNullable()
        .references('id')
        .inTable('users');

      table
        .timestamp('createdAt')
        .notNullable()
        .defaultTo(knex.fn.now());
    })
    .createTable('drugVariants', table => {
      table
        .uuid('id')
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'))
        .primary();

      table
        .uuid('drugId')
        .notNullable()
        .references('id')
        .inTable('drugs')
        .onDelete('CASCADE');

      table.text('name');
      table.text('description');

      // TODO: Check constraint
      table
        .boolean('default')
        .notNullable()
        .defaultTo(false);

      table
        .uuid('lastUpdatedById')
        .notNullable()
        .references('id')
        .inTable('users');

      table
        .timestamp('updatedAt')
        .notNullable()
        .defaultTo(knex.fn.now());

      table
        .timestamp('createdAt')
        .notNullable()
        .defaultTo(knex.fn.now());
    })
    .createTable('drugVariantRoas', table => {
      table
        .uuid('id')
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'))
        .primary();

      table
        .uuid('drugVariantId')
        .notNullable()
        .references('id')
        .inTable('drugVariants')
        .onDelete('CASCADE');

      table
        .enum('route', [
          'ORAL',
          'INSUFFLATED',
          'INHALED',
          'TOPICAL',
          'SUBLINGUAL',
          'BUCCAL',
          'RECTAL',
          'INTRAMUSCULAR',
          'INTRAVENOUS',
          'SUBCUTANIOUS',
          'TRANSDERMAL',
        ], {
          useNative: true,
          enumName: 'drug_roa',
        })
        .notNullable();

      table.float('doseThreshold');
      table.float('doseLight');
      table.float('doseCommon');
      table.float('doseStrong');
      table.float('doseHeavy');
      table.text('doseWarning');

      table.float('durationTotalMin');
      table.float('durationTotalMax');
      table.float('durationOnsetMin');
      table.float('durationOnsetMax');
      table.float('durationComeupMin');
      table.float('durationComeupMax');
      table.float('durationPeakMin');
      table.float('durationPeakMax');
      table.float('durationOffsetMin');
      table.float('durationOffsetMax');
      table.float('durationAfterEffectsMin');
      table.float('durationAfterEffectsMax');
    })
    .createTable('userTickets', table => {
      table
        .uuid('id')
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'))
        .primary();

      table
        .uuid('userId')
        .notNullable()
        .references('id')
        .inTable('users');

      table
        .text('description')
        .notNullable();

      table
        .text('threadId')
        .notNullable();

      table
        .enum('type', [
          'APPEAL',
          'TRIPSIT',
          'TECH',
          'FEEDBACK',
        ], {
          useNative: true,
          enumName: 'ticket_type',
        });

      table
        .enum('status', [
          'OPEN',
          'CLOSED',
          'BLOCKED',
          'PAUSED',
          'RESOLVED',
        ], {
          useNative: true,
          enumName: 'ticket_status',
        })
        .notNullable();

      table
        .text('firstMessageId')
        .notNullable();

      table
        .timestamp('closedAt');

      table
        .timestamp('createdAt')
        .notNullable()
        .defaultTo(knex.fn.now());
    })
    .createTable('userExperience', table => {
      table
        .uuid('id')
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'))
        .primary();

      table
        .uuid('userId')
        .notNullable()
        .references('id')
        .inTable('users');

      table
        .enum('type', [
          'TOTAL',
          'GENERAL',
          'TRIPSITTER',
          'DEVELOPER',
          'TEAM',
          'IGNORED',
        ], {
          useNative: true,
          enumName: 'experience_type',
        });

      table
        .integer('level')
        .unsigned()
        .notNullable();

      table
        .integer('levelPoints')
        .unsigned()
        .notNullable();

      table
        .integer('totalPoints')
        .unsigned()
        .notNullable();

      table
        .timestamp('lastMessageAt');

      table
        .text('lastMessageChannel');

      table
        .boolean('mee6Converted')
        .notNullable()
        .defaultTo(false);

      table
        .timestamp('createdAt')
        .notNullable()
        .defaultTo(knex.fn.now());
    })
    .createTable('userModHistory', table => {
      table
        .uuid('id')
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'))
        .primary();

      table
        .uuid('actorId')
        .notNullable()
        .references('id')
        .inTable('users');

      table
        .enum('command', [
          'BAN',
          'UNBAN',
          'UNDERBAN',
          'UNUNDERBAN',
          'WARN',
          'NOTE',
          'TIMEOUT',
          'UNTIMEOUT',
          'KICK',
          'INFO',
          'REPORT',
        ], {
          useNative: true,
          enumName: 'command_type',
        })
        .notNullable();

      table
        .uuid('targetId')
        .notNullable()
        .references('id')
        .inTable('users');

      table
        .integer('duration');

      table
        .text('pubReason');

      table
        .text('privReason');

      table
        .timestamp('closedAt');

      table
        .timestamp('createdAt')
        .notNullable()
        .defaultTo(knex.fn.now());
    })
    .createTable('userDrugHistory', table => {
      table
        .uuid('id')
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'))
        .primary();

      table
        .uuid('userId')
        .notNullable()
        .references('id')
        .inTable('users');

      table
        .enum('route', [
          'ORAL',
          'INSUFFLATED',
          'INHALED',
          'TOPICAL',
          'SUBLINGUAL',
          'BUCCAL',
          'RECTAL',
          'INTRAMUSCULAR',
          'INTRAVENOUS',
          'SUBCUTANIOUS',
          'TRANSDERMAL',
        ], {
          useNative: true,
          existingType: true,
          enumName: 'drug_roa',
        })
        .notNullable();

      table
        .float('dose')
        .notNullable();

      table
        .uuid('drugId')
        .notNullable()
        .references('id')
        .inTable('drugs');

      table
        .enum('units', [
          'MG',
          'ML',
          'µG',
          'G',
          'OZ',
          'FLOZ',
          'TABS',
          'CAPS',
          'DROPS',
          'PILLS',
          'PATCHES',
          'SPRAYS',
        ], {
          useNative: true,
          enumName: 'drug_unit',
        })
        .notNullable();

      table
        .timestamp('doseDate')
        .notNullable();
    })
    .createTable('discordGuilds', table => {
      table
        .text('id')
        .notNullable()
        .unique()
        .primary();

      table
        .timestamp('joinedAt')
        .notNullable()
        .defaultTo(knex.fn.now());

      table
        .boolean('discordBotBan')
        .notNullable()
        .defaultTo(false);

      table
        .timestamp('dramaDate');

      table
        .text('dramaReason');
    })
    .createTable('reactionRoles', table => {
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
        .text('name')
        .notNullable();

      table
        .text('channelId')
        .notNullable();

      table
        .text('messageId')
        .notNullable();

      table
        .text('reactionId')
        .notNullable();

      table
        .text('roleId')
        .notNullable();
    });
};

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
exports.down = async function down(knex) {
  await knex.schema
    .dropTableIfExists('drugVariantRoas')
    .dropTableIfExists('drugVariants')
    .dropTableIfExists('drugArticles')
    .dropTableIfExists('drugNames')
    .dropTableIfExists('userModHistory')
    .dropTableIfExists('userDrugHistory')
    .dropTableIfExists('drugs')
    .dropTableIfExists('userExperience')
    .dropTableIfExists('userTickets')
    .dropTableIfExists('users')
    .dropTableIfExists('reactionRoles')
    .dropTableIfExists('discordGuilds');

  await knex.raw('DROP TYPE IF EXISTS "drug_unit"');
  await knex.raw('DROP TYPE IF EXISTS "command_type"');
  await knex.raw('DROP TYPE IF EXISTS "drug_roa"');
  await knex.raw('DROP TYPE IF EXISTS "drug_name_type"');
  await knex.raw('DROP TYPE IF EXISTS "experience_type"');
  await knex.raw('DROP TYPE IF EXISTS "ticket_type"');
  await knex.raw('DROP TYPE IF EXISTS "ticket_status"');

  await knex.raw('DROP EXTENSION IF EXISTS "uuid-ossp"');
};

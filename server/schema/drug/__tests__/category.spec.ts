import assert from 'node:assert';
import type { ApolloServer } from '@apollo/server';
import gql from 'graphql-tag';
import type { Knex } from 'knex';
import createTestKnex from '../../../../tests/test-knex';
import createTestServer, { createTestContext } from '../../../../tests/test-server';
import createDiscordApi, { DiscordApi } from '../../../../discord-api';
import { uuidPattern } from '../../../../tests/patterns';
import type { DrugCategoryRecord, DrugNameRecord } from '../../../../db/drug';

let server: ApolloServer;
let knex: Knex;
let discordApi: DiscordApi;
let lsdId: string;
beforeAll(async () => {
  knex = createTestKnex();
  server = createTestServer();
  discordApi = createDiscordApi();
  lsdId = await knex<DrugNameRecord>('drugNames')
    .where('name', 'LSD')
    .select('drugId')
    .first()
    .then((record) => record!.drugId);
});

afterAll(async () => knex.destroy());

describe('Query', () => {
  let testDrugCategories: {
    stimulant: DrugCategoryRecord;
    arylcyclohexylamine: DrugCategoryRecord;
    psychedelic: DrugCategoryRecord;
  };
  beforeAll(async () => {
    testDrugCategories = await Promise.all([
      {
        name: 'Stimulant',
        type: 'PSYCHOACTIVE',
      },
      {
        name: 'Arylcyclohexylamine',
        type: 'CHEMICAL',
      },
      {
        name: 'Psychedelic',
        type: 'PSYCHOACTIVE',
      },
    ]
      .map((category) => knex('drugCategories')
        .insert(category)
        .returning('*')))
      .then((records) => records.map(([record]) => record))
      .then(([stimulant, arylcyclohexylamine, psychedelic]) => ({
        stimulant,
        arylcyclohexylamine,
        psychedelic,
      }));
  });

  afterAll(async () => knex('drugCategories').del());

  describe('drugCategories', () => {
    test('With no parameters returns all drug categories', async () => {
      const { body } = await server.executeOperation({
        query: gql`
          query AllDrugCategories {
            drugCategories {
              id
              name
              type
              createdAt
            }
          }
        `,
      }, {
        contextValue: await createTestContext(knex, discordApi),
      });

      assert(body.kind === 'single');
      expect(body.singleResult.errors).toBeUndefined();
      expect(body.singleResult.data).toEqual({
        drugCategories: [
          testDrugCategories.arylcyclohexylamine,
          testDrugCategories.psychedelic,
          testDrugCategories.stimulant,
        ],
      });
    });

    test('Can get drug category by ID', async () => {
      const { body } = await server.executeOperation({
        query: gql`
          query DrugCategoryById($id: UUID!) {
            drugCategories(id: $id) {
              id
              name
              type
              createdAt
            }
          }
        `,
        variables: {
          id: testDrugCategories.arylcyclohexylamine.id,
        },
      }, {
        contextValue: await createTestContext(knex, discordApi),
      });

      assert(body.kind === 'single');
      expect(body.singleResult.errors).toBeUndefined();
      expect(body.singleResult.data).toEqual({
        drugCategories: [testDrugCategories.arylcyclohexylamine],
      });
    });

    test('Can get drug category by name', async () => {
      const { body } = await server.executeOperation({
        query: gql`
          query DrugCategoryByName($name: String!) {
            drugCategories(name: $name) {
              id
              name
              type
              createdAt
            }
          }
        `,
        variables: {
          name: 'ULanT',
        },
      }, {
        contextValue: await createTestContext(knex, discordApi),
      });

      assert(body.kind === 'single');
      expect(body.singleResult.errors).toBeUndefined();
      expect(body.singleResult.data).toEqual({
        drugCategories: [testDrugCategories.stimulant],
      });
    });

    test('Can get drug category by type', async () => {
      const { body } = await server.executeOperation({
        query: gql`
          query DrugCategoryByType($type: DrugCategoryType!) {
            drugCategories(type: $type) {
              id
              name
              type
              createdAt
            }
          }
        `,
        variables: {
          type: 'PSYCHOACTIVE',
        },
      }, {
        contextValue: await createTestContext(knex, discordApi),
      });

      assert(body.kind === 'single');
      expect(body.singleResult.errors).toBeUndefined();
      expect(body.singleResult.data).toEqual({
        drugCategories: [
          testDrugCategories.psychedelic,
          testDrugCategories.stimulant,
        ],
      });
    });
  });
});

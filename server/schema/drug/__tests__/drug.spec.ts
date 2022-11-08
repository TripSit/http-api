import assert from 'node:assert';
import type { ApolloServer } from '@apollo/server';
import gql from 'graphql-tag';
import type { Knex } from 'knex';
import createTestKnex from '../../../../tests/test-knex';
import createTestServer, { createTestContext } from '../../../../tests/test-server';
// import { uuidPattern } from '../../../../tests/patterns';
import type { DrugNameRecord } from '../../../../db/drug';

let server: ApolloServer;
let knex: Knex;
let lsdId: string;
beforeAll(async () => {
  knex = createTestKnex();
  server = createTestServer();
  lsdId = await knex<DrugNameRecord>('drugNames')
    .where('name', 'LSD')
    .select('drugId')
    .first()
    .then((record) => record!.drugId);
});

afterAll(async () => knex.destroy());

describe('Query', () => {
  describe('drugs', () => {
    test('Can get a drug by ID', async () => {
      const { body } = await server.executeOperation({
        query: gql`
          query DrugById($id: UUID!) {
            drugs(id: $id) {
              id
              name
            }
          }
        `,
        variables: { id: lsdId },
      }, {
        contextValue: await createTestContext(knex),
      });

      assert(body.kind === 'single');
      expect(body.singleResult.errors).toBeUndefined();
      expect(body.singleResult.data).toEqual({
        drugs: [{
          id: lsdId,
          name: 'LSD',
        }],
      });
    });

    test('Can get a drug by name case insensitivly', async () => {
      const { body } = await server.executeOperation({
        query: gql`
          query DrugsByName($name: String!) {
            drugs(name: $name) {
              name
            }
          }
        `,
        variables: { name: 'fLuoRoKETaMine' },
      }, {
        contextValue: await createTestContext(knex),
      });

      assert(body.kind === 'single');
      expect(body.singleResult.errors).toBeUndefined();
      expect(body.singleResult.data).toEqual({
        drugs: [
          { name: '2-FDCK' },
          { name: '2-FDCK' },
        ],
      });
    });

    test('Limit and offset', async () => {
      interface DrugData {
        id: string;
        name: string;
      }

      const contextValue = await createTestContext(knex);
      const query = gql`
        query DrugOffsetLimit($offset: UnsignedInt, $limit: UnsignedInt!) {
          drugs(offset: $offset, limit: $limit) {
            id
            name
          }
        }
      `;

      const { body: pageOne } = await server.executeOperation({
        query,
        variables: { limit: 5 },
      }, { contextValue });

      assert(pageOne.kind === 'single');
      expect(pageOne.singleResult.errors).toBeUndefined();
      expect(pageOne.singleResult.data?.drugs).toHaveLength(5);
      const lastId = (pageOne.singleResult.data!.drugs as DrugData[]).at(3)!.id;

      const { body: pageTwo } = await server.executeOperation({
        query,
        variables: {
          offset: 2,
          limit: 4,
        },
      }, { contextValue });

      assert(pageTwo.kind === 'single');
      expect(pageTwo.singleResult.errors).toBeUndefined();
      expect(pageTwo.singleResult.data?.drugs).toHaveLength(4);
      expect((pageTwo.singleResult.data?.drugs as DrugData[]).at(1)?.id).toBe(lastId);
    });
  });
});

import assert from 'node:assert';
import type { ApolloServer } from '@apollo/server';
import gql from 'graphql-tag';
import type { Knex } from 'knex';
import createTestKnex from '../../../../tests/test-knex';
import createTestServer, { createTestContext } from '../../../../tests/test-server';
import createDiscordApi, { DiscordApi } from '../../../../discord-api';
import { uuidPattern } from '../../../../tests/patterns';
import type { DrugNameRecord } from '../../../../db/drug';

let server: ApolloServer;
let knex: Knex;
let discordApi: DiscordApi;
let lsdId: string;

const drugName = 'barcardi brainmelt';

beforeAll(async () => {
  knex = createTestKnex();
  server = createTestServer();
  discordApi = createDiscordApi();
  lsdId = await knex<DrugNameRecord>('drugNames')
    .where('name', 'LSD')
    .select('drugId')
    .first()
    .then(record => record!.drugId);
});

afterAll(async () => knex.destroy());

describe('Mutation', () => {
  let newDrugNameId: string;

  test('createDrugName', async () => {
    const { body } = await server.executeOperation({
      query: gql`
        mutation CreateDrugName($drugId: UUID!, $name: String!, $type: DrugNameType!) {
          createDrugName(drugId: $drugId, name: $name, type: $type) {
            id
            name
            type
          }
        }
      `,
      variables: {
        drugId: lsdId,
        name: drugName,
        type: 'SUBSTITUTIVE',
      },
    }, {
      contextValue: await createTestContext(knex, discordApi),
    });

    assert(body.kind === 'single');
    expect(body.singleResult.errors).toBeUndefined();
    expect(body.singleResult.data).toEqual({
      createDrugName: {
        id: expect.stringMatching(uuidPattern),
        name: drugName,
        type: 'SUBSTITUTIVE',
      },
    });

    newDrugNameId = (body.singleResult.data!.createDrugName as { id: string }).id;
  });

  test('setDefaultDrugName', async () => {
    const { body } = await server.executeOperation({
      query: gql`
        mutation SetDefaultDrugName($id: UUID!) {
          setDefaultDrugName(id: $id) {
            id
            name
            isDefault
          }
        }
      `,
      variables: { id: newDrugNameId },
    }, {
      contextValue: await createTestContext(knex, discordApi),
    });

    assert(body.kind === 'single');
    expect(body.singleResult.errors).toBeUndefined();
    expect(body.singleResult.data?.setDefaultDrugName).toHaveLength(6);
    expect(
      (body.singleResult.data!.setDefaultDrugName as DrugNameRecord[])
        .find(name => name.name === 'LSD')
        ?.isDefault,
    )
      .toBe(false);
    expect(
      (body.singleResult.data!.setDefaultDrugName as DrugNameRecord[])
        .find(name => name.name === drugName)
        ?.isDefault,
    )
      .toBe(true);
  });

  test('deleteDrugName', async () => {
    const { body } = await server.executeOperation({
      query: gql`
        mutation DeleteDrugName($id: UUID!) {
          deleteDrugName(id: $id)
        }
      `,
      variables: { id: newDrugNameId },
    }, {
      contextValue: await createTestContext(knex, discordApi),
    });

    assert(body.kind === 'single');
    expect(body.singleResult.errors).toBeUndefined();
    await expect(
      knex('drugNames')
        .where('id', newDrugNameId)
        .first()
        .then(Boolean),
    )
      .resolves.toBe(false);
  });
});

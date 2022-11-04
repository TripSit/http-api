import { ApolloServer } from '@apollo/server';
import gql from 'graphql-tag';
import { Knex } from 'knex';
import createDb from '../../../db';
import createSchema from '../..';
import createTestKnex from '../../../../tests/test-knex';
import { uuidPattern } from '../../../../tests/patterns';

let server: ApolloServer;
let knex: Knex;
beforeAll(async () => {
  server = new ApolloServer({
    schema: createSchema(),
  });

  knex = createTestKnex();
});

afterAll(async () => {
  await knex('users').del();
  await knex.destroy();
});

describe('Mutation', () => {
  describe('createUser', () => {
    test('Can create user with username', async () => {
      const { body } = await server.executeOperation({
        query: gql`
          mutation CreateUser($username: String!, $password: String!) {
            createUser(username: $username, password: $password) {
              id
              email
              username
              discordId
              ircId
              matrixId
              lastSeen
              joinedAt
            }
          }
        `,
        variables: {
          username: 'xXxBlazeM45terxXx',
          password: 'hunter2',
        },
      }, {
        contextValue: {
          knex,
          db: createDb(knex),
        },
      });

      expect(body.kind).toBe('single');
      expect(body).toBeUndefined();

      expect(body).toEqual({
        createUser: {
          id: expect.stringMatching(uuidPattern),
          email: null,
          username: 'xXxBlazeM45terxXx',
          discordId: null,
          ircId: null,
          matrixId: null,
          lastSeen: new Date(),
          joinedAt: new Date(),
        },
      });
    });
  });
});

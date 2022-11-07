import assert from 'node:assert';
import type { ApolloServer } from '@apollo/server';
import gql from 'graphql-tag';
import type { Knex } from 'knex';
import createTestKnex from '../../../../tests/test-knex';
import createTestServer, { createTestContext } from '../../../../tests/test-server';
import { uuidPattern } from '../../../../tests/patterns';
import type { UserRecord } from '../user';

let server: ApolloServer;
let knex: Knex;
let users: {
  moonbear: UserRecord;
  sevencats: UserRecord;
  ajar: UserRecord;
};
beforeAll(() => {
  knex = createTestKnex();
  server = createTestServer();
});

afterAll(async () => knex.destroy());

describe('Mutation', () => {
  test('createUserTicket', async () => {
    const { body } = server.executeOperation({
      query: gql`
        mutation CreateUserTicket($userId: UUID!, type: UserTicketType!, description: String!) {
          createUserTicket(userId: $userId, type: $type, description: $description) {
            id
            type
            status
            description
            threadId
            firstMessageId
            closedAt
            createdAt
          }
        }
      `,
      variables: {
        userId:
      },
    });
  });
});

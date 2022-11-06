import assert from 'node:assert';
import type { ApolloServer } from '@apollo/server';
import gql from 'graphql-tag';
import type { Knex } from 'knex';
import createTestKnex from '../../../../tests/test-knex';
import createTestServer, { createTestContext } from '../../../../tests/test-server';
import { uuidPattern } from '../../../../tests/patterns';

let server: ApolloServer;
let knex: Knex;
beforeAll(() => {
  knex = createTestKnex();
  server = createTestServer();
});

afterAll(async () => knex.destroy());

describe('Mutation', () => {
  describe('createUserAction', () => {
    let userId: string;
    let createdBy: string;
    let banEvasionRelatedUser: string;
    beforeAll(async () => {
      [userId, createdBy, banEvasionRelatedUser] = await Promise.all(['SevenCats', 'Moonbear', 'AJAr']
        .map((username) => knex('users')
          .where('username', username)
          .select('id')
          .first()))
        .then((records) => records.map((record) => record.id));
    });

    function defaultVariables() {
      return {
        userId,
        createdBy,
        type: 'NOTE',
        description: 'Wrote some tests',
        internalNote: 'Tests involve too many cats',
        expiresAt: new Date('2030-02-02'),
      };
    }

    test('Can create a user action', async () => {
      const { body } = await server.executeOperation({
        query: gql`
          mutation CreateUserAction(
            $userId: UUID!,
            $type: UserActionType!,
            $description: String!,
            $internalNote: String!,
            $expiresAt: DateTime!,
            $createdBy: UUID!,
          ) {
            createUserAction(
              userId: $userId,
              type: $type,
              description: $description,
              internalNote: $internalNote,
              expiresAt: $expiresAt,
              createdBy: $createdBy,
            ) {
              id
              user {
                id
              }
              type
              banEvasionRelatedUser {
                id
              }
              description
              internalNote
              expiresAt
              repealedBy {
                id
              }
              repealedAt
              createdBy {
                id
              }
              createdAt
            }
          }
        `,
        variables: defaultVariables(),
      }, {
        contextValue: await createTestContext(knex),
      });

      assert(body.kind === 'single');
      expect(body.singleResult.errors).toBeUndefined();
      expect(body.singleResult.data).toEqual({
        createUserAction: {
          id: expect.stringMatching(uuidPattern),
          user: { id: expect.stringMatching(uuidPattern) },
          type: 'NOTE',
          banEvasionRelatedUser: null,
          description: 'Wrote some tests',
          internalNote: 'Tests involve too many cats',
          expiresAt: new Date('2030-02-02'),
          repealedBy: null,
          repealedAt: null,
          createdBy: { id: expect.stringMatching(uuidPattern) },
          createdAt: expect.any(Date),
        },
      });
    });

    test('Throws error if ben evasion user is being set while type is not BAN_EVASION', async () => {
      const { body } = await server.executeOperation({
        query: gql`
          mutation CreateUserAction(
            $userId: UUID!,
            $type: UserActionType!,
            $banEvasionRelatedUser: UUID!,
            $description: String!,
            $internalNote: String!,
            $expiresAt: DateTime!,
            $createdBy: UUID!,
          ) {
            createUserAction(
              userId: $userId,
              type: $type,
              banEvasionRelatedUser: $banEvasionRelatedUser,
              description: $description,
              internalNote: $internalNote,
              expiresAt: $expiresAt,
              createdBy: $createdBy,
            ) {
              id
              user {
                id
              }
              type
              banEvasionRelatedUser {
                id
              }
              description
              internalNote
              expiresAt
              repealedBy {
                id
              }
              repealedAt
              createdBy {
                id
              }
              createdAt
            }
          }
        `,
        variables: {
          ...defaultVariables(),
          banEvasionRelatedUser,
        },
      });

      assert(body.kind === 'single');
      expect(body.singleResult.data).toBeNull();
      expect(body.singleResult.errors).toHaveLength(1);
      expect(body.singleResult.errors?.[0]?.message)
        .toBe('Cannot set related ban evasion user if type is not BAN_EVASION');
    });
  });
});

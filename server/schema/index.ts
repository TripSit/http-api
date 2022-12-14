import { gql } from 'graphql-tag';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs as directiveTypeDefs } from '../directives';
import * as scalarSchema from './scalar';
import * as userSchemas from './user';
import * as drugSchemas from './drug';
import * as discordSchemas from './discord';

const SCHEMAS = [
  scalarSchema,
  ...Object.values(userSchemas),
  ...Object.values(drugSchemas),
  ...Object.values(discordSchemas),
];

const baseTypeDefs = gql`
  type Query {
    _empty: Void
  }

  type Mutation {
    _empty: Void
  }
`;

const typeDefs = SCHEMAS.map(schema => schema.typeDefs);
const resolvers = SCHEMAS.map(schema => schema.resolvers);

export default function createGraphQlSchema() {
  return makeExecutableSchema({
    typeDefs: [
      baseTypeDefs,
      ...directiveTypeDefs,
      ...typeDefs,
    ],

    resolvers: resolvers.reduce((acc, resolver) => ({
      ...acc,
      ...resolver,
      Query: {
        ...acc.Query,
        ...(resolver as { Query: {} }).Query,
      },
      Mutation: {
        ...acc.Mutation,
        ...(resolver as { Mutation: {} }).Mutation,
      },
    }), {
      Query: {},
      Mutation: {},
    }),
  });
}

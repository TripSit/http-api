'use strict';

const { ApolloServer } = require('apollo-server-express');
const dataSources = require('../../server/graphql/data-sources');
const schema = require('../../server/graphql/schema');

module.exports = function createTestApolloServer(dataSourceDeps, { context } = {}) {
  return new ApolloServer({
    dataSources: () => dataSources(dataSourceDeps),
    schema: schema(),
    context: context || (() => ({})),
  });
};

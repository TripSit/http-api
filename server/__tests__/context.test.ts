import type { Knex } from 'knex';
import createContext from '../context';

test('If there is no authorization header "appId" should be null', async () => {
  const context = createContext({
    knex: jest.fn();
  });
});

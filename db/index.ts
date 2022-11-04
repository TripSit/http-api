import createKnex from 'knex';
import knexConfig from '../knexfile';
import createUserDb from './user';
import createDrugDb from './drug';

export default function createDb() {
  const knex = createKnex(knexConfig);

  return {
    knex,
    user: createUserDb(knex),
    drug: createDrugDb(knex),
  };
}

export type Db = ReturnType<typeof createDb>;

import {
  Client, 
  query as q
} from 'faunadb';

import {
  Response
} from '../types';

const {
  CreateCollection,
  CreateIndex,
  Collection,
  If,
  Exists,
  Not,
  Do,
  Delete
} = q;

export async function createCollectionWithIndex (client: Client, name: string): Promise<void> {
  const response: Response<object> = await client.query(
    If(
      Not(
        Exists(Collection(name))
      ),
      Do(
        CreateCollection({ name }),
        CreateIndex({
          name: 'get_associated',
          source: Collection(name),
          terms: {
            field: ['data', 'header', 'to']
          },
          serialized: true
        }),
      ),
      null
    )
  );
  console.log(response);
}

export async function dropCollection (client: Client, name: string): Promise<void> {
  const response: Response<object> = await client.query(
    If(
      Exists(Collection(name)),
      Delete(Collection(name)),
      null
    )
  );
  console.log(response);
}

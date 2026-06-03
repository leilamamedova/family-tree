import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

export function makeApolloClient() {
  return new ApolloClient({
    link: new HttpLink({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || '/api/graphql',
    }),
    cache: new InMemoryCache(),
  });
}

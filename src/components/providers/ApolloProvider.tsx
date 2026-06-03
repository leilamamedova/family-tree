'use client';

import { ApolloProvider as BaseApolloProvider } from '@apollo/client/react';
import { ReactNode, useMemo } from 'react';
import { makeApolloClient } from '@/lib/apollo-client';

type Props = {
  children: ReactNode;
};

export default function ApolloProvider({ children }: Props) {
  const client = useMemo(() => makeApolloClient(), []);

  return <BaseApolloProvider client={client}>{children}</BaseApolloProvider>;
}

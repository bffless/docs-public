import React from 'react';
import {BffStateProvider} from '@bffless/use-bff-state';

// Docusaurus swizzle target: wraps the entire app. Any hook that needs
// BffStateProvider (e.g. LikeButton via useBffState) must live under this.
//
// baseUrl: '/api' means useBffState('/state/foo') posts to /api/state/foo,
// which is what our BFFless pipeline rules are registered under.
export default function Root({children}: {children: React.ReactNode}) {
  return (
    <BffStateProvider
      options={{
        baseUrl: '/api',
        persistence: 'forever',
        staleTime: 5000,
      }}
    >
      {children}
    </BffStateProvider>
  );
}

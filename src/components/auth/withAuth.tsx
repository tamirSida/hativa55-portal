'use client';

import React from 'react';
import { AccessControl } from './AccessControl';

interface WithAuthOptions {
  requireApproved?: boolean;
  requireAdmin?: boolean;
  allowedForPending?: boolean;
  redirectTo?: string;
}

export function withAuth<T extends object>(
  Component: React.ComponentType<T>,
  options: WithAuthOptions = {}
) {
  return function AuthenticatedComponent(props: T) {
    return (
      <AccessControl
        requireApproved={options.requireApproved}
        requireAdmin={options.requireAdmin}
        allowedForPending={options.allowedForPending}
        redirectTo={options.redirectTo}
      >
        <Component {...props} />
      </AccessControl>
    );
  };
}
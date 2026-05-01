'use client';

import React from 'react';
import * as Sentry from '@sentry/nextjs';

type Props = { children: React.ReactNode; fallback?: React.ReactNode };
type State = { hasError: boolean };

export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
          <p className="text-sm font-medium text-slate-900">Etwas ist schiefgelaufen.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="text-xs text-slate-500 underline hover:text-slate-800 transition-colors"
          >
            Erneut versuchen
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

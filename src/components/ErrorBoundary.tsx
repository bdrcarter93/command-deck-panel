import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Caught render error:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
          <div className="glass-card p-8 max-w-2xl w-full space-y-4">
            <h1 className="text-xl font-semibold text-destructive">Render error</h1>
            <p className="text-muted-foreground text-sm">
              The dashboard encountered an error. Check the browser console for details.
            </p>
            <pre className="text-xs bg-secondary/30 p-4 rounded overflow-auto max-h-64 text-foreground/80">
              {this.state.error.message}
              {'\n\n'}
              {this.state.error.stack}
            </pre>
            <button
              className="px-4 py-2 rounded bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors"
              onClick={() => this.setState({ error: null })}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

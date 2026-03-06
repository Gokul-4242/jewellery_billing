import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from './Button';
import styles from './Common.module.scss';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className={styles.errorBoundary}>
                    <h2>Something went wrong.</h2>
                    <p>
                        {this.state.error?.message || "An unexpected error occurred."}
                    </p>
                    <Button onClick={() => window.location.reload()}>
                        Reload Page
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}

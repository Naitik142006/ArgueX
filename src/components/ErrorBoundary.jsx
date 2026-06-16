import React from 'react';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';
import Button from './ui/Button.jsx';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-grid-arena opacity-20 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-rose-500/10 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="glass-panel border border-rose-500/20 p-8 md:p-12 max-w-lg w-full text-center relative z-10 animate-fade-in shadow-[0_0_50px_rgba(244,63,94,0.15)]">
            <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-rose-500/30">
              <ShieldAlert className="text-rose-400" size={40} />
            </div>
            
            <h1 className="text-3xl font-heading font-black text-white mb-4 uppercase tracking-tight">
              Something went <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">wrong</span>.
            </h1>
            
            <p className="text-zinc-400 font-mono text-sm leading-relaxed mb-8 uppercase tracking-widest">
              A critical error occurred in the application matrix. We've logged the issue.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => window.location.reload()} 
                variant="brand" 
                className="gap-2 bg-rose-500/20 text-rose-400 border border-rose-500/50 hover:bg-rose-500/30"
              >
                <RefreshCw size={18} />
                Reload Page
              </Button>
              <Button 
                onClick={() => window.location.href = '/'} 
                variant="outline" 
                className="gap-2"
              >
                <Home size={18} />
                Return Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

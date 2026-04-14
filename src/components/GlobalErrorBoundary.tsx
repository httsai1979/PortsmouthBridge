import { Component, ErrorInfo, ReactNode } from 'react';
import Icon from './Icon';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white rounded-[32px] p-8 shadow-2xl border-4 border-rose-100 animate-fade-in">
            <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="alert" size={40} />
            </div>

            <h1 className="text-2xl font-black text-slate-900 mb-2">Something went wrong</h1>
            <p className="text-sm text-slate-500 font-bold mb-8 uppercase tracking-widest">System Error</p>

            <div className="space-y-4 text-left bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Emergency Contacts</h3>

              <div className="flex items-center justify-between group">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Emergency</p>
                  <p className="text-lg font-black text-slate-800">999</p>
                </div>
                <a href="tel:999" className="p-3 bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-100 flex items-center justify-center transition-transform active:scale-90">
                  <Icon name="phone" size={18} />
                </a>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">NHS Advice</p>
                  <p className="text-lg font-black text-slate-800">111</p>
                </div>
                <a href="tel:111" className="p-3 bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-100 flex items-center justify-center transition-transform active:scale-90">
                  <Icon name="phone" size={18} />
                </a>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">City Council</p>
                  <p className="text-sm font-black text-slate-800">Portsmouth Support Hub</p>
                  <p className="text-base font-black text-slate-800">023 9283 4092</p>
                </div>
                <a href="tel:02392834092" className="p-3 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-200 flex items-center justify-center transition-transform active:scale-90">
                  <Icon name="phone" size={18} />
                </a>
              </div>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="mt-8 w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
            >
              Try to Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;

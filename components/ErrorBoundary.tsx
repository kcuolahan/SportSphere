'use client'
import { Component, ReactNode } from 'react'

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#f97316', fontSize: 40, marginBottom: 16 }}>!</div>
            <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Something went wrong</h2>
            <p style={{ color: '#888', marginBottom: 24, fontSize: 14 }}>Please refresh the page</p>
            <button
              onClick={() => window.location.reload()}
              style={{ background: '#f97316', color: '#000', fontWeight: 700, padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14 }}
            >
              Refresh
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

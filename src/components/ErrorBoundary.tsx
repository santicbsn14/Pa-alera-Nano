// src/components/ErrorBoundary.tsx
import { Component } from 'react'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  tieneError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { tieneError: false }
  }

  static getDerivedStateFromError(): State {
    return { tieneError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log en consola — visible en Render si el error viene del SSR,
    // y útil para debugging local
    console.error('[Nano Error]', error.message, info.componentStack)
  }

  reiniciar = () => {
    this.setState({ tieneError: false })
  }

  render() {
    if (this.state.tieneError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100dvh',
          padding: '24px',
          textAlign: 'center',
          fontFamily: 'sans-serif',
        }}>
          <span style={{ fontSize: '48px', marginBottom: '16px' }}>😕</span>
          <h2 style={{ fontSize: '20px', marginBottom: '8px', color: '#0A0A0A' }}>
            Algo salió mal
          </h2>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px', maxWidth: '300px' }}>
            Ocurrió un error inesperado. Tu pedido sigue guardado, podés recargar la página sin perderlo.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#4DC8E8',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Recargar página
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
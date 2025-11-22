import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function EntrevistaConfirmada() {
  const [searchParams] = useSearchParams();
  const mensaje = searchParams.get('mensaje') || 'Acción procesada';
  const estado = searchParams.get('estado') || '';

  const getIcon = () => {
    if (estado === 'confirmada') return '✅';
    if (estado.includes('cancelada')) return '❌';
    if (estado.includes('solicitud')) return '🔄';
    return '📋';
  };

  const getColor = () => {
    if (estado === 'confirmada') return '#48bb78';
    if (estado.includes('cancelada')) return '#f56565';
    if (estado.includes('solicitud')) return '#ed8936';
    return '#2b6cb0';
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>
          {getIcon()}
        </div>
        
        <h1 style={{ 
          color: getColor(), 
          margin: '0 0 20px 0',
          fontSize: '28px' 
        }}>
          {mensaje}
        </h1>
        
        <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '30px' }}>
          Tu solicitud ha sido procesada exitosamente. El reclutador ha sido notificado.
        </p>

        <div style={{
          background: '#f7fafc',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <p style={{ margin: '5px 0', color: '#2d3748' }}>
            <strong>Estado actual:</strong> {estado.replace('_', ' ')}
          </p>
        </div>

        <p style={{ fontSize: '14px', color: '#a0aec0' }}>
          Puedes cerrar esta ventana.
        </p>
      </div>
    </div>
  );
}
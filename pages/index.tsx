'use client'
import { useState } from 'react'
import { LODGES, PISOS, ITEMS } from '@/lib/data'

export default function Home() {
  const [entity, setEntity] = useState<'outside' | 'main' | null>(null)
  const [lodge, setLodge] = useState<number | null>(null)
  const [piso, setPiso] = useState<string | null>(null)
  const [bridge, setBridge] = useState<number | null>(null)
  const [restockType, setRestockType] = useState<'profundidad' | 'urgente' | null>(null)
  const [itemFill, setItemFill] = useState<Record<number, number>>({})

  const handleReset = () => {
    setEntity(null)
    setLodge(null)
    setPiso(null)
    setBridge(null)
    setRestockType(null)
    setItemFill({})
  }

  const handleEntityChange = (e: 'outside' | 'main') => {
    if (entity === e) {
      // Si clickea el mismo, no hacer nada
      return
    }
    // Limpiar otros campos pero mantener entity
    setEntity(e)
    setLodge(null)
    setPiso(null)
    setBridge(null)
    setRestockType(null)
    setItemFill({})
  }

  const handleItemFill = (itemId: number, percent: number) => {
    setItemFill(prev => ({
      ...prev,
      [itemId]: Math.max(0, Math.min(100, percent))
    }))
  }

  const handleSave = () => {
    const report = {
      entity,
      lodge: entity === 'outside' ? lodge : null,
      piso: entity === 'main' ? piso : null,
      bridge: entity === 'outside' ? bridge : null,
      restockType,
      itemFill,
      timestamp: new Date().toISOString()
    }
    console.log('📊 Reporte guardado:', report)
    alert(`✅ Reporte guardado!\n\nEntidad: ${entity}\nTipo: ${restockType}\nItems: ${Object.keys(itemFill).length}`)
    handleReset()
  }

  const getGradientColor = (percent: number) => {
    if (percent < 50) return '#f44336'
    if (percent < 75) return '#FF9800'
    return '#4CAF50'
  }

  console.log('Estado actual:', { entity, lodge, piso, bridge, restockType })

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>🏨 Restock Runner V2</h1>
      <p>Bienvenido a Sagamore Resort</p>

      {/* STEP 1: Entity Selection */}
      <section style={{ marginBottom: '20px', border: '2px solid #333', padding: '15px', borderRadius: '8px', backgroundColor: '#f0f0f0' }}>
        <h2>📍 Paso 1: ¿Dónde?</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => handleEntityChange('outside')}
            style={{
              flex: 1,
              padding: '15px',
              backgroundColor: entity === 'outside' ? '#4CAF50' : '#ddd',
              color: entity === 'outside' ? 'white' : 'black',
              cursor: 'pointer',
              border: entity === 'outside' ? '3px solid #2e7d32' : 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            🏘️ Outside (Lodges)
          </button>
          <button
            onClick={() => handleEntityChange('main')}
            style={{
              flex: 1,
              padding: '15px',
              backgroundColor: entity === 'main' ? '#4CAF50' : '#ddd',
              color: entity === 'main' ? 'white' : 'black',
              cursor: 'pointer',
              border: entity === 'main' ? '3px solid #2e7d32' : 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            🏨 Main Hotel
          </button>
        </div>
      </section>

      {/* STEP 2: Lodge/Piso Selection */}
      {entity === 'outside' && (
        <section style={{ marginBottom: '20px', border: '2px solid #2196F3', padding: '15px', borderRadius: '8px', backgroundColor: '#e3f2fd' }}>
          <h2>🏠 Paso 2: Lodge</h2>
          <select
            value={lodge || ''}
            onChange={(e) => setLodge(e.target.value ? Number(e.target.value) : null)}
            style={{ width: '100%', padding: '12px', marginBottom: '15px', fontSize: '16px', borderRadius: '4px', border: '2px solid #2196F3' }}
          >
            <option value="">-- Selecciona Lodge --</option>
            {LODGES.map((l) => (
              <option key={l.num} value={l.num}>
                {l.name}
              </option>
            ))}
          </select>

          {lodge && (
            <>
              <h3>🌉 Bridge</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {Array.from({ length: LODGES.find(l => l.num === lodge)?.bridges || 0 }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setBridge(i + 1)}
                    style={{
                      padding: '12px',
                      backgroundColor: bridge === i + 1 ? '#2196F3' : '#e0e0e0',
                      color: bridge === i + 1 ? 'white' : 'black',
                      cursor: 'pointer',
                      border: bridge === i + 1 ? '3px solid #1565c0' : 'none',
                      borderRadius: '4px',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}
                  >
                    Bridge {i + 1}
                  </button>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {entity === 'main' && (
        <section style={{ marginBottom: '20px', border: '2px solid #9C27B0', padding: '15px', borderRadius: '8px', backgroundColor: '#f3e5f5' }}>
          <h2>🏗️ Paso 2: Piso</h2>
          <select
            value={piso || ''}
            onChange={(e) => setPiso(e.target.value || null)}
            style={{ width: '100%', padding: '12px', fontSize: '16px', borderRadius: '4px', border: '2px solid #9C27B0' }}
          >
            <option value="">-- Selecciona Piso --</option>
            {PISOS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </section>
      )}

      {/* STEP 3: Restock Type */}
      {entity && ((entity === 'outside' && bridge) || (entity === 'main' && piso)) && (
        <section style={{ marginBottom: '20px', border: '2px solid #FF9800', padding: '15px', borderRadius: '8px', backgroundColor: '#fff3e0' }}>
          <h2>📋 Paso 3: Tipo</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setRestockType('profundidad')}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: restockType === 'profundidad' ? '#FF9800' : '#ddd',
                color: restockType === 'profundidad' ? 'white' : 'black',
                cursor: 'pointer',
                border: restockType === 'profundidad' ? '3px solid #e65100' : 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              📦 Profundidad
            </button>
            <button
              onClick={() => setRestockType('urgente')}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: restockType === 'urgente' ? '#FF9800' : '#ddd',
                color: restockType === 'urgente' ? 'white' : 'black',
                cursor: 'pointer',
                border: restockType === 'urgente' ? '3px solid #e65100' : 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              🚨 Urgente
            </button>
          </div>
        </section>
      )}

      {/* STEP 4: Item Fill */}
      {restockType && (
        <section style={{ marginBottom: '20px', border: '2px solid #4CAF50', padding: '15px', borderRadius: '8px', backgroundColor: '#e8f5e9' }}>
          <h2>🎚️ Paso 4: Items</h2>
          {Object.entries(ITEMS).slice(0, 8).map(([id, item]) => {
            const numId = Number(id)
            const percent = itemFill[numId] || 0
            return (
              <div key={id} style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                  {item.name_es} — {percent}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={percent}
                  onChange={(e) => handleItemFill(numId, Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer', accentColor: getGradientColor(percent) }}
                />
                <div style={{
                  height: '24px',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  marginTop: '4px'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${percent}%`,
                    backgroundColor: getGradientColor(percent),
                    transition: 'width 0.2s, background-color 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: '8px',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {percent > 10 && `${percent}%`}
                  </div>
                </div>
              </div>
            )
          })}
        </section>
      )}

      {/* Submit Button */}
      {restockType && Object.keys(itemFill).length > 0 && (
        <button
          onClick={handleSave}
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '18px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginBottom: '10px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
          }}
        >
          ✅ Guardar Reporte
        </button>
      )}

      {entity && (
        <button
          onClick={handleReset}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '14px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🔄 Empezar de Nuevo
        </button>
      )}

      {!entity && (
        <div style={{ padding: '20px', backgroundColor: '#e0e0e0', borderRadius: '6px', textAlign: 'center', marginTop: '20px' }}>
          <p style={{ color: '#666' }}>👆 Selecciona dónde estás restocking</p>
        </div>
      )}
    </div>
  )
}

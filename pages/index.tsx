'use client'
import { useState, useEffect } from 'react'
import { LODGES, PISOS, ITEMS, getItemsForType } from '@/lib/data'

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [tempUsername, setTempUsername] = useState('')

  const [entity, setEntity] = useState<'outside' | 'main' | null>(null)
  const [lodge, setLodge] = useState<number | null>(null)
  const [piso, setPiso] = useState<string | null>(null)
  const [bridge, setBridge] = useState<number | null>(null)
  const [restockType, setRestockType] = useState<'profundidad' | 'urgente' | null>(null)
  const [itemFill, setItemFill] = useState<Record<number, number>>({})
  const [cart, setCart] = useState<Record<number, { qty: number; unit: string }>>({})

  useEffect(() => {
    const saved = localStorage.getItem('rr-user')
    const savedCart = localStorage.getItem('rr-cart')
    if (saved) {
      setIsLoggedIn(true)
      setUsername(saved)
    }
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  const handleLogin = () => {
    if (tempUsername.trim()) {
      setUsername(tempUsername)
      setIsLoggedIn(true)
      localStorage.setItem('rr-user', tempUsername)
      setTempUsername('')
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUsername('')
    localStorage.removeItem('rr-user')
    handleReset()
  }

  const handleReset = () => {
    setEntity(null)
    setLodge(null)
    setPiso(null)
    setBridge(null)
    setRestockType(null)
    setItemFill({})
  }

  const handleEntityChange = (e: 'outside' | 'main') => {
    if (entity === e) return
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

  const calculateQty = (itemId: number, percent: number) => {
    const item = ITEMS[itemId]
    if (percent < 30) return Math.ceil((item.pcs_box * percent) / 100)
    return Math.ceil((item.pcs_box * percent) / 100 / item.pcs_box)
  }

  const addToCart = (itemId: number) => {
    const percent = itemFill[itemId] || 0
    if (percent === 0) return
    
    const item = ITEMS[itemId]
    const qty = calculateQty(itemId, percent)
    
    setCart(prev => {
      const updated = { ...prev, [itemId]: { qty, unit: item.unit } }
      localStorage.setItem('rr-cart', JSON.stringify(updated))
      return updated
    })
  }

  const removeFromCart = (itemId: number) => {
    setCart(prev => {
      const updated = { ...prev }
      delete updated[itemId]
      localStorage.setItem('rr-cart', JSON.stringify(updated))
      return updated
    })
  }

  const handleSave = () => {
    const report = {
      user: username,
      entity,
      lodge: entity === 'outside' ? lodge : null,
      piso: entity === 'main' ? piso : null,
      bridge: entity === 'outside' ? bridge : null,
      restockType,
      cart,
      timestamp: new Date().toISOString()
    }
    console.log('📊 Reporte guardado:', report)
    alert(`✅ Reporte de ${username} guardado!\n\nItems en carrito: ${Object.keys(cart).length}`)
    handleReset()
    setCart({})
    localStorage.removeItem('rr-cart')
  }

  const getGradientColor = (percent: number) => {
    if (percent < 50) return '#f44336'
    if (percent < 75) return '#FF9800'
    return '#4CAF50'
  }

  if (!isLoggedIn) {
    return (
      <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>
        <h1>🏨 Restock Runner</h1>
        <p>Sagamore Resort</p>
        
        <div style={{ marginTop: '30px', border: '2px solid #333', padding: '20px', borderRadius: '8px', backgroundColor: '#f0f0f0' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            Tu nombre:
          </label>
          <input
            type="text"
            value={tempUsername}
            onChange={(e) => setTempUsername(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Ej: Rodrigo"
            style={{ width: '100%', padding: '12px', marginBottom: '15px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
          <button
            onClick={handleLogin}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '18px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🚀 Empezar
          </button>
        </div>
      </div>
    )
  }

  const visibleItems = restockType ? getItemsForType(restockType) : Object.entries(ITEMS)

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '15px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
        <h1 style={{ margin: 0 }}>🏨 Restock Runner</h1>
        <div>
          <span style={{ marginRight: '15px', fontWeight: 'bold' }}>👤 {username}</span>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 12px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* STEP 1: Entity Selection */}
      <section style={{ marginBottom: '15px', border: '2px solid #333', padding: '12px', borderRadius: '6px', backgroundColor: '#f0f0f0' }}>
        <h3>📍 ¿Dónde?</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleEntityChange('outside')}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: entity === 'outside' ? '#4CAF50' : '#ddd',
              color: entity === 'outside' ? 'white' : 'black',
              cursor: 'pointer',
              border: entity === 'outside' ? '2px solid #2e7d32' : 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            🏘️ Outside
          </button>
          <button
            onClick={() => handleEntityChange('main')}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: entity === 'main' ? '#4CAF50' : '#ddd',
              color: entity === 'main' ? 'white' : 'black',
              cursor: 'pointer',
              border: entity === 'main' ? '2px solid #2e7d32' : 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            🏨 Main
          </button>
        </div>
      </section>

      {/* STEP 2: Location */}
      {entity === 'outside' && (
        <section style={{ marginBottom: '15px', border: '2px solid #2196F3', padding: '12px', borderRadius: '6px', backgroundColor: '#e3f2fd' }}>
          <h3>🏠 Lodge & Bridge</h3>
          <select
            value={lodge || ''}
            onChange={(e) => setLodge(e.target.value ? Number(e.target.value) : null)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', fontSize: '14px', borderRadius: '4px', border: '1px solid #2196F3' }}
          >
            <option value="">-- Selecciona Lodge --</option>
            {LODGES.map((l) => (
              <option key={l.num} value={l.num}>{l.name}</option>
            ))}
          </select>

          {lodge && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {Array.from({ length: LODGES.find(l => l.num === lodge)?.bridges || 0 }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setBridge(i + 1)}
                  style={{
                    padding: '10px',
                    backgroundColor: bridge === i + 1 ? '#2196F3' : '#e0e0e0',
                    color: bridge === i + 1 ? 'white' : 'black',
                    cursor: 'pointer',
                    border: bridge === i + 1 ? '2px solid #1565c0' : 'none',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}
                >
                  B{i + 1}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {entity === 'main' && (
        <section style={{ marginBottom: '15px', border: '2px solid #9C27B0', padding: '12px', borderRadius: '6px', backgroundColor: '#f3e5f5' }}>
          <h3>🏗️ Piso</h3>
          <select
            value={piso || ''}
            onChange={(e) => setPiso(e.target.value || null)}
            style={{ width: '100%', padding: '10px', fontSize: '14px', borderRadius: '4px', border: '1px solid #9C27B0' }}
          >
            <option value="">-- Selecciona Piso --</option>
            {PISOS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </section>
      )}

      {/* STEP 3: Restock Type */}
      {entity && ((entity === 'outside' && bridge) || (entity === 'main' && piso)) && (
        <section style={{ marginBottom: '15px', border: '2px solid #FF9800', padding: '12px', borderRadius: '6px', backgroundColor: '#fff3e0' }}>
          <h3>📋 Tipo</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setRestockType('profundidad')}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: restockType === 'profundidad' ? '#FF9800' : '#ddd',
                color: restockType === 'profundidad' ? 'white' : 'black',
                cursor: 'pointer',
                border: restockType === 'profundidad' ? '2px solid #e65100' : 'none',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              📦 Profundidad
            </button>
            <button
              onClick={() => setRestockType('urgente')}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: restockType === 'urgente' ? '#FF9800' : '#ddd',
                color: restockType === 'urgente' ? 'white' : 'black',
                cursor: 'pointer',
                border: restockType === 'urgente' ? '2px solid #e65100' : 'none',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              🚨 Urgente
            </button>
          </div>
        </section>
      )}

      {/* STEP 4: Items & Cart */}
      {restockType && (
        <>
          <section style={{ marginBottom: '15px', border: '2px solid #4CAF50', padding: '12px', borderRadius: '6px', backgroundColor: '#e8f5e9' }}>
            <h3>🎚️ Items ({visibleItems.length})</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {visibleItems.map(([id, item]) => {
                const numId = Number(id)
                const percent = itemFill[numId] || 0
                return (
                  <div key={id} style={{ marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid #ccc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <label style={{ fontWeight: 'bold', fontSize: '13px' }}>{item.name_es}</label>
                      <span style={{ fontSize: '12px', color: '#666' }}>{percent}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={percent}
                      onChange={(e) => handleItemFill(numId, Number(e.target.value))}
                      style={{ width: '100%', cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      <div style={{
                        flex: 1,
                        height: '18px',
                        backgroundColor: '#e0e0e0',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${percent}%`,
                          backgroundColor: getGradientColor(percent),
                          transition: 'width 0.2s'
                        }} />
                      </div>
                      {percent > 0 && (
                        <button
                          onClick={() => addToCart(numId)}
                          style={{
                            padding: '4px 10px',
                            backgroundColor: '#2196F3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: 'bold'
                          }}
                        >
                          + Carrito
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* CART */}
          <section style={{ marginBottom: '15px', border: '2px solid #FF5722', padding: '12px', borderRadius: '6px', backgroundColor: '#ffebee' }}>
            <h3>🛒 Carrito ({Object.keys(cart).length})</h3>
            {Object.keys(cart).length === 0 ? (
              <p style={{ fontSize: '12px', color: '#666' }}>Vacío - Agrega items con "Carrito"</p>
            ) : (
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {Object.entries(cart).map(([itemId, { qty, unit }]) => {
                  const item = ITEMS[Number(itemId)]
                  return (
                    <div key={itemId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', backgroundColor: '#fff', borderRadius: '4px', marginBottom: '6px' }}>
                      <div>
                        <p style={{ margin: '0 0 3px 0', fontWeight: 'bold', fontSize: '13px' }}>{item.name_es}</p>
                        <p style={{ margin: 0, fontSize: '11px', color: '#666' }}>
                          {qty > 1 ? `${qty} ${unit}s` : `${qty} ${unit}`}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(Number(itemId))}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        ❌
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Save Button */}
          {Object.keys(cart).length > 0 && (
            <button
              onClick={handleSave}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '16px',
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
        </>
      )}

      {entity && (
        <button
          onClick={handleReset}
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '13px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🔄 Reiniciar
        </button>
      )}
    </div>
  )
}

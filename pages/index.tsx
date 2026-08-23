import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRestock } from '@/hooks/useRestock'
import { LODGES, PISOS, ITEMS } from '@/lib/data'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const {
    entity, lodge, piso, bridge, restockType, itemFill,
    setEntity, setLodge, setPiso, setBridge, setRestockType, setItemFill, reset
  } = useRestock()

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      // Fetch items
      const { data } = await supabase.from('items').select('*').eq('active', true)
      setItems(data || [])
      setLoading(false)
    }
    
    checkUser()
  }, [])

  if (loading) return <div className="p-4">Cargando...</div>

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>Restock Runner V2</h1>
      <p>Bienvenido, {user?.email || 'Invitado'}</p>

      {/* STEP 1: Entity Selection */}
      <section style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
        <h2>Paso 1: Selecciona Tipo</h2>
        <button
          onClick={() => { setEntity('outside'); reset() }}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: entity === 'outside' ? '#4CAF50' : '#ddd',
            color: entity === 'outside' ? 'white' : 'black',
            cursor: 'pointer',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          🏘️ Outside (Lodges)
        </button>
        <button
          onClick={() => { setEntity('main'); reset() }}
          style={{
            padding: '10px 20px',
            backgroundColor: entity === 'main' ? '#4CAF50' : '#ddd',
            color: entity === 'main' ? 'white' : 'black',
            cursor: 'pointer',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          🏨 Main Hotel
        </button>
      </section>

      {/* STEP 2: Lodge/Piso Selection */}
      {entity === 'outside' && (
        <section style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
          <h2>Paso 2: Selecciona Lodge</h2>
          <select
            value={lodge || ''}
            onChange={(e) => setLodge(Number(e.target.value))}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
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
              <h3>Selecciona Bridge</h3>
              {Array.from({ length: LODGES.find(l => l.num === lodge)?.bridges || 0 }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setBridge(i + 1)}
                  style={{
                    padding: '8px 12px',
                    marginRight: '8px',
                    marginBottom: '8px',
                    backgroundColor: bridge === i + 1 ? '#2196F3' : '#e0e0e0',
                    color: bridge === i + 1 ? 'white' : 'black',
                    cursor: 'pointer',
                    border: 'none',
                    borderRadius: '4px'
                  }}
                >
                  Bridge {i + 1}
                </button>
              ))}
            </>
          )}
        </section>
      )}

      {entity === 'main' && (
        <section style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
          <h2>Paso 2: Selecciona Piso</h2>
          <select
            value={piso || ''}
            onChange={(e) => setPiso(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
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
        <section style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
          <h2>Paso 3: Tipo de Restock</h2>
          <button
            onClick={() => setRestockType('profundidad')}
            style={{
              padding: '10px 20px',
              marginRight: '10px',
              backgroundColor: restockType === 'profundidad' ? '#FF9800' : '#ddd',
              color: restockType === 'profundidad' ? 'white' : 'black',
              cursor: 'pointer',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            📦 Profundidad (Todos)
          </button>
          <button
            onClick={() => setRestockType('urgente')}
            style={{
              padding: '10px 20px',
              backgroundColor: restockType === 'urgente' ? '#FF9800' : '#ddd',
              color: restockType === 'urgente' ? 'white' : 'black',
              cursor: 'pointer',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            🚨 Urgente
          </button>
        </section>
      )}

      {/* STEP 4: Item Fill */}
      {restockType && (
        <section style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
          <h2>Paso 4: Nivel de Items</h2>
          {items.slice(0, 5).map((item) => (
            <div key={item.id} style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                {item.name_es} ({itemFill[item.id] || 0}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={itemFill[item.id] || 0}
                onChange={(e) => setItemFill(item.id, Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
              <div style={{
                height: '20px',
                backgroundColor: '#e0e0e0',
                borderRadius: '4px',
                overflow: 'hidden',
                marginTop: '4px'
              }}>
                <div style={{
                  height: '100%',
                  width: `${itemFill[item.id] || 0}%`,
                  backgroundColor: itemFill[item.id] >= 75 ? '#4CAF50' : itemFill[item.id] >= 50 ? '#FF9800' : '#f44336',
                  transition: 'width 0.3s'
                }} />
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Submit Button */}
      {restockType && Object.keys(itemFill).length > 0 && (
        <button
          onClick={() => {
            alert(`Reporte guardado: ${entity} - ${entity === 'outside' ? `Lodge ${lodge} Bridge ${bridge}` : piso}`)
            reset()
          }}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Guardar Reporte
        </button>
      )}
    </div>
  )
}

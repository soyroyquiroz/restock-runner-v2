import React from 'react'

export const C = {
  ink: '#12211c', line: '#d6ded9', bg: '#f6f7f5', card: '#ffffff',
  green: '#2f7d5d', red: '#c0392b', amber: '#d68910', blue: '#2a6fb0', gray: '#8a948f',
}

export const wrap: React.CSSProperties = { maxWidth: 620, margin: '0 auto', padding: 16, fontFamily: 'system-ui, sans-serif', color: C.ink, background: C.bg, minHeight: '100vh' }
export const card: React.CSSProperties = { background: C.card, border: `1px solid ${C.line}`, borderRadius: 10, padding: 14 }
export const row: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${C.line}` }
export const input: React.CSSProperties = { width: '100%', padding: 11, fontSize: 15, borderRadius: 8, border: `1px solid ${C.line}`, background: '#fff', boxSizing: 'border-box' }
export const btnGhost: React.CSSProperties = { padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.line}`, background: '#fff', cursor: 'pointer', fontSize: 13 }
export const linkBtn: React.CSSProperties = { background: 'none', border: 'none', color: C.red, cursor: 'pointer', fontSize: 13, padding: 0 }
export const sectionLabel: React.CSSProperties = { fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6, color: C.gray, marginBottom: 10 }

export function btn(bg: string): React.CSSProperties {
  return { width: '100%', padding: 13, fontSize: 15, fontWeight: 600, background: bg, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div style={{ ...card, marginBottom: 12 }}><div style={sectionLabel}>{title}</div>{children}</div>
}

export function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600,
      border: `1px solid ${active ? C.ink : C.line}`, background: active ? C.ink : '#fff', color: active ? '#fff' : C.ink,
    }}>{label}</button>
  )
}

export function Pick({ label, sub, active, onClick }: { label: string; sub?: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: '12px 8px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14,
      border: `1px solid ${active ? C.green : C.line}`, background: active ? C.green : '#fff', color: active ? '#fff' : C.ink,
    }}>
      {label}{sub && <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.8 }}>{sub}</div>}
    </button>
  )
}

export function Check({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
      padding: '11px 12px', marginBottom: 6, borderRadius: 8, cursor: 'pointer', fontSize: 14,
      border: `1px solid ${on ? C.green : C.line}`, background: on ? '#eef6f1' : '#fff', color: C.ink,
    }}>
      <span style={{
        width: 22, height: 22, flexShrink: 0, borderRadius: 5, display: 'grid', placeItems: 'center',
        border: `1px solid ${on ? C.green : C.line}`, background: on ? C.green : '#fff', color: '#fff', fontSize: 14,
      }}>{on ? '✓' : ''}</span>
      <span style={{ flex: 1, opacity: on ? 0.55 : 1, textDecoration: on ? 'line-through' : 'none' }}>{children}</span>
    </button>
  )
}

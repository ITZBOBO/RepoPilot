export default function Loading() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:20 }}>
        {/* Gradient spinner */}
        <div style={{ position:'relative', width:44, height:44 }}>
          <div style={{
            width:44, height:44, borderRadius:'50%',
            border:'3px solid rgba(99,102,241,.1)',
            borderTopColor:'#6366F1',
            borderRightColor:'#22D3EE',
            animation:'spin 0.9s cubic-bezier(.4,0,.2,1) infinite',
          }} />
          <div style={{
            position:'absolute', inset:6,
            borderRadius:'50%',
            background:'radial-gradient(circle, rgba(99,102,241,.12), transparent)',
          }} />
        </div>
        <p style={{ fontSize:12, color:'var(--dim)', fontWeight:500, letterSpacing:'0.5px' }}>
          Loading…
        </p>
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
      <div style={{ display:'flex', gap:6 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width:8, height:8, borderRadius:'50%', background:'var(--blue)', animation:`bounce3 1.2s ease-in-out ${i*0.15}s infinite` }} />
        ))}
      </div>
    </div>
  )
}

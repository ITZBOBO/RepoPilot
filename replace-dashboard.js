const fs = require('fs');

const filePath = 'src/app/(dashboard)/dashboard/page.tsx';
const content = fs.readFileSync(filePath, 'utf8');

// Find the page-content div
const startMarker = '<div className="page-content">';
const endMarker = '{/* Onboarding Modal */}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find markers');
  process.exit(1);
}

const newPageContent = `      <div className="page-content">

        {/* Stats row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap: 20, marginBottom:32 }} className="fu d1">
          {[
            { icon:'🔥', label:'GitHub Streak', value: '12 Days', color:'var(--amber)', bg:'linear-gradient(135deg, rgba(251,191,36,.15), rgba(251,191,36,.05))', border: 'rgba(251,191,36,.3)', className: 'card card-hover card-glow-amber', href: '/analytics' },
            { icon:'📅', label:'Active Schedulers', value: '3', color:'var(--sky)', bg:'linear-gradient(135deg, rgba(34,211,238,.15), rgba(34,211,238,.05))', border: 'rgba(34,211,238,.3)', className: 'card card-hover', href: '/scheduler' },
            { icon:'🚀', label:'Total Commits', value: '142', color:'var(--green)', bg:'linear-gradient(135deg, rgba(52,211,153,.15), rgba(52,211,153,.05))', border: 'rgba(52,211,153,.3)', className: 'card card-hover', href: '/portfolio' },
          ].map((s, idx) => (
            <Link href={s.href} className={s.className} key={s.label} style={{ display:'flex', flexDirection: 'column', gap:16, padding: '24px', textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width:48, height:48, borderRadius:14, background:s.bg, border: \`1px solid \${s.border}\`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, boxShadow: \`inset 0 2px 10px rgba(255,255,255,0.05)\` }}><EmojiIcon emoji={s.icon} /></div>
                <div>
                  <div style={{ fontFamily:'Syne,sans-serif', fontSize:32, fontWeight:800, color:'#fff', letterSpacing: '-1px', lineHeight: 1 }}>{s.value}</div>
                </div>
              </div>
              <div style={{ fontSize:13, fontWeight: 500, color:'var(--gray)', letterSpacing: '0.2px' }}>{s.label}</div>
            </Link>
          ))}
        </div>

        <div className="card fu d2" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}><EmojiIcon emoji="📝" className="inline" /></span>
              <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 700, color: '#fff' }}>Recent Commit Logs</h2>
            </div>
            <Link href="/analytics" className="btn-ghost" style={{ fontSize: 12, padding: '6px 12px', borderRadius: 8, textDecoration: 'none' }}>View All →</Link>
          </div>
          
          <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 600, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Repository</th>
                  <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 600, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Message</th>
                  <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 600, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 600, color: 'var(--dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { repo: 'finance-dashboard', msg: 'feat: add monthly spending charts', status: 'Success', date: '2 mins ago', color: 'var(--green)' },
                  { repo: 'repo-pilot', msg: 'fix: unauthorized API endpoint', status: 'Success', date: '1 hr ago', color: 'var(--green)' },
                  { repo: 'portfolio-v2', msg: 'chore: update dependencies', status: 'Failed', date: '3 hrs ago', color: 'var(--red)' },
                  { repo: 'react-components', msg: 'docs: update readme usage', status: 'Success', date: 'Yesterday', color: 'var(--green)' },
                  { repo: 'finance-dashboard', msg: 'init: setup nextjs project', status: 'Success', date: '2 days ago', color: 'var(--green)' },
                ].map((log, i) => (
                  <tr key={i} style={{ borderBottom: i === 4 ? 'none' : '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#fff', fontWeight: 500 }}><EmojiIcon emoji="📁" className="inline" style={{ marginRight: 6 }} />{log.repo}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--gray)' }}>{log.msg}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, color: log.color, background: \`rgba(\${log.color === 'var(--green)' ? '52,211,153' : '248,113,113'}, 0.1)\`, padding: '4px 8px', borderRadius: 100 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: log.color }} />
                        {log.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--dim)' }}>{log.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      `;

const newContent = content.substring(0, startIndex) + newPageContent + content.substring(endIndex);
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Successfully updated dashboard!');

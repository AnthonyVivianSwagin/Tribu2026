import { useEffect, useState } from 'react'
import { Wallet } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import * as api from '../../api/mockApi'

export default function Payouts() {
  const { notify } = useApp()
  const [list, setList] = useState([])
  useEffect(() => { api.getMisc().then(m => setList(m.payouts)) }, [])
  return (
    <>
      <div className="a-head"><div><h1>Payouts</h1><p>Membership fees transferred to the club account</p></div></div>
      <div className="kpis" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="kpi"><span className="kpi-ic" style={{ background: '#efe8fd', color: '#9b6cf6' }}><Wallet size={22} /></span><div><span className="kpi-label">Available balance</span><span className="kpi-val">€0</span><span className="kpi-sub">Next payout 1 Nov</span></div></div>
        <div className="kpi"><span className="kpi-ic" style={{ background: '#dcf3e8', color: '#1f9d66' }}><Wallet size={22} /></span><div><span className="kpi-label">Paid out in 2026</span><span className="kpi-val">€{list.reduce((s, p) => s + p.amount, 0)}</span><span className="kpi-sub">{list.length} transfers</span></div></div>
      </div>
      <div className="a-card a-section scroll-x">
        <table className="table">
          <thead><tr><th>Date</th><th>Reference</th><th>Amount</th><th>Status</th><th /></tr></thead>
          <tbody>{list.map(p => (
            <tr key={p.id}><td>{new Date(p.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td><td>{p.ref}</td><td><b>€{p.amount}</b></td>
              <td><span className="status Published">{p.status}</span></td><td style={{ textAlign: 'right' }}><button className="see-all" onClick={() => notify('Receipt download is simulated in this demo')}>Receipt</button></td></tr>
          ))}</tbody>
        </table>
      </div>
    </>
  )
}

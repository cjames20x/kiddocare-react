import { Bell, Syringe } from 'lucide-react'
import DashboardSidebar from '../components/DashboardSidebar.jsx'

// Records will come from the admin/clinic side later.
const RECORDS = []

export default function Vaccinations() {
  return (
    <div className="dash-layout">
      <DashboardSidebar active="Vaccinations" />

      <main className="dash-main">
        <div className="dash-topbar">
          <h1 className="dash-title">VACCINATIONS</h1>
          <div className="dash-bell">
            <Bell size={20} />
            <span className="dash-bell-dot" />
          </div>
        </div>

        <section className="dash-panel">
          <h3>
            <Syringe size={20} /> Vaccination Records
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Vaccine</th>
                  <th>Date</th>
                  <th>Next Due</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {RECORDS.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="vax-empty">
                      No vaccination records yet. Records will appear here once the clinic logs them.
                    </td>
                  </tr>
                ) : (
                  RECORDS.map((row) => (
                    <tr key={`${row.vaccine}-${row.date}`}>
                      <td>{row.vaccine}</td>
                      <td>{row.date || '--------'}</td>
                      <td>{row.nextDue}</td>
                      <td>
                        <span className={`vax-status vax-status--${row.status.toLowerCase()}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}

import { useState } from 'react'
import { FileText, FileSpreadsheet, Eye, Download, Calendar, HardDrive, Lock, Menu } from 'lucide-react'
import DashboardSidebar from '../components/DashboardSidebar.jsx'

const DOCS = [
  { title: 'Child Behavioral Guidance Policy', type: 'PDF', date: 'Dec 2025', size: '1.2 mb' },
  { title: 'Allergy and Dietary Restriction Form', type: 'DOCX', date: 'Dec 2025', size: '1.4 mb' },
  { title: 'Child Progress Tracker', type: 'XLSX', date: 'Dec 2025', size: '3.6 mb' },
  { title: 'Medical Authorization & Emergency Contact', type: 'PDF', date: 'June 2025', size: '3.6 mb' },
  { title: 'Payment Authorization Form', type: 'DOCX', date: 'June 2025', size: '1.76 mb' },
  { title: 'Immunization/Vaccination Form', type: 'DOCX', date: 'June 2025', size: '4.6 mb' },
]

const TYPE_ICON = { PDF: FileText, DOCX: FileText, XLSX: FileSpreadsheet }

export default function Documents() {
  const [downloaded, setDownloaded] = useState(false)

  function handleDownload() {
    // TODO: replace with a real file download
    setDownloaded(true)
  }

  return (
    <div className="dash-layout">
      <DashboardSidebar active="Documents" />

      <main className="dash-main">
        <h1 className="dash-title">DOCUMENTS</h1>

        <div className={`dash-panel${downloaded ? ' is-blurred' : ''}`}>
          <div className="docs-toolbar">
            <div>
              <div className="docs-toolbar-title">All Documents</div>
              <div className="docs-toolbar-sub">{DOCS.length} documents available</div>
            </div>
            <div className="docs-toolbar-right">
              <span className="docs-sort">Sort by: Newest ▾</span>
              <Menu size={18} />
            </div>
          </div>

          <div className="docs-banner">
            <FileText size={20} />
            <div>
              <div className="docs-banner-title">2025 - 2026 Parent Handbook (Updated)</div>
              <div className="docs-banner-sub">Every family should get a copy of our latest school-wide health guidelines</div>
            </div>
            <button className="dash-add-btn" onClick={handleDownload}>
              <Download size={16} /> Download PDF
            </button>
          </div>

          <div className="docs-grid">
            {DOCS.map((doc) => {
              const Icon = TYPE_ICON[doc.type]
              return (
                <div className={`doc-card doc-card--${doc.type.toLowerCase()}`} key={doc.title}>
                  <div className="doc-card-top">
                    <Icon size={20} />
                    <div className="doc-card-top-right">
                      <Eye size={15} />
                      <span className={`doc-tag doc-tag--${doc.type.toLowerCase()}`}>{doc.type}</span>
                    </div>
                  </div>
                  <p className="doc-title">{doc.title}</p>
                  <div className="doc-meta">
                    <span><Calendar size={12} /> {doc.date}</span>
                    <span><HardDrive size={12} /> {doc.size}</span>
                    <Lock size={14} className="doc-lock" onClick={handleDownload} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>

      {downloaded && (
        <div className="confirm-overlay" onClick={() => setDownloaded(false)}>
          <div className="doc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="doc-modal-header">DOCUMENT</div>
            <div className="doc-modal-body">
              <div className="doc-success-icon">✓</div>
              <h3>Document Downloaded!</h3>
              <p>The document is downloaded successfully!</p>
              <button className="btn-primary" onClick={() => setDownloaded(false)}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
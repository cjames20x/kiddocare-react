import { useState } from 'react'
import { FileText, FileSpreadsheet, Eye, Download, Calendar, HardDrive, Menu, X } from 'lucide-react'
import DashboardSidebar from '../components/DashboardSidebar.jsx'

const DOCS = [
  {
    title: 'Child Behavioral Guidance Policy',
    type: 'PDF',
    date: 'Dec 2025',
    size: '1.2 mb',
    preview: 'Outlines our approach to positive behavior guidance, including redirection techniques, conflict resolution, and how staff communicate behavioral concerns with parents.',
  },
  {
    title: 'Allergy and Dietary Restriction Form',
    type: 'DOCX',
    date: 'Dec 2025',
    size: '1.4 mb',
    preview: "Lets parents list any food allergies or dietary restrictions so kitchen and classroom staff can plan meals and snacks safely around each child's needs.",
  },
  {
    title: 'Child Progress Tracker',
    type: 'XLSX',
    date: 'Dec 2025',
    size: '3.6 mb',
    preview: 'A running record of developmental milestones, learning activities, and monthly progress notes for each enrolled child.',
  },
  {
    title: 'Medical Authorization & Emergency Contact',
    type: 'PDF',
    date: 'June 2025',
    size: '3.6 mb',
    preview: 'Authorizes staff to seek emergency medical care and lists emergency contacts, physicians, and medical conditions to note.',
  },
  {
    title: 'Payment Authorization Form',
    type: 'DOCX',
    date: 'June 2025',
    size: '1.76 mb',
    preview: 'Sets up authorized payment methods and billing details for tuition, materials fees, and other program charges.',
  },
  {
    title: 'Immunization/Vaccination Form',
    type: 'DOCX',
    date: 'June 2025',
    size: '4.6 mb',
    preview: "Records each child's immunization history and upcoming vaccination schedule as required for enrollment.",
  },
]

const TYPE_ICON = { PDF: FileText, DOCX: FileText, XLSX: FileSpreadsheet }

// Dummy document preview popup — opened from either the card's eye icon
// or its "view" button. Shows a mock preview since there's no real file yet.
function DocumentPreviewModal({ doc, onClose, onDownload }) {
  if (!doc) return null
  const Icon = TYPE_ICON[doc.type]

  return (
    <div className="docview-overlay" onClick={onClose}>
      <div className="docview-modal" onClick={(e) => e.stopPropagation()}>
        <button className="docview-close" onClick={onClose} aria-label="Close">
          <X size={15} />
        </button>

        <div className="docview-header">
          <div className="docview-icon"><Icon size={22} /></div>
          <div>
            <div className="docview-title">{doc.title}</div>
            <div className="docview-sub">
              <span className={`doc-tag doc-tag--${doc.type.toLowerCase()}`}>{doc.type}</span>
              <span className="docview-meta-item"><Calendar size={12} /> {doc.date}</span>
              <span className="docview-meta-item"><HardDrive size={12} /> {doc.size}</span>
            </div>
          </div>
        </div>

        <div className="docview-page">
          <p className="docview-preview-text">{doc.preview}</p>
          <div className="docview-skeleton-line" style={{ width: '92%' }} />
          <div className="docview-skeleton-line" style={{ width: '85%' }} />
          <div className="docview-skeleton-line" style={{ width: '96%' }} />
          <div className="docview-skeleton-line" style={{ width: '70%' }} />
          <div className="docview-skeleton-line" style={{ width: '88%' }} />
        </div>

        <div className="docview-footer">
          <button type="button" className="docview-btn-outline" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="docview-btn-solid"
            onClick={() => {
              onDownload()
              onClose()
            }}
          >
            <Download size={15} /> Download
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Documents() {
  const [downloaded, setDownloaded] = useState(false)
  const [viewingDoc, setViewingDoc] = useState(null)

  function handleDownload() {
    // TODO: replace with a real file download
    setDownloaded(true)
  }

  return (
    <div className="dash-layout">
      <style>{`
        .doc-meta-actions { display: flex; align-items: center; gap: 10px; margin-left: auto; }
        .doc-view-icon, .doc-download-icon { cursor: pointer; color: #64748b; }
        .doc-view-icon:hover, .doc-download-icon:hover { color: var(--blue, #1c5d99); }
        .docview-overlay { position: fixed; inset: 0; background: rgba(15,23,42,.55); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .docview-modal { position: relative; width: 100%; max-width: 480px; max-height: 85vh; background: #fff; border-radius: 16px; overflow: hidden auto; box-shadow: 0 24px 60px rgba(15,23,42,.35); display: flex; flex-direction: column; animation: docviewPop .18s ease-out; }
        @keyframes docviewPop { from { transform: scale(.96); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .docview-close { position: absolute; top: 14px; right: 14px; width: 28px; height: 28px; border-radius: 50%; background: #f1f5f9; border: none; color: #64748b; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 1; }
        .docview-close:hover { background: #e2e8f0; }
        .docview-header { display: flex; align-items: flex-start; gap: 14px; padding: 24px 50px 18px 24px; border-bottom: 1px solid #e2e8f0; }
        .docview-icon { width: 44px; height: 44px; border-radius: 10px; background: #e0f2fe; color: var(--blue, #1c5d99); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .docview-title { font-size: 15px; font-weight: 700; color: #0f172a; line-height: 1.3; }
        .docview-sub { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 8px; }
        .docview-meta-item { display: flex; align-items: center; gap: 4px; font-size: 11.5px; color: #64748b; }
        .docview-page { margin: 20px 24px; padding: 18px 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; min-height: 160px; }
        .docview-preview-text { font-size: 13px; color: #334155; line-height: 1.55; margin: 0 0 14px; }
        .docview-skeleton-line { height: 8px; border-radius: 4px; background: #e2e8f0; margin-bottom: 9px; }
        .docview-skeleton-line:last-child { margin-bottom: 0; }
        .docview-footer { display: flex; gap: 10px; padding: 4px 24px 22px; }
        .docview-btn-outline { flex: 1; padding: 11px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: #fff; color: #475569; font-weight: 700; font-size: 14px; cursor: pointer; }
        .docview-btn-outline:hover { background: #f8fafc; }
        .docview-btn-solid { flex: 1; padding: 11px; border-radius: 10px; border: none; background: var(--blue, #1c5d99); color: #fff; font-weight: 700; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .docview-btn-solid:hover { filter: brightness(0.92); }
      `}</style>

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
                      <span className={`doc-tag doc-tag--${doc.type.toLowerCase()}`}>{doc.type}</span>
                    </div>
                  </div>
                  <p className="doc-title">{doc.title}</p>
                  <div className="doc-meta">
                    <span><Calendar size={12} /> {doc.date}</span>
                    <span><HardDrive size={12} /> {doc.size}</span>
                    <div className="doc-meta-actions">
                      <Eye
                        size={14}
                        className="doc-view-icon"
                        onClick={() => setViewingDoc(doc)}
                        aria-label={`View ${doc.title}`}
                      />
                      <Download
                        size={14}
                        className="doc-download-icon"
                        onClick={handleDownload}
                        aria-label={`Download ${doc.title}`}
                      />
                    </div>
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

      <DocumentPreviewModal
        doc={viewingDoc}
        onClose={() => setViewingDoc(null)}
        onDownload={handleDownload}
      />
    </div>
  )
}
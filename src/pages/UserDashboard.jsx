import { useState } from 'react';
import { Baby, CalendarCheck, UserPlus } from 'lucide-react';

function DashboardSidebarNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'child-info', label: 'Child Information', icon: Baby },
    { id: 'book-appointment', label: 'Book Appointments', icon: CalendarCheck },
    { id: 'register-child', label: 'Register Child', icon: UserPlus },
  ];

  return (
    <nav className="dash-nav">
      {tabs.map(({ id, label, icon: Icon }) => (
        <div
          key={id}
          className={`dash-nav-item${activeTab === id ? ' active' : ''}`}
          onClick={() => setActiveTab(id)}
        >
          <Icon size={20} />
          <span>{label}</span>
        </div>
      ))}
    </nav>
  )
}

export default DashboardSidebarNav;
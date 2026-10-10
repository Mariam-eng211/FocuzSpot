import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function TabBar() {
  const { t } = useTranslation();

  const tabs = [
    { to: '/', label: t('nav.home'), icon: '🏠' },
    { to: '/explore', label: t('nav.map'), icon: '🗺️' },
    { to: '/discover', label: t('nav.discover'), icon: '🔍' },
    { to: '/saved', label: t('nav.saved'), icon: '⭐' },
    { to: '/profile', label: t('nav.profile'), icon: '👤' },
  ];

  return (
    <nav className="tab-bar">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `tab-item ${isActive ? 'active' : ''}`
          }
          end={tab.to === '/'}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
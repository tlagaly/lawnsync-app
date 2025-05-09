import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './MainNavigationBar.css';

interface NavItem {
  path: string;
  label: string;
  icon: string; // We'll use string identifiers for icons for now
}

interface MainNavigationBarProps {
  activeSection?: string;
}

const navItems: NavItem[] = [
  { path: '/home', label: 'Home', icon: 'home' },
  { path: '/tasks-projects', label: 'Tasks & Projects', icon: 'tasks' },
  { path: '/assistant', label: 'AI Assistant', icon: 'assistant' },
  { path: '/my-lawn', label: 'My Lawn', icon: 'lawn' },
  { path: '/plant-identifier', label: 'Plant ID', icon: 'plant-id' }
];

const MainNavigationBar: React.FC<MainNavigationBarProps> = ({ activeSection }) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine if a nav item is active
  const isActive = (path: string) => {
    if (activeSection) {
      return path.includes(activeSection);
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className={`main-nav ${isMobile ? 'mobile' : 'desktop'}`}>
      {isMobile ? (
        <div className="mobile-nav">
          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className={`icon ${item.icon}`}></span>
              <span className="label">{item.label}</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="desktop-nav">
          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className={`icon ${item.icon}`}></span>
              <span className="label">{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default MainNavigationBar;
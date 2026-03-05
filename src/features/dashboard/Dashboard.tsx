import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import styles from './Dashboard.module.scss';
import Sidebar from './Sidebar';
import { useSettings } from '../../context/SettingsContext';

const Dashboard: React.FC = () => {
    const { settings } = useSettings();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div className={`${styles.dashboardContainer} ${isCollapsed ? styles.sidebarCollapsed : ''}`}>
            {isMobileOpen && (
                <div 
                    className={styles.sidebarOverlay} 
                    onClick={() => setIsMobileOpen(false)} 
                />
            )}
            
            <Sidebar 
                isCollapsed={isCollapsed} 
                onToggle={() => setIsCollapsed(!isCollapsed)} 
                isMobileOpen={isMobileOpen}
                onMobileClose={() => setIsMobileOpen(false)}
            />

            <main className={styles.main}>
                {/* Mobile Header */}
                <header className={styles.mobileHeader}>
                    <div className={styles.brand}>
                        <span className="material-symbols-outlined" style={{ color: '#e29d12' }}>diamond</span>
                        <span style={{ color: 'white', fontWeight: 'bold' }}>{settings.name}</span>
                    </div>
                    <button 
                        style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}
                        onClick={() => setIsMobileOpen(true)}
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                </header>

                <div className={styles.contentContainer}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Dashboard;

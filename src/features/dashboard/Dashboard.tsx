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
                <button 
                    className={styles.sidebarOverlay} 
                    onClick={() => setIsMobileOpen(false)} 
                    aria-label="Close sidebar"
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
                        <span className={`material-symbols-outlined ${styles.brandIcon}`}>diamond</span>
                        <span className={styles.brandName}>{settings.name}</span>
                    </div>
                    <button 
                        className={styles.menuButton}
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

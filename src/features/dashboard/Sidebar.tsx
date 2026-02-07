import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Dashboard.module.scss';
import { useRates } from '../../context/RateContext';
import { useSettings } from '../../context/SettingsContext';
import RateUpdater from '../tools/RateUpdater';

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
    const { rates } = useRates();
    const { settings } = useSettings();
    const [isRateModalOpen, setIsRateModalOpen] = useState(false);

    const navItems = [
        { name: 'Dashboard', icon: 'dashboard', path: '/dashboard', end: true },
        { name: 'Order Management', icon: 'shopping_cart', path: '/dashboard/orders' },
        { name: 'Inventory', icon: 'inventory_2', path: '/dashboard/inventory' },
        { name: 'Billing', icon: 'point_of_sale', path: '/dashboard/billing' },
        { name: 'Cost Estimator', icon: 'receipt_long', path: '/dashboard/estimator' },
        { name: 'Customers', icon: 'group', path: '/dashboard/customers' },
        { name: 'Reports', icon: 'bar_chart', path: '/dashboard/reports' },
    ];

    const managementItems = [
        { name: 'Settings', icon: 'settings', path: '/dashboard/settings' },
        // { name: 'Help Center', icon: 'help', path: '/dashboard/help' },
    ];

    return (
        <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
            <div className={styles.sidebarContent}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
                    {/* Brand */}
                    <div className={styles.brandWrapper}>
                        <div className={styles.brand}>
                            <div className={styles.brandIcon}>
                                <span className="material-symbols-outlined">diamond</span>
                            </div>
                            {!isCollapsed && (
                                <div className={styles.brandText}>
                                    <h1>{settings.name}</h1>
                                    <p>Admin Dashboard</p>
                                </div>
                            )}
                        </div>
                        <button className={styles.toggleBtn} onClick={onToggle}>
                            <span className="material-symbols-outlined">
                                {isCollapsed ? 'menu' : 'menu_open'}
                            </span>
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className={styles.nav}>
                        {navItems.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                end={item.end}
                                className={({ isActive }) => 
                                    `${styles.navLink} ${isActive ? styles.active : ''}`
                                }
                            >
                                <span className={`material-symbols-outlined ${styles.icon}`} title={item.name}>
                                    {item.icon}
                                </span>
                                {!isCollapsed && <span>{item.name}</span>}
                            </NavLink>
                        ))}
                    </nav>

                    <div className={styles.divider}></div>

                    <nav className={styles.nav}>
                        {!isCollapsed && <p className={styles.sectionTitle}>Management</p>}
                        {managementItems.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                className={({ isActive }) => 
                                    `${styles.navLink} ${isActive ? styles.active : ''}`
                                }
                            >
                                <span className={`material-symbols-outlined ${styles.icon}`} title={item.name}>
                                    {item.icon}
                                </span>
                                {!isCollapsed && <span>{item.name}</span>}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* Live Rates Widget */}
                <div className={styles.ratesWidget} style={{ 
                    marginBottom: '1rem', 
                    padding: '1rem', 
                    backgroundColor: 'rgba(226, 157, 18, 0.1)', 
                    borderRadius: '0.5rem',
                    border: '1px solid #4a4030'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e29d12', textTransform: 'uppercase' }}>Today's Rates</span>
                        <button 
                            onClick={() => setIsRateModalOpen(true)}
                            style={{ background: 'none', border: 'none', color: '#e29d12', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}
                        >
                            Update
                        </button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                        <span style={{ color: '#b9b09d' }}>Gold (22k)</span>
                        <span style={{ color: 'white', fontWeight: 600 }}>₹{rates.gold22k.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        <span style={{ color: '#b9b09d' }}>Silver</span>
                        <span style={{ color: 'white', fontWeight: 600 }}>₹{rates.silver.toLocaleString('en-IN')}</span>
                    </div>
                </div>

                {/* User Profile */}
                <div className={styles.userProfile}>
                    <div className={styles.profileCard}>
                        <div className={styles.avatar}>
                            <img
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzQYHy0QnIT1t3iXevWaMdHkHWqMfgh9IR37AuoQ8TA6VI7PbVmUa61-W4Yc9p6Ugc7froH_YIGcsgsXdrEP2Q-GME5s-XypdkX0iQZjzFTIsuW-clLYTIirVw6aDzs3syfpYCx4hDRlF7WV8ZUJJX5W1KoZ_CYqLzXlJqwPuAs22-jr6q6AKGD3gieWG_HaheSkW-XrE-jGGcxBW3JnlrK4UWAWREb2uVIDfSVhiFNQHukm0011G8id5SDcHrrOM2FVF-GoidlMlL"
                                alt="Admin User"
                            />
                            <div className={styles.status}></div>
                        </div>
                     {!isCollapsed ? (
                        <>
                            <div className={styles.userInfo}>
                                <span className={styles.userName}>Venkadesh</span>
                                <span className={styles.userRole}>Owner</span>
                            </div>
                            <span className="material-symbols-outlined" style={{ marginLeft: 'auto', color: '#b9b09d' }}>
                                expand_more
                            </span>
                        </>
                    ) : (
                        <div className={styles.avatarOverlay}>
                             <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#b9b09d' }}>expand_less</span>
                        </div>
                    )}
                    </div>
                </div>
            </div>
            
            <RateUpdater isOpen={isRateModalOpen} onClose={() => setIsRateModalOpen(false)} />
        </aside>
    );
};

export default Sidebar;

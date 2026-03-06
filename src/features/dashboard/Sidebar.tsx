import React, { useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames';
import styles from './Dashboard.module.scss';
import { useRates } from '../../context/RateContext';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import RateUpdater from '../tools/RateUpdater';
import adminImg from '../../assets/adminimg.png';

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
    isMobileOpen?: boolean;
    onMobileClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle, isMobileOpen, onMobileClose }) => {
    const { rates, getTrend } = useRates();
    const { settings } = useSettings();
    const { user, logout } = useAuth();
    const [isRateModalOpen, setIsRateModalOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const sidebarRef = useRef<HTMLElement>(null);

    const handleProfileClick = () => {
        const newState = !isProfileDropdownOpen;
        setIsProfileDropdownOpen(newState);
        
        if (newState) {
            // Give it a tiny delay to allow the dropdown to start rendering
            setTimeout(() => {
                if (sidebarRef.current) {
                    sidebarRef.current.scrollTo({
                        top: sidebarRef.current.scrollHeight,
                        behavior: 'smooth'
                    });
                }
            }, 50);
        }
    };

    const goldTrend = getTrend(rates.gold22k, rates.previous?.gold22k);
    const silverTrend = getTrend(rates.silver, rates.previous?.silver);

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
        <aside 
            ref={sidebarRef}
            className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''} ${isMobileOpen ? styles.mobileOpen : ''}`}
        >
            <div className={styles.sidebarContent}>

                <div className={styles.mainNavSection}>
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
                        <button 
                            className={styles.toggleBtn} 
                            onClick={isMobileOpen && onMobileClose ? onMobileClose : onToggle}
                        >
                            <span className="material-symbols-outlined">
                                {isMobileOpen ? 'close' : (isCollapsed ? 'menu' : 'menu_open')}
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
                                onClick={() => { if (isMobileOpen && onMobileClose) onMobileClose(); }}
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
                                onClick={() => { if (isMobileOpen && onMobileClose) onMobileClose(); }}
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
                <div className={styles.ratesWidget}>
                    <div className={styles.ratesHeader}>
                        <span className={styles.ratesTitle}>Today's Rates</span>
                        <button
                            onClick={() => setIsRateModalOpen(true)}
                            className={styles.ratesUpdateBtn}
                        >
                            Update
                        </button>
                    </div>
                    <div className={styles.rateItem}>
                        <span className={styles.rateLabel}>Gold (22k)</span>
                        <div className={styles.rateValueGroup}>
                            <span className={styles.rateValue}>₹{rates.gold22k.toLocaleString('en-IN')}</span>
                            <span className={classNames(
                                styles.trendIconWrapper,
                                goldTrend.direction === 'up' ? styles.up : goldTrend.direction === 'down' ? styles.down : styles.stable
                            )}>
                                <span className="material-symbols-outlined">
                                    {goldTrend.direction === 'up' ? 'trending_up' : goldTrend.direction === 'down' ? 'trending_down' : 'remove'}
                                </span>
                            </span>
                        </div>
                    </div>
                    <div className={styles.rateItem}>
                        <span className={styles.rateLabel}>Silver</span>
                        <div className={styles.rateValueGroup}>
                            <span className={styles.rateValue}>₹{rates.silver.toLocaleString('en-IN')}</span>
                            <span className={classNames(
                                styles.trendIconWrapper,
                                silverTrend.direction === 'up' ? styles.up : silverTrend.direction === 'down' ? styles.down : styles.stable
                            )}>
                                <span className="material-symbols-outlined">
                                    {silverTrend.direction === 'up' ? 'trending_up' : silverTrend.direction === 'down' ? 'trending_down' : 'remove'}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* User Profile */}
                <div className={styles.userProfile}>
                    <button
                        className={styles.profileCard}
                        onClick={handleProfileClick}
                        aria-expanded={isProfileDropdownOpen}
                        aria-haspopup="true"
                    >
                        <div className={styles.avatar}>
                            <img
                                src={adminImg}
                                alt="Admin User"
                            />
                            <div className={styles.status}></div>
                        </div>
                        {isCollapsed ? (
                            <div className={styles.avatarOverlay}>
                                <span className="material-symbols-outlined">expand_less</span>
                            </div>
                        ) : (
                            <>
                                <div className={styles.userInfo}>
                                    <span className={styles.userName}>{user?.username || 'Venkadesh'}</span>
                                    <span className={styles.userRole}>Owner</span>
                                </div>
                                <span className={classNames("material-symbols-outlined", styles.expandIcon)}>
                                    {isProfileDropdownOpen ? 'expand_less' : 'expand_more'}
                                </span>
                            </>
                        )}
                    </button>

                    {/* Logout Dropdown */}
                    {isProfileDropdownOpen && (
                        <div className={classNames(styles.logoutMenu, isCollapsed && styles.collapsedMenu)}>
                            <button className={`${styles.actionItem} ${styles.deleteAction}`} onClick={logout}>
                                <span className="material-symbols-outlined">logout</span>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <RateUpdater isOpen={isRateModalOpen} onClose={() => setIsRateModalOpen(false)} />
        </aside>
    );
};

export default Sidebar;

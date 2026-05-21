import React, { useState, useRef } from 'react';
import classNames from 'classnames';
import styles from './Settings.module.scss';
import { useToast } from '../../context/ToastContext';
import { useSettings } from '../../context/SettingsContext';
import PasswordChangeModal from './PasswordChangeModal';

const Settings: React.FC = () => {
    const { showToast } = useToast();
    const { settings, updateSettings } = useSettings();
    const [activeTab, setActiveTab] = useState('general');
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    
    // Form State
    const [formState, setFormState] = useState(settings);

    const shopNameRef = useRef<HTMLInputElement>(null);
    const locationRef = useRef<HTMLInputElement>(null);


    const handleSave = () => {
        if (!formState.name) {
            showToast('Shop Name is required.', 'error');
            setActiveTab('general');
            setTimeout(() => {
                shopNameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                shopNameRef.current?.focus();
            }, 100);
            return;
        }

        if (!formState.location) {
            showToast('Location is required.', 'error');
            setActiveTab('general');
            setTimeout(() => {
                locationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                locationRef.current?.focus();
            }, 100);
            return;
        }

        updateSettings(formState);
        showToast('Settings saved successfully', 'success');
    };

    const handleDiscard = () => {
        setFormState(settings);
        showToast('Changes discarded', 'info');
    };

    return (
        <div className={styles.settingsContainer}>
            {/* Page Heading */}
            <div className={styles.header}>
                <h1>Business Settings</h1>
                <p>Manage your jewellery shop information, security, and notification preferences.</p>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                {[
                    { id: 'general', label: 'General Information' },
                    { id: 'security', label: 'Account Security' },
                    { id: 'notifications', label: 'Notifications' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        className={classNames(styles.tab, activeTab === tab.id && styles.active)}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className={styles.content}>
                {/* General Information Section */}
                {activeTab === 'general' && (
                    <section className={styles.section} id="general">
                        <h2 className={styles.sectionTitle}>General Information</h2>
                        <div className={classNames(styles.card, styles.grid)}>
                            <div className={styles.fieldGroup}>
                                <label>Shop Name</label>
                                <input 
                                    ref={shopNameRef}
                                    type="text" 
                                    value={formState.name}
                                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                />
                            </div>
                            <div className={styles.fieldGroup}>
                                <label>Location</label>
                                <input 
                                    ref={locationRef}
                                    type="text" 
                                    value={formState.location}
                                    onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                                />
                            </div>
                            <div className={styles.fieldGroup}>
                                <label>GST Number</label>
                                <input 
                                    type="text" 
                                    value={formState.gstNo}
                                    onChange={(e) => setFormState({ ...formState, gstNo: e.target.value })}
                                />
                            </div>
                            <div className={styles.fieldGroup}>
                                <label>Email ID</label>
                                <input 
                                    type="email" 
                                    value={formState.email}
                                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                                />
                            </div>
                            <div className={styles.fieldGroup}>
                                <label>Contact Number</label>
                                <input 
                                    type="text" 
                                    value={formState.contact}
                                    onChange={(e) => setFormState({ ...formState, contact: e.target.value })}
                                />
                            </div>
                            <div className={classNames(styles.fieldGroup, styles.fullWidth)}>
                                <label>Complete Address</label>
                                <textarea 
                                    rows={3}
                                    value={formState.address}
                                    onChange={(e) => setFormState({ ...formState, address: e.target.value })}
                                />
                            </div>
                        </div>
                    </section>
                )}

                {/* Account Security Section */}
                {activeTab === 'security' && (
                    <section className={styles.section} id="security">
                        <h2 className={styles.sectionTitle}>Account Security</h2>
                        <div className={styles.card}>
                            <div className={styles.securityItem}>
                                <div className={styles.info}>
                                    <p>Change Password</p>
                                    <p>Last changed 3 months ago</p>
                                </div>
                                <button className={styles.updateBtn} onClick={() => setIsPasswordModalOpen(true)}>
                                    Update
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {/* Notifications Section */}
                {activeTab === 'notifications' && (
                    <section className={styles.section} id="notifications">
                        <h2 className={styles.sectionTitle}>Notification Preferences</h2>
                        <div className={classNames(styles.card, styles.flexCol)}>
                            <div className={styles.notificationItem}>
                                <div className={styles.content}>
                                    <span className="material-symbols-outlined icon">warning</span>
                                    <div className={styles.details}>
                                        <p>Low Stock Alerts</p>
                                        <p>Notify when inventory falls below threshold</p>
                                    </div>
                                </div>
                                <input 
                                    type="checkbox" 
                                    className={styles.checkbox}
                                    checked={formState.notifications?.lowStock}
                                    onChange={(e) => setFormState({
                                        ...formState,
                                        notifications: { ...formState.notifications, lowStock: e.target.checked }
                                    })}
                                />
                            </div>
                            <div className={styles.notificationItem} style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(84, 75, 59, 0.5)' }}>
                                <div className={styles.content}>
                                    <span className="material-symbols-outlined icon">trending_up</span>
                                    <div className={styles.details}>
                                        <p>Market Price Alerts</p>
                                        <p>Alert on 2% fluctuation in Gold/Silver market prices</p>
                                    </div>
                                </div>
                                <input 
                                    type="checkbox" 
                                    className={styles.checkbox}
                                    checked={formState.notifications?.marketAlerts}
                                    onChange={(e) => setFormState({
                                        ...formState,
                                        notifications: { ...formState.notifications, marketAlerts: e.target.checked }
                                    })}
                                />
                            </div>
                            <div className={styles.notificationItem} style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(84, 75, 59, 0.5)' }}>
                                <div className={styles.content}>
                                    <span className="material-symbols-outlined icon">mail</span>
                                    <div className={styles.details}>
                                        <p>Daily Sales Summary</p>
                                        <p>Receive an email report at the end of each business day</p>
                                    </div>
                                </div>
                                <input 
                                    type="checkbox" 
                                    className={styles.checkbox}
                                    checked={formState.notifications?.dailySummary}
                                    onChange={(e) => setFormState({
                                        ...formState,
                                        notifications: { ...formState.notifications, dailySummary: e.target.checked }
                                    })}
                                />
                            </div>
                        </div>
                    </section>
                )}
            </div>

            {/* Sticky Bottom Bar */}
            <footer className={styles.stickyFooter}>
                <div className={styles.footerContent}>
                    <p className={styles.warning}>Unsaved changes will be lost if you leave this page.</p>
                    <div className={styles.actions}>
                        <button className={styles.discard} onClick={handleDiscard}>Discard</button>
                        <button className={styles.save} onClick={handleSave}>Save Changes</button>
                    </div>
                </div>
            </footer>
            <PasswordChangeModal 
                isOpen={isPasswordModalOpen} 
                onClose={() => setIsPasswordModalOpen(false)} 
            />
        </div>
    );
};

export default Settings;

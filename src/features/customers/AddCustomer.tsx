import React, { useState, useRef } from 'react';
import styles from './AddCustomer.module.scss';
import type { Customer } from '../../types/Customer';
import { Button, Input, FormSelect } from '../../components/common';
import { useToast } from '../../context/ToastContext';

interface AddCustomerProps {
    initialData?: Customer;
    onBack: () => void;
    onSave: (customer: Customer) => void;
}

interface Phone {
    number: string;
    type: string;
}

const AddCustomer: React.FC<AddCustomerProps> = ({ initialData, onBack, onSave }) => {
    console.log('AddCustomer mounted', { initialData });
    const { showToast } = useToast();
    const nameInputRef = useRef<HTMLInputElement>(null);
    const isEditing = !!initialData;
    const [phones, setPhones] = useState<Phone[]>(
        initialData?.phone
            ? [{ number: initialData.phone, type: 'Mobile' }]
            : [{ number: '', type: 'Mobile' }]
    );
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        dob: '',
        email: initialData?.email || '',
        address: '',
        city: '',
        state: '',
        zip: '',
        billingSame: true,
        loyaltyMember: true,
        material: 'Both'
    });

    const handleAddPhone = () => {
        setPhones([...phones, { number: '', type: 'Mobile' }]);
    };

    const handlePhoneChange = (index: number, field: keyof Phone, value: string) => {
        const newPhones = [...phones];
        newPhones[index] = { ...newPhones[index], [field]: value };
        setPhones(newPhones);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name) {
            showToast('Customer name is required.', 'error');
            nameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => nameInputRef.current?.focus(), 500);
            return;
        }

        const customerData: Customer = {
            id: initialData?.id || 'CUST-' + Math.floor(1000 + Math.random() * 9000),
            name: formData.name,
            email: formData.email,
            phone: phones[0].number || initialData?.phone || '',
            joinedDate: initialData?.joinedDate || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            totalSpend: initialData?.totalSpend || 0,
            transactionCount: initialData?.transactionCount || 0,
            lastVisit: initialData?.lastVisit || 'Never',
            avatar: initialData?.avatar
        };

        showToast(
            isEditing ? 'Customer profile updated successfully.' : 'New customer profile created.',
            'success'
        );
        onSave(customerData);
    };

    return (
        <div className={styles.container}>
            {/* Breadcrumbs */}
            <nav className={styles.breadcrumbs}>
                <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>Dashboard</a>
                <span>/</span>
                <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>Customers</a>
                <span>/</span>
                <span className={styles.current}>{isEditing ? 'Edit Profile' : 'New Profile'}</span>
            </nav>

            {/* Header */}
            <div className={styles.pageHeader}>
                <div className={styles.titleBlock}>
                    <h1>{isEditing ? 'Edit Customer Profile' : 'New Customer Profile'}</h1>
                    <p>{isEditing ? 'Update the personal and contact information for this client.' : 'Enter the personal and contact information for the new client.'}</p>
                </div>
                {/* <Button variant="secondary" icon="upload_file">
                    Import CSV
                </Button> */}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className={styles.form}>
                {/* Section 1: Personal */}
                <div className={styles.formSection}>
                    <div className={styles.sectionInfo}>
                        <h3>Personal Identity</h3>
                        <p>Basic identification details required for invoicing and legal compliance.</p>
                    </div>
                    <div className={styles.sectionFields}>
                        <Input
                            ref={nameInputRef}
                            label="Full Name"
                            name="name"
                            placeholder="e.g. Eleanor Rigby"
                            value={formData.name}
                            onChange={handleChange}
                            icon="person"
                            required
                            className={styles.spanFull}
                        />
                        <Input
                            label="Date of Birth"
                            name="dob"
                            type="date"
                            value={formData.dob}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <hr className={styles.divider} />

                {/* Section 2: Contact */}
                <div className={styles.formSection}>
                    <div className={styles.sectionInfo}>
                        <h3>Contact Information</h3>
                        <p>Reachability for order updates and promotional offers.</p>
                    </div>
                    <div className={`${styles.sectionFields} ${styles.fullWidth}`}>
                        <Input
                            label="Email Address"
                            name="email"
                            type="email"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            icon="mail"
                            required
                        />
                        <div className={styles.formGroup}>
                            <label>Phone Number(s)</label>
                            <div className={styles.phoneList}>
                                {phones.map((phone: Phone, index: number) => (
                                    <div key={index} className={styles.phoneRow}>
                                        <Input
                                            type="tel"
                                            placeholder="+91 00000 00000"
                                            value={phone.number}
                                            onChange={(e) => handlePhoneChange(index, 'number', e.target.value)}
                                            icon="call"
                                            className="flex-1"
                                        />
                                        <FormSelect
                                            value={phone.type}
                                            options={[
                                                { label: 'Mobile', value: 'Mobile' },
                                                { label: 'Home', value: 'Home' },
                                                { label: 'Work', value: 'Work' }
                                            ]}
                                            onChange={(val) => handlePhoneChange(index, 'type', val)}
                                            className={styles.phoneTypeSelect}
                                        />
                                    </div>
                                ))}
                                <Button type="button" variant="ghost" icon="add" onClick={handleAddPhone} className={styles.addPhoneBtn}>
                                    Add another number
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <hr className={styles.divider} />

                {/* Section 3: Address */}
                <div className={styles.formSection}>
                    <div className={styles.sectionInfo}>
                        <h3>Shipping & Billing</h3>
                        <p>Primary residence or business location for deliveries.</p>
                    </div>
                    <div className={styles.sectionFields}>
                        <Input
                            label="Street Address"
                            name="address"
                            placeholder="1234 Gold Leaf Blvd, Suite 100"
                            value={formData.address}
                            onChange={handleChange}
                            className={styles.spanFull}
                        />
                        <Input
                            label="City"
                            name="city"
                            placeholder="New York"
                            value={formData.city}
                            onChange={handleChange}
                        />
                        <div className={styles.row}>
                            <Input
                                label="State"
                                name="state"
                                placeholder="NY"
                                value={formData.state}
                                onChange={handleChange}
                            />
                            <Input
                                label="Zip Code"
                                name="zip"
                                placeholder="10001"
                                value={formData.zip}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={`${styles.formGroup} ${styles.spanFull} mt-2`}>
                            <label className={styles.toggleSwitch}>
                                <input
                                    name="billingSame"
                                    type="checkbox"
                                    checked={formData.billingSame}
                                    onChange={handleChange}
                                />
                                <div className={styles.slider}></div>
                                <span className={styles.label}>Billing address same as shipping</span>
                            </label>
                        </div>
                    </div>
                </div>

                <hr className={styles.divider} />


                {/* Action Bar */}
                <div className={styles.actionBar}>
                    <Button type="button" variant="outline" onClick={onBack}>Cancel</Button>
                    <Button type="submit" variant="primary" icon="save">
                        {isEditing ? 'Update Customer' : 'Save Customer'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AddCustomer;

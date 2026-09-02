import React, { useState } from 'react';
import styles from './ExportReportModal.module.scss';
import { Button } from '../../components/common';
import { useInventory } from '../../context/InventoryContext';
import { useRates } from '../../context/RateContext';

interface ExportReportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ExportReportModal: React.FC<ExportReportModalProps> = ({ isOpen, onClose }) => {
    const { products } = useInventory();
    const { rates } = useRates();
    const [reportType, setReportType] = useState<'All' | 'Gold' | 'Silver'>('All');
    const [isExporting, setIsExporting] = useState(false);

    if (!isOpen) return null;

    const generateCSV = () => {
        setIsExporting(true);
        
        // Filter products based on selection
        const filteredProducts = products.filter(p => {
            if (reportType === 'All') return true;
            const material = (p.material || '').toLowerCase();
            return material.includes(reportType.toLowerCase());
        });

        // Calculate Totals for Header
        const totalWeight = filteredProducts.reduce((sum, p) => sum + (p.weight * (p.quantity || 0)), 0);
        
        // CSV Headers
        const headers = ['SKU', 'Product Name', 'Category', 'Material', 'Purity', 'Weight (g)', 'Quantity', 'Status', 'Estimated Value (₹)'];
        
        // Data Rows
        const rows = filteredProducts.map(p => {
            const material = (p.material || '').toLowerCase();
            let rate = 0;
            if (material.includes('gold')) {
                rate = material.includes('24k') ? rates.gold24k : rates.gold22k;
            } else if (material.includes('silver')) {
                rate = rates.silver;
            }
            
            const wastage = p.wastagePercent || 0;
            const itemValue = ((p.weight * (1 + wastage / 100)) * rate) + ((p.makingCharge || 0) * p.weight) + (p.stoneCost || 0);
            const totalValue = itemValue * (p.quantity || 0);

            return [
                p.sku,
                `"${p.name}"`,
                p.category,
                p.material,
                p.purity || '',
                p.weight,
                p.quantity,
                p.status,
                totalValue.toFixed(2)
            ];
        });

        // Combine into CSV string
        const titleRow = [`VGH JEWELLERS - ${reportType.toUpperCase()} STOCK REPORT`];
        const dateRow = [`Generated on: ${new Date().toLocaleString()}`];
        const summaryRow = [`Total Items: ${filteredProducts.length}`, `Total Weight: ${totalWeight.toFixed(3)}g`];
        
        const csvContent = [
            titleRow.join(','),
            dateRow.join(','),
            summaryRow.join(','),
            '',
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `VGH_Inventory_Report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        setTimeout(() => {
            setIsExporting(false);
            onClose();
        }, 500);
    };

    return (
        <div className={styles.overlay}>
            <button 
                type="button" 
                className={styles.backdrop} 
                onClick={onClose} 
                aria-label="Close modal backdrop" 
            />
            <div 
                className={styles.modal} 
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <div className={styles.header}>
                    <h2 id="modal-title">Export Inventory Report</h2>
                    <button type="button" onClick={onClose} className={styles.closeBtn}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className={styles.body}>
                    <p className={styles.description}>
                        Select the type of inventory you want to export. The report will be downloaded as a CSV file compatible with Excel and Google Sheets.
                    </p>

                    <div className={styles.options}>
                        <button 
                            className={`${styles.optionCard} ${reportType === 'All' ? styles.active : ''}`}
                            onClick={() => setReportType('All')}
                        >
                            <span className="material-symbols-outlined">inventory_2</span>
                            <div className={styles.optionInfo}>
                                <h3>All Items</h3>
                                <p>Full catalog report</p>
                            </div>
                        </button>

                        <button 
                            className={`${styles.optionCard} ${reportType === 'Gold' ? styles.active : ''}`}
                            onClick={() => setReportType('Gold')}
                        >
                            <span className="material-symbols-outlined">workspace_premium</span>
                            <div className={styles.optionInfo}>
                                <h3>Gold Collection</h3>
                                <p>Only gold items</p>
                            </div>
                        </button>

                        <button 
                            className={`${styles.optionCard} ${reportType === 'Silver' ? styles.active : ''}`}
                            onClick={() => setReportType('Silver')}
                        >
                            <span className="material-symbols-outlined">diamond</span>
                            <div className={styles.optionInfo}>
                                <h3>Silver Collection</h3>
                                <p>Only silver items</p>
                            </div>
                        </button>
                    </div>
                </div>

                <div className={styles.footer}>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button 
                        variant="primary" 
                        onClick={generateCSV}
                        loading={isExporting}
                        icon="file_download"
                    >
                        {isExporting ? 'Generating...' : 'Download Report'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ExportReportModal;

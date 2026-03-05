import React, { useState } from 'react';
import classNames from 'classnames';
import styles from '../dashboard/Dashboard.module.scss';
import { Button, Badge } from '../../components/common';
import { useInventory } from '../../context/InventoryContext';

import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

interface InventoryTableProps {
    initialStatusFilter?: 'All' | 'Low Stock' | 'Out of Stock' | 'Alerts';
}

const InventoryTable: React.FC<InventoryTableProps> = ({ initialStatusFilter = 'All' }) => {
    const navigate = useNavigate();
    const { products, deleteProduct } = useInventory();
    const { showToast } = useToast();
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'All' | 'Gold' | 'Silver'>('All');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Low Stock' | 'Out of Stock' | 'Alerts'>(initialStatusFilter);
    const [categoryFilter, setCategoryFilter] = useState<string>('All');
    const [sortBy, setSortBy] = useState<string>('date-desc');
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const controlsRef = React.useRef<HTMLDivElement>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Handle click outside to close menus
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (controlsRef.current && !controlsRef.current.contains(target)) {
                setShowSortMenu(false);
                setShowFilterMenu(false);
            }
            if (!target.closest(`.${styles.actionMenuWrapper}`)) {
                setOpenMenuId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    // Reset to page 1 when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchQuery, statusFilter, categoryFilter, sortBy]);

    // Sync statusFilter if prop changes (optional but good for dashboard interaction)
    React.useEffect(() => {
        setStatusFilter(initialStatusFilter);
    }, [initialStatusFilter]);
    
    // Get unique categories for filter
    const categories = ['All', ...new Set(products.map(p => p.category))];
    
    // Filter and Sort products
    const filteredProducts = products
        .filter(product => {
            const matchesTab =
                activeTab === 'All' ? true :
                    activeTab === 'Gold' ? product.material.includes('Gold') :
                        activeTab === 'Silver' ? product.material.includes('Silver') : true;

            const matchesStatus = 
                statusFilter === 'All' ? true :
                statusFilter === 'Alerts' ? (product.status === 'Low Stock' || product.status === 'Out of Stock') :
                product.status === statusFilter;

            const matchesCategory = categoryFilter === 'All' ? true : product.category === categoryFilter;

            const matchesSearch =
                (product.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (product.sku || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (product.category || '').toLowerCase().includes(searchQuery.toLowerCase());

            return matchesTab && matchesStatus && matchesCategory && matchesSearch;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'date-asc':
                    return new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
                case 'date-desc':
                    return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
                case 'weight-asc':
                    return a.weight - b.weight;
                case 'weight-desc':
                    return b.weight - a.weight;
                default:
                    return 0;
            }
        });

    // Pagination Logic
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredProducts.slice(startIndex, startIndex + itemsPerPage);
    const endIndex = Math.min(startIndex + itemsPerPage, filteredProducts.length);

    const getBadgeVariant = (material: string): 'gold' | 'silver' => {
        if (material.includes('Gold')) return 'gold';
        return 'silver';
    };

    const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' => {
        switch (status) {
            case 'In Stock': return 'success';
            case 'Low Stock': return 'warning';
            case 'Out of Stock': return 'danger';
            default: return 'success';
        }
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this item?')) {
            deleteProduct(id);
            setOpenMenuId(null);
            showToast('Product deleted successfully', 'success');
        }
    };

    const handleEdit = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        // Pass state to ItemDetail to trigger edit mode
        navigate(`/dashboard/inventory/${id}`, { state: { edit: true } });
        setOpenMenuId(null);
    };

    return (
        <div className={styles.interfaceContainer}>
            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'All' ? styles.active : ''}`}
                    onClick={() => setActiveTab('All')}
                >
                    <p>All Items</p>
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'Gold' ? styles.active : ''}`}
                    onClick={() => setActiveTab('Gold')}
                >
                    <p>Gold Collection</p>
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'Silver' ? styles.active : ''}`}
                    onClick={() => setActiveTab('Silver')}
                >
                    <p>Silver Collection</p>
                </button>
            </div>

            {/* Active Filters Display */}
            {statusFilter !== 'All' && (
                <div style={{ 
                    margin: '0 0 1.5rem 0', 
                    padding: '0.75rem 1rem', 
                    backgroundColor: 'rgba(226, 157, 18, 0.1)', 
                    border: '1px solid rgba(226, 157, 18, 0.3)', 
                    borderRadius: '0.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span style={{ color: '#e29d12', fontSize: '0.875rem', fontWeight: 600 }}>
                         Showing: {statusFilter === 'Alerts' ? 'Low Stock & Out of Stock' : statusFilter} items
                    </span>
                    <button 
                        onClick={() => setStatusFilter('All')}
                        style={{ background: 'none', border: 'none', color: '#e29d12', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem' }}
                    >
                        Clear Filter
                    </button>
                </div>
            )}

            {/* Controls Bar */}
            <div className={styles.controlsBar} ref={controlsRef}>
                {/* Search */}
                <div className={styles.searchWrapper}>
                    <div className={styles.searchIcon}>
                        <span className="material-symbols-outlined">search</span>
                    </div>
                    <input
                        type="text"
                        placeholder="Search by SKU, Name, or Category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Filters */}
                <div className={styles.filterActions}>
                    <Button variant="primary" icon="add" onClick={() => navigate('/dashboard/inventory/add')}>
                        Add Item
                    </Button>

                    {/* Filter Dropdown */}
                    <div className={styles.dropdownContainer}>
                        <Button 
                            variant="secondary" 
                            icon="filter_list" 
                            onClick={() => {
                                setShowFilterMenu(!showFilterMenu);
                                setShowSortMenu(false);
                            }}
                        >
                            Filters
                        </Button>
                        {showFilterMenu && (
                            <div className={classNames(styles.dropdownMenu, filteredProducts.length <= 4 && styles.scrollable)}>
                                <div className={styles.menuHeader}>Filter by Category</div>
                                {categories.map(cat => (
                                    <div 
                                        key={cat}
                                        className={`${styles.menuItem} ${categoryFilter === cat ? styles.active : ''}`}
                                        onClick={() => {
                                            setCategoryFilter(cat);
                                            setShowFilterMenu(false);
                                        }}
                                    >
                                        {cat}
                                        {categoryFilter === cat && <span className="material-symbols-outlined checkIcon">check</span>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sort Dropdown */}
                    <div className={styles.dropdownContainer}>
                        <Button 
                            variant="secondary" 
                            icon="sort"
                            onClick={() => {
                                setShowSortMenu(!showSortMenu);
                                setShowFilterMenu(false);
                            }}
                        >
                            Sort
                        </Button>
                        {showSortMenu && (
                            <div className={classNames(styles.dropdownMenu, filteredProducts.length <= 4 && styles.scrollable)}>
                                <div className={styles.menuHeader}>Sort Options</div>
                                {[
                                    { id: 'date-desc', label: 'Recently Modified' },
                                    { id: 'date-asc', label: 'Oldest First' },
                                    { id: 'name-asc', label: 'A-Z (Name)' },
                                    { id: 'name-desc', label: 'Z-A (Name)' },
                                    { id: 'weight-desc', label: 'Highest Weight' },
                                    { id: 'weight-asc', label: 'Lowest Weight' },
                                ].map(option => (
                                    <div 
                                        key={option.id}
                                        className={`${styles.menuItem} ${sortBy === option.id ? styles.active : ''}`}
                                        onClick={() => {
                                            setSortBy(option.id);
                                            setShowSortMenu(false);
                                        }}
                                    >
                                        {option.label}
                                        {sortBy === option.id && <span className="material-symbols-outlined checkIcon">check</span>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th style={{ width: '4rem' }}>
                                <input type="checkbox" />
                            </th>
                            <th>Product</th>
                            <th>Category</th>
                            <th>Purity</th>
                            <th className={styles.textRight}>Weight (g)</th>
                            <th className={styles.textRight}>Price</th>
                            <th className={styles.textCenter}>Status</th>
                            <th className={styles.textRight}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((product) => (
                            <tr 
                                key={product.id} 
                                onClick={() => navigate(`/dashboard/inventory/${product.id}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                <td onClick={(e) => e.stopPropagation()}>
                                    <input type="checkbox" />
                                </td>
                                <td>
                                    <div className={styles.productCell}>
                                        <div
                                            className={styles.productImage}
                                            style={{ 
                                                backgroundImage: (product.images && product.images.length > 0) ? `url("${product.images[0]}")` : 'none'
                                            }}
                                        ></div>
                                        <div className={styles.productInfo}>
                                            <span className={styles.name}>{product.name}</span>
                                            <span className={styles.sku}>SKU: {product.sku}</span>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ color: '#e0e0e0', fontSize: '0.875rem' }}>{product.category}</td>
                                <td>
                                    <Badge variant={getBadgeVariant(product.material)}>
                                        {product.material}
                                    </Badge>
                                </td>
                                <td className={`${styles.textRight} ${styles.textWhite} ${styles.textMono} ${styles.textSm}`}>
                                    {product.weight.toFixed(2)}
                                </td>
                                <td className={`${styles.textRight} ${styles.textWhite} ${styles.textMono} ${styles.fontSemiBold} ${styles.textSm}`}>
                                    ₹{product.price.toLocaleString('en-IN')}
                                </td>
                                <td className={styles.textCenter}>
                                    <Badge variant={getStatusVariant(product.status)}>
                                        {product.status}
                                    </Badge>
                                </td>
                                 <td className={styles.textRight} onClick={(e) => e.stopPropagation()}>
                                    <div className={styles.actionMenuWrapper}>
                                        <button 
                                            className={styles.actionBtn}
                                            onClick={() => setOpenMenuId(openMenuId === product.id ? null : product.id)}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>more_vert</span>
                                        </button>
                                        
                                        {openMenuId === product.id && (
                                            <div className={styles.actionMenu}>
                                                <button className={styles.actionItem} onClick={(e) => handleEdit(e, product.id)}>
                                                    <span className="material-symbols-outlined">edit</span>
                                                    Edit Product
                                                </button>
                                                <button className={classNames(styles.actionItem, styles.deleteAction)} onClick={(e) => handleDelete(e, product.id)}>
                                                    <span className="material-symbols-outlined">delete</span>
                                                    Delete Item
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className={styles.pagination}>
                <p>Showing <span>{Math.min(startIndex + 1, filteredProducts.length)}-{endIndex}</span> of <span>{filteredProducts.length}</span> items</p>
                <div className={styles.paginationControls}>
                    <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_left</span>
                    </button>
                    <button 
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_right</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InventoryTable;

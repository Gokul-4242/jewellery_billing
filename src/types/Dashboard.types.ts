export interface DashboardStats {
    goldStock: number;
    silverStock: number;
    lowStockCount: number;
    totalValuation: number;
    goldTrend: number;
    silverTrend: number;
    valuationTrend: number;
}

export type ProductType = 'Ring' | 'Necklace' | 'Pendant' | 'Earrings' | 'Bracelet';
export type MaterialType = '22k Gold' | '24k Gold' | '925 Silver';
export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface Product {
    id: string;
    name: string;
    sku: string;
    images: string[];
    category: ProductType | string;
    material: MaterialType | string;
    weight: number;
    price: number;
    status: StockStatus;
    quantity: number;
    lastModified: string;
}

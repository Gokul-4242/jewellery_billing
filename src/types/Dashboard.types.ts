export interface DashboardStats {
    goldStock: number;
    silverStock: number;
    lowStockCount: number;
    totalValuation: number;
    goldTrend: number;
    silverTrend: number;
    valuationTrend: number;
}

export type ProductType = 'Ring' | 'Necklace' | 'Pendant' | 'Earrings' | 'Bracelet' | 'Bangle';
export type MaterialType = '22k Gold' | '24k Gold' | '18k Gold' | '925 Silver' | 'Platinum' | 'Rose Gold';
export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface Product {
    id: string;
    name: string;
    sku: string;
    images: string[];
    category: ProductType | (string & {});
    material: MaterialType | (string & {});
    purity?: string;
    weight: number;
    makingCharge?: number;
    wastagePercent?: number;
    stoneCost?: number;
    price: number;
    status: StockStatus;
    quantity: number;
    lastModified: string;
}

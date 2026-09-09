import React, { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { Product } from '../types/Dashboard.types';
import {
  useGetProductsQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useUpdateStockMutation,
  useDeleteProductMutation,
} from '../store/api/productApi';

export interface InventoryContextType {
  products: Product[];
  categories: string[];
  materials: string[];
  addProduct: (product: any) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  addCategory: (name: string) => void;
  addMaterial: (name: string) => void;
}

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const useInventory = (): InventoryContextType => {
  const { data: products = [] } = useGetProductsQuery();
  const [addProductMutation] = useAddProductMutation();
  const [updateProductMutation] = useUpdateProductMutation();
  const [updateStockMutation] = useUpdateStockMutation();
  const [deleteProductMutation] = useDeleteProductMutation();

  const [categories, setCategories] = useState<string[]>(() => {
    const stored = localStorage.getItem('inventory_categories');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    return ['Ring', 'Necklace', 'Pendant', 'Earrings', 'Bracelet', 'Bangle'];
  });

  const [materials, setMaterials] = useState<string[]>(() => {
    const stored = localStorage.getItem('inventory_materials');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    return ['22k Gold', '24k Gold', '18k Gold', '925 Silver', 'Platinum', 'Rose Gold'];
  });

  useEffect(() => {
    localStorage.setItem('inventory_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('inventory_materials', JSON.stringify(materials));
  }, [materials]);

  const addCategory = useCallback((name: string) => {
    if (!name) return;
    setCategories((prev) => {
      if (prev.includes(name)) return prev;
      return [...prev, name].sort();
    });
  }, []);

  const addMaterial = useCallback((name: string) => {
    if (!name) return;
    setMaterials((prev) => {
      if (prev.includes(name)) return prev;
      return [...prev, name].sort();
    });
  }, []);

  const addProduct = useCallback(
    async (productPayload: any): Promise<Product> => {
      if (productPayload.category && !categories.includes(productPayload.category)) {
        addCategory(productPayload.category);
      }
      if (productPayload.material && !materials.includes(productPayload.material)) {
        addMaterial(productPayload.material);
      }
      const res = await addProductMutation(productPayload).unwrap();
      return res;
    },
    [categories, materials, addCategory, addMaterial, addProductMutation]
  );

  const getProductById = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products]
  );

  const updateProduct = useCallback(
    async (id: string, updates: Partial<Product>) => {
      try {
        const { quantity, ...fields } = updates;
        if (Object.keys(fields).length > 0) {
          await updateProductMutation({ id, updates: fields }).unwrap();
        }

        if (quantity !== undefined) {
          const product = getProductById(id);
          if (product) {
            const change = quantity - product.quantity;
            if (change !== 0) {
              await updateStockMutation({
                id,
                change,
                reason: 'Manual Adjustment via Admin Panel',
              }).unwrap();
            }
          }
        }
      } catch (err) {
        console.error('Failed to update product:', err);
        throw err;
      }
    },
    [getProductById, updateProductMutation, updateStockMutation]
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      await deleteProductMutation(id).unwrap();
    },
    [deleteProductMutation]
  );

  return useMemo(
    () => ({
      products,
      categories,
      materials,
      addProduct,
      updateProduct,
      deleteProduct,
      getProductById,
      addCategory,
      addMaterial,
    }),
    [
      products,
      categories,
      materials,
      addProduct,
      updateProduct,
      deleteProduct,
      getProductById,
      addCategory,
      addMaterial,
    ]
  );
};

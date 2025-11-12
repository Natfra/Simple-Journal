import { db } from "./database";

export interface Category {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  createdAt: string;
}

export const createCategory = async (name: string, color?: string, icon?: string): Promise<Category> => {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  await db.runAsync(
    "INSERT INTO categories (id, name, color, icon, createdAt) VALUES (?, ?, ?, ?, ?)",
    [id, name, color || "#ffffff", icon || "📁", now]
  );

  return { id, name, color, icon, createdAt: now };
};

export const getAllCategories = async (): Promise<Category[]> => {
  return await db.getAllAsync<Category>("SELECT * FROM categories ORDER BY createdAt DESC");
};

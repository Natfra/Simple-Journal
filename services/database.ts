// services/database.ts
/**
 * Servicio de base de datos SQLite
 * Gestiona la conexión y la inicialización de todas las tablas
 */

import * as SQLite from "expo-sqlite";

// Abrimos (o creamos si no existe) la base de datos
export const db = SQLite.openDatabaseSync("notesApp.db");

/**
 * Inicializa todas las tablas de la base de datos
 * Debe ser llamada al inicio de la aplicación
 */
export async function initializeDatabase(): Promise<void> {
  try {
    await db.execAsync(`
      PRAGMA foreign_keys = ON;

      -- Tabla de usuarios
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );

      -- Tabla de categorías
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        color TEXT,
        icon TEXT,
        createdAt TEXT NOT NULL
      );

      -- Tabla de notas
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        emoji TEXT,
        color TEXT,
        date TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        categoryId TEXT,
        userId TEXT,
        FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );

      -- Índices para mejorar el rendimiento de las búsquedas
      CREATE INDEX IF NOT EXISTS idx_notes_userId ON notes(userId);
      CREATE INDEX IF NOT EXISTS idx_notes_categoryId ON notes(categoryId);
      CREATE INDEX IF NOT EXISTS idx_notes_updatedAt ON notes(updatedAt DESC);
      CREATE INDEX IF NOT EXISTS idx_notes_title ON notes(title);
    `);

    console.log("✅ Base de datos SQLite inicializada correctamente");
    console.log("📊 Tablas creadas: users, categories, notes");
    console.log("🔍 Índices creados para optimización");
  } catch (error) {
    console.error("❌ Error al inicializar base de datos:", error);
    throw new Error("No se pudo inicializar la base de datos");
  }
}

/**
 * Obtiene información sobre el estado de la base de datos
 */
export async function getDatabaseInfo(): Promise<{
  notesCount: number;
  categoriesCount: number;
  usersCount: number;
}> {
  try {
    const notesResult = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM notes'
    );
    const categoriesResult = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM categories'
    );
    const usersResult = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM users'
    );

    return {
      notesCount: notesResult?.count || 0,
      categoriesCount: categoriesResult?.count || 0,
      usersCount: usersResult?.count || 0,
    };
  } catch (error) {
    console.error("Error al obtener info de la base de datos:", error);
    return {
      notesCount: 0,
      categoriesCount: 0,
      usersCount: 0,
    };
  }
}

/**
 * Limpia toda la base de datos (útil para testing)
 * ⚠️ PRECAUCIÓN: Esto eliminará todos los datos
 */
export async function clearDatabase(): Promise<void> {
  try {
    await db.execAsync(`
      DELETE FROM notes;
      DELETE FROM categories;
      DELETE FROM users;
    `);
    
    console.log("✅ Base de datos limpiada");
  } catch (error) {
    console.error("Error al limpiar base de datos:", error);
    throw new Error("No se pudo limpiar la base de datos");
  }
}

/**
 * Reinicia la base de datos (elimina y recrea todas las tablas)
 * ⚠️ PRECAUCIÓN: Esto eliminará todos los datos permanentemente
 */
export async function resetDatabase(): Promise<void> {
  try {
    await db.execAsync(`
      PRAGMA foreign_keys = OFF;
      
      DROP TABLE IF EXISTS notes;
      DROP TABLE IF EXISTS categories;
      DROP TABLE IF EXISTS users;
      
      PRAGMA foreign_keys = ON;
    `);
    
    console.log("✅ Tablas eliminadas");
    
    // Volver a inicializar
    await initializeDatabase();
    
    console.log("✅ Base de datos reiniciada");
  } catch (error) {
    console.error("Error al reiniciar base de datos:", error);
    throw new Error("No se pudo reiniciar la base de datos");
  }
}

/**
 * Verifica si la base de datos está funcionando correctamente
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await db.getFirstAsync('SELECT 1');
    return true;
  } catch (error) {
    console.error("Error de salud de la base de datos:", error);
    return false;
  }
}

/**
 * Realiza una copia de seguridad de los datos en formato JSON
 */
export async function backupDatabase(): Promise<{
  notes: any[];
  categories: any[];
  users: any[];
}> {
  try {
    const notes = await db.getAllAsync('SELECT * FROM notes');
    const categories = await db.getAllAsync('SELECT * FROM categories');
    const users = await db.getAllAsync('SELECT * FROM users');

    return {
      notes: notes || [],
      categories: categories || [],
      users: users || [],
    };
  } catch (error) {
    console.error("Error al hacer backup:", error);
    throw new Error("No se pudo realizar el backup");
  }
}
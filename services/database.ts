// src/services/database.ts
import * as SQLite from "expo-sqlite";

// Abrimos (o creamos si no existe) la base de datos
export const db = SQLite.openDatabaseSync("notesApp.db");

// Función para inicializar todas las tablas
export async function initializeDatabase() {
  await db.execAsync(`
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
      createdAt TEXT,
      updatedAt TEXT,
      categoryId TEXT,
      userId TEXT,
      FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  console.log("✅ Base de datos SQLite inicializada con tablas: users, categories y notes");
}

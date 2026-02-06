// Fallback types for non-Cloudflare environments
type KVNamespace = any;

// Storage interface for Blind Storage
export interface StorageItem {
    blob: string;
    metadata: {
        burn: boolean;
    };
}

export interface IStorageProvider {
    get(id: string): Promise<StorageItem | null>;
    put(id: string, blob: string, options: { expirationTtl: number; metadata: { burn: boolean } }): Promise<void>;
    delete(id: string): Promise<void>;
}

// Memory Fallback
const memoryStore = new Map<string, { blob: string; metadata: { burn: boolean }; expiresAt: number }>();

class MemoryProvider implements IStorageProvider {
    async get(id: string): Promise<StorageItem | null> {
        const item = memoryStore.get(id);
        if (!item) return null;
        if (Date.now() > item.expiresAt) {
            memoryStore.delete(id);
            return null;
        }
        return { blob: item.blob, metadata: item.metadata };
    }
    async put(id: string, blob: string, options: { expirationTtl: number; metadata: { burn: boolean } }): Promise<void> {
        memoryStore.set(id, {
            blob,
            metadata: options.metadata,
            expiresAt: Date.now() + options.expirationTtl * 1000
        });
    }
    async delete(id: string): Promise<void> {
        memoryStore.delete(id);
    }
}

// Cloudflare KV Provider
class KVProvider implements IStorageProvider {
    constructor(private kv: KVNamespace) { }
    async get(id: string): Promise<StorageItem | null> {
        const { value: blob, metadata } = await this.kv.getWithMetadata(id);
        if (!blob) return null;
        return { blob, metadata: metadata || { burn: false } };
    }
    async put(id: string, blob: string, options: { expirationTtl: number; metadata: { burn: boolean } }): Promise<void> {
        await this.kv.put(id, blob, {
            expirationTtl: options.expirationTtl,
            metadata: options.metadata
        });
    }
    async delete(id: string): Promise<void> {
        await this.kv.delete(id);
    }
}

// SQLite Provider (The Pro Move)
let sqliteDb: any = null;
class SQLiteProvider implements IStorageProvider {
    private db: any;
    constructor(Database: any, dbPath: string) {
        if (!sqliteDb) {
            sqliteDb = new Database(dbPath);
            sqliteDb.exec(`
                CREATE TABLE IF NOT EXISTS notes (
                    id TEXT PRIMARY KEY,
                    blob TEXT NOT NULL,
                    burn INTEGER NOT NULL,
                    expires_at INTEGER NOT NULL
                )
            `);
            // Index for faster cleanup
            sqliteDb.exec(`CREATE INDEX IF NOT EXISTS idx_expires ON notes(expires_at)`);
        }
        this.db = sqliteDb;
    }

    private cleanup() {
        const now = Math.floor(Date.now() / 1000);
        sqliteDb.prepare('DELETE FROM notes WHERE expires_at < ?').run(now);
    }

    async get(id: string): Promise<StorageItem | null> {
        this.cleanup();
        const row = sqliteDb.prepare('SELECT blob, burn FROM notes WHERE id = ? AND expires_at > ?').get(id, Math.floor(Date.now() / 1000));
        if (!row) return null;
        return {
            blob: row.blob,
            metadata: { burn: row.burn === 1 }
        };
    }

    async put(id: string, blob: string, options: { expirationTtl: number; metadata: { burn: boolean } }): Promise<void> {
        this.cleanup();
        const expiresAt = Math.floor(Date.now() / 1000) + options.expirationTtl;
        sqliteDb.prepare('INSERT INTO notes (id, blob, burn, expires_at) VALUES (?, ?, ?, ?)').run(
            id,
            blob,
            options.metadata.burn ? 1 : 0,
            expiresAt
        );
    }

    async delete(id: string): Promise<void> {
        sqliteDb.prepare('DELETE FROM notes WHERE id = ?').run(id);
    }
}

/**
 * Storage Hub - Auto-discovers the best provider
 */
export async function initStorage(platform?: any): Promise<IStorageProvider> {
    // 1. Check Cloudflare KV
    if (platform?.env?.NOTES_KV) {
        return new KVProvider(platform.env.NOTES_KV);
    }

    // 2. Check for SQLite persistence (Node.js/Self-hosting environments)
    // We only try this if we are NOT in a Cloudflare Worker-like environment
    // and if we have access to node's 'process'
    const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;

    if (isNode) {
        const dbPath = (process as any).env.DB_PATH || 'notes.db';
        try {
            // We use a dynamic import with a variable to fool static analyzers (esbuild/wrangler)
            // so they don't try to bundle native node modules into Cloudflare Workers
            const sqliteModule = 'better-sqlite3';
            const { default: Database } = await import(/* @vite-ignore */ sqliteModule);
            return new SQLiteProvider(Database, dbPath);
        } catch (e) {
            console.warn("⚠️ SQLite provider failed to initialize, falling back to memory store.", e);
        }
    }

    return new MemoryProvider();
}

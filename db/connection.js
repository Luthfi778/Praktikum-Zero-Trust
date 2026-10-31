const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');

const SEARCH_PATHS = [
  process.cwd(),
  path.join(ROOT, 'gateway'),
  path.join(ROOT, 'service-nilai'),
  path.join(ROOT, 'service-transkrip'),
  ROOT,
];

function requireDep(name) {
  return require(require.resolve(name, { paths: SEARCH_PATHS }));
}

requireDep('dotenv').config({ path: path.join(ROOT, '.env') });

const Database = requireDep('better-sqlite3');

const dbPath = path.resolve(ROOT, process.env.DB_PATH || './db/sistem_nilai.db');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL'); 
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 5000'); 

module.exports = { db, dbPath, ROOT, requireDep };
import { initNeonSchema, isNeonEnabled } from './neon-db.js';

async function main() {
  if (!isNeonEnabled()) {
    console.error('DATABASE_URL орнатылмаған. .env ішіне Neon connection string қойыңыз.');
    process.exit(1);
  }
  await initNeonSchema();
  console.log('Neon schema дайын (tg_incidents).');
}

main().catch((err) => {
  console.error('[telegram-db-init] қате:', err.message);
  process.exit(1);
});

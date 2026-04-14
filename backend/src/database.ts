import fs from 'fs';
import path from 'path';
import { RpetProduct, RpetDeclaration } from './types';

interface DbSchema {
  products: RpetProduct[];
  nextId: number;
  declarations: RpetDeclaration[];
  declNextId: number;
}

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'rpet.json');

let cache: DbSchema | null = null;

function read(): DbSchema {
  if (cache) return cache;
  if (fs.existsSync(DB_PATH)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')) as DbSchema;
      // Migrate: add declarations if missing
      if (!parsed.declarations) { parsed.declarations = []; parsed.declNextId = 1; }
      if (!parsed.declNextId) parsed.declNextId = (parsed.declarations.length || 0) + 1;
      cache = parsed;
      return cache;
    } catch {
      // fall through to seed
    }
  }
  cache = { products: [], nextId: 1, declarations: [], declNextId: 1 };
  seed(cache);
  write(cache);
  return cache;
}

function write(data: DbSchema): void {
  cache = data;
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function seed(data: DbSchema): void {
  const now = new Date().toISOString();
  data.nextId = 4;
  data.declNextId = 3;
  data.declarations = [
    {
      id: 1, combined_code: 'MBB306C',
      product_name: 'RCPL rPET Water Bottle 500ml',
      sku: 'RCPL-PET-500',
      manufacturing_location: 'Plot No. 12, MIDC Industrial Area, Navi Mumbai - 400710, Maharashtra, India',
      recycle_content: 100,
      pwm_reg_no: 'PWM/MH/2024/001234',
      status: 'active', created_at: now, updated_at: now,
    },
    {
      id: 2, combined_code: 'MBB312A',
      product_name: 'RCPL rPET Juice Bottle 1L',
      sku: 'RCPL-PET-1L',
      manufacturing_location: 'Sector 5, Vashi, Navi Mumbai - 400703, Maharashtra, India',
      recycle_content: 75,
      pwm_reg_no: 'PWM/MH/2024/001235',
      status: 'active', created_at: now, updated_at: now,
    },
  ];
  data.products = [
    {
      id: 1, batch_code: 'AA', category: 'Dairy', subcategory: 'Full Cream Milk',
      vendor_name: 'DD - Kayem Food Industries Pvt. Ltd.',
      vendor_address: 'Plot No. 2244-2247, Food Park, HSIIDC, Industrial Estate, Rai, Sonipat, Haryana - 131029',
      fssai_license: '10016064000819', tag: 'RCPL',
      sku: 'RCPL-FCM-500', product_name: 'rPET Full Cream Milk 500ml',
      manufacturer: 'RCPL Pvt Ltd', status: 'active', created_at: now, updated_at: now,
    },
    {
      id: 2, batch_code: 'BB', category: 'Dairy', subcategory: 'Toned Milk',
      vendor_name: 'RCPL Dairy Unit - Mumbai',
      vendor_address: 'Sector 5, Vashi, Navi Mumbai - 400703, Maharashtra',
      fssai_license: '11518999000222', tag: 'RCPL',
      sku: 'RCPL-TM-1L', product_name: 'rPET Toned Milk 1L',
      manufacturer: 'RCPL Pvt Ltd', status: 'active', created_at: now, updated_at: now,
    },
    {
      id: 3, batch_code: 'CC', category: 'Dairy', subcategory: 'Skimmed Milk',
      vendor_name: 'RCPL Dairy Unit - Nashik',
      vendor_address: 'MIDC Ambad, Nashik - 422010, Maharashtra',
      fssai_license: '11518999000333', tag: 'RCPL',
      sku: 'RCPL-SM-500', product_name: 'rPET Skimmed Milk 500ml',
      manufacturer: 'RCPL Pvt Ltd', status: 'inactive', created_at: now, updated_at: now,
    },
  ];
}

// Synchronous DB interface (drop-in for routes)
export const db = {
  get data() { return read(); },
  write() { write(read()); },
  save(data: DbSchema) { write(data); },
};

export function getDb() {
  return db;
}

export function closeDb() {
  cache = null;
}

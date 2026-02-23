export interface Asset {
  id: number;                     // matches Prisma id
  name: string;                   // matches Prisma name
  category: string;             // foreign key
  status: string;               // foreign key
  description?: string | null;    // optional field
  company: string;              // foreign key
  location: string;             // foreign key
  assignedTo?: string | number;     // optional nullable
  purchaseDate: Date;             // matches Prisma purchaseDate
  purchasePrice: number;           // matches Prisma purchasePrice
  model?: string | null;          // optional
  serialNumber?: string | null;   // optional
  manufacturer?: string | null;   // optional
  supplier?: string | null;       // optional
  specifications?: string | null; // optional
  warranty?: number | null;       // months
  warrantyExpiry?: Date | null;   // optional
  lastMaintenance?: Date | null;  // optional
}

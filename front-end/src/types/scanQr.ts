export interface ScanQR {
    id: number;           // matches Prisma id
    assetId: number;      // foreign key
    scanDate: Date;       // matches Prisma scanDate
    scanLocation: string; // matches Prisma scanLocation
    userId: number;       // foreign key
}
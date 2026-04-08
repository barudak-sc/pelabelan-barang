import "dotenv/config";
import { PrismaClient, UserRole } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // 1. Default admin user
  const adminPassword = await hash("Admin@123", 12);
  await prisma.user.upsert({
    where: { username: "admin" },
    update: { passwordHash: adminPassword },
    create: {
      username: "admin",
      passwordHash: adminPassword,
      name: "Administrator",
      role: UserRole.ADMIN,
    },
  });
  console.log("Created/updated default admin user (admin / Admin@123)");

  // 2. Categories
  const categories = [
    { name: "Elektronik", codePrefix: "ELK", description: "Perangkat elektronik" },
    { name: "Furniture", codePrefix: "FRN", description: "Mebel dan perabotan" },
    { name: "Dokumen", codePrefix: "DOK", description: "Dokumen dan arsip" },
    { name: "Peralatan Kantor", codePrefix: "PRK", description: "Peralatan kantor umum" },
    { name: "Jaringan", codePrefix: "JRG", description: "Perangkat jaringan" },
  ];
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log(`Seeded ${categories.length} categories`);

  // 3. Conditions
  const conditions = [
    { name: "Baik", severityLevel: 1 },
    { name: "Rusak Ringan", severityLevel: 2 },
    { name: "Rusak Berat", severityLevel: 3 },
    { name: "Hilang", severityLevel: 4 },
  ];
  for (const cond of conditions) {
    await prisma.condition.upsert({
      where: { name: cond.name },
      update: {},
      create: cond,
    });
  }
  console.log(`Seeded ${conditions.length} conditions`);

  // 4. Fund Sources
  const fundSources = ["BOP", "PLN", "APBN", "APBD", "Hibah", "Lainnya"];
  for (const name of fundSources) {
    await prisma.fundSource.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`Seeded ${fundSources.length} fund sources`);

  // 5. Locations (no unique on name alone, use find-or-create)
  const locations = [
    { name: "Ruang Server", building: "Gedung Utama", floor: "Lantai 1" },
    { name: "Ruang Arsip", building: "Gedung Utama", floor: "Lantai 2" },
    { name: "Gudang", building: "Gedung Belakang", floor: "Lantai 1" },
  ];
  for (const loc of locations) {
    const exists = await prisma.location.findFirst({
      where: { name: loc.name, building: loc.building, floor: loc.floor },
    });
    if (!exists) {
      await prisma.location.create({ data: loc });
    }
  }
  console.log(`Seeded ${locations.length} locations`);

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

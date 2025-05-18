import { PrismaClient } from '@prisma/client'

const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:smartsignage%402025@localhost:5432/postgres?connect_timeout=10&sslmode=prefer' // You'll need to replace this with your local database URL
    }
  }
})

const supabasePrisma = new PrismaClient()

async function main() {
  try {
    // Get all products from local database
    const products = await localPrisma.product.findMany()
    console.log(`Found ${products.length} products in local database`)

    // Insert products into Supabase
    for (const product of products) {
      // Remove id to let Supabase auto-generate new ones
      const { id, createdAt, updatedAt, ...productData } = product
      await supabasePrisma.product.create({
        data: productData
      })
    }

    console.log('Data migration completed successfully!')
  } catch (error) {
    console.error('Error during migration:', error)
  } finally {
    await localPrisma.$disconnect()
    await supabasePrisma.$disconnect()
  }
}

main() 
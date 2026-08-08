import { prisma } from './config/db';

async function test() {
  try {
    console.log('Testing venue creation with relations...');
    const data = {
      name: 'Test Venue 2',
      description: 'Test description',
      building: 'nekchand11',
      latitude: 30.7688,
      longitude: 76.5754,
      status: 'OPEN' as const,
      operatingHours: [
        { day: 'MONDAY' as const, openingTime: '09:00', closingTime: '22:00', isClosed: false }
      ],
      images: []
    };

    const { operatingHours, images, ...venueData } = data;

    const result = await prisma.venue.create({
      data: {
        ...venueData,
        images: images ? {
          create: images,
        } : undefined,
        operatingHours: operatingHours ? {
          create: operatingHours,
        } : undefined,
      },
      include: {
        images: true,
        operatingHours: true,
      },
    });
    console.log('Success:', result);
  } catch (error: any) {
    console.error('Error occurred:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();

import { PrismaClient, AdminRole, Day, MealType, VenueStatus, Priority, AnnouncementStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clear existing data
  await prisma.auditLog.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.menuItemTag.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.menuItemImage.deleteMany({});
  await prisma.menuItem.deleteMany({});
  await prisma.venueCategory.deleteMany({});
  await prisma.venueOperatingHours.deleteMany({});
  await prisma.venueImage.deleteMany({});
  await prisma.venue.deleteMany({});
  await prisma.messMenu.deleteMany({});
  await prisma.messTiming.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.admin.deleteMany({});

  console.log('Cleared existing records.');

  // 2. Seed Admin Users
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const superAdmin = await prisma.admin.create({
    data: {
      name: 'Super Admin',
      email: 'superadmin@cugrabeats.com',
      password: hashedPassword,
      role: AdminRole.SUPER_ADMIN,
    },
  });

  const normalAdmin = await prisma.admin.create({
    data: {
      name: 'Campus Moderator',
      email: 'admin@cugrabeats.com',
      password: hashedPassword,
      role: AdminRole.ADMIN,
    },
  });

  console.log('Created Admins:', { superAdmin: superAdmin.email, normalAdmin: normalAdmin.email });

  // 3. Seed Tags
  const tagVeg = await prisma.tag.create({ data: { name: 'Veg' } });
  const tagNonVeg = await prisma.tag.create({ data: { name: 'Non Veg' } });
  const tagBestSeller = await prisma.tag.create({ data: { name: 'Best Seller' } });
  const tagSpicy = await prisma.tag.create({ data: { name: 'Spicy' } });
  const tagCombo = await prisma.tag.create({ data: { name: 'Combo' } });
  const tagHealthy = await prisma.tag.create({ data: { name: 'Healthy' } });

  console.log('Created Tags.');

  // 4. Seed Venues, Categories, Menu Items
  // Venue A: Domino's Pizza
  const dominos = await prisma.venue.create({
    data: {
      name: "Domino's Pizza",
      description: "Freshly baked pizzas, garlic bread, and delicious chocolate lava cakes.",
      building: "Academic Block 3 (Food Court)",
      latitude: 30.7688,
      longitude: 76.5754,
      googleMapsLink: "https://maps.app.goo.gl/dominoscu",
      phone: "+91 9876543210",
      status: VenueStatus.OPEN,
      images: {
        create: [
          {
            url: "https://res.cloudinary.com/demo/image/upload/v1615878783/dominos_logo.png",
            publicId: "dominos_logo",
            altText: "Domino's Logo",
            displayOrder: 0,
          },
          {
            url: "https://res.cloudinary.com/demo/image/upload/v1615878783/dominos_banner.jpg",
            publicId: "dominos_banner",
            altText: "Domino's Banner",
            displayOrder: 1,
          }
        ]
      },
      operatingHours: {
        create: Object.values(Day).map((day) => ({
          day,
          openingTime: "10:00",
          closingTime: "22:00",
          isClosed: false,
        }))
      }
    }
  });

  // Domino's Categories
  const catPizzas = await prisma.venueCategory.create({
    data: { venueId: dominos.id, name: 'Pizzas', displayOrder: 0 }
  });
  const catSides = await prisma.venueCategory.create({
    data: { venueId: dominos.id, name: 'Sides & Garlic Breads', displayOrder: 1 }
  });
  const catDesserts = await prisma.venueCategory.create({
    data: { venueId: dominos.id, name: 'Desserts', displayOrder: 2 }
  });

  // Domino's Menu Items
  await prisma.menuItem.create({
    data: {
      venueId: dominos.id,
      categoryId: catPizzas.id,
      name: "Cheese N Corn Pizza",
      description: "Sweet juicy golden corn loaded with extra mozzarella cheese.",
      price: 189.0,
      preparationTime: 12,
      featured: true,
      images: {
        create: [{ url: "https://res.cloudinary.com/demo/image/upload/v1615878783/pizza_corn.jpg", publicId: "pizza_corn" }]
      },
      tags: {
        create: [{ tagId: tagVeg.id }, { tagId: tagBestSeller.id }]
      }
    }
  });

  await prisma.menuItem.create({
    data: {
      venueId: dominos.id,
      categoryId: catPizzas.id,
      name: "Spicy Jalapeno & Red Paprika Pizza",
      description: "Jalapenos, red paprika, and onions with spicy seasoning.",
      price: 219.0,
      preparationTime: 15,
      tags: {
        create: [{ tagId: tagVeg.id }, { tagId: tagSpicy.id }]
      }
    }
  });

  await prisma.menuItem.create({
    data: {
      venueId: dominos.id,
      categoryId: catSides.id,
      name: "Garlic Breadsticks",
      description: "Freshly baked garlic bread flavored with garlic butter and herbs.",
      price: 99.0,
      preparationTime: 8,
      tags: {
        create: [{ tagId: tagVeg.id }, { tagId: tagBestSeller.id }]
      }
    }
  });

  await prisma.menuItem.create({
    data: {
      venueId: dominos.id,
      categoryId: catDesserts.id,
      name: "Choco Lava Cake",
      description: "Chocolate cake shell filled with warm molten liquid chocolate center.",
      price: 109.0,
      preparationTime: 5,
      tags: {
        create: [{ tagId: tagVeg.id }, { tagId: tagBestSeller.id }]
      }
    }
  });

  // Venue B: Subway
  const subway = await prisma.venue.create({
    data: {
      name: "Subway Sandwiches",
      description: "Fresh, healthy, custom-made sandwiches, wraps, and cookies.",
      building: "Student Activity Center (SAC)",
      latitude: 30.7692,
      longitude: 76.5748,
      googleMapsLink: "https://maps.app.goo.gl/subwaycu",
      phone: "+91 9876543211",
      status: VenueStatus.OPEN,
      images: {
        create: [
          {
            url: "https://res.cloudinary.com/demo/image/upload/v1615878783/subway_logo.png",
            publicId: "subway_logo",
            altText: "Subway Logo",
            displayOrder: 0,
          }
        ]
      },
      operatingHours: {
        create: Object.values(Day).map((day) => ({
          day,
          openingTime: "09:00",
          closingTime: "21:30",
          isClosed: day === Day.SUNDAY, // Closed on Sundays
        }))
      }
    }
  });

  const catSubs = await prisma.venueCategory.create({
    data: { venueId: subway.id, name: 'Subs (6 inch / Footlong)', displayOrder: 0 }
  });
  const catCookies = await prisma.venueCategory.create({
    data: { venueId: subway.id, name: 'Cookies & Sides', displayOrder: 1 }
  });

  await prisma.menuItem.create({
    data: {
      venueId: subway.id,
      categoryId: catSubs.id,
      name: "Veggie Delite Sub",
      description: "Light and refreshing combination of crisp lettuce, tomatoes, cucumbers, green peppers and onions.",
      price: 150.0,
      preparationTime: 5,
      tags: {
        create: [{ tagId: tagVeg.id }, { tagId: tagHealthy.id }]
      }
    }
  });

  await prisma.menuItem.create({
    data: {
      venueId: subway.id,
      categoryId: catSubs.id,
      name: "Chicken Teriyaki Sub",
      description: "Tender chicken breast strips marinated in teriyaki sauce, served toasted with fresh veggies.",
      price: 210.0,
      preparationTime: 6,
      tags: {
        create: [{ tagId: tagNonVeg.id }, { tagId: tagBestSeller.id }]
      }
    }
  });

  await prisma.menuItem.create({
    data: {
      venueId: subway.id,
      categoryId: catCookies.id,
      name: "Double Chocolate Chip Cookie",
      description: "Soft baked double chocolate chunk cookie.",
      price: 45.0,
      preparationTime: 2,
      tags: {
        create: [{ tagId: tagVeg.id }]
      }
    }
  });

  // Venue C: Nescafe
  const nescafe = await prisma.venue.create({
    data: {
      name: "Nescafe Coffee Corner",
      description: "Hot coffees, cold frappes, iced tea, and quick noodles/snacks.",
      building: "Mechanical Block Ground floor",
      latitude: 30.7681,
      longitude: 76.5761,
      googleMapsLink: "https://maps.app.goo.gl/nescafecu",
      phone: "+91 9876543212",
      status: VenueStatus.OPEN,
      operatingHours: {
        create: Object.values(Day).map((day) => ({
          day,
          openingTime: "08:30",
          closingTime: "20:00",
          isClosed: false,
        }))
      }
    }
  });

  const catHotBeverages = await prisma.venueCategory.create({
    data: { venueId: nescafe.id, name: 'Hot Beverages', displayOrder: 0 }
  });
  const catSnacks = await prisma.venueCategory.create({
    data: { venueId: nescafe.id, name: 'Snacks', displayOrder: 1 }
  });

  await prisma.menuItem.create({
    data: {
      venueId: nescafe.id,
      categoryId: catHotBeverages.id,
      name: "Hot Cappuccino",
      description: "Classic Italian style hot frothed espresso milk coffee.",
      price: 60.0,
      preparationTime: 3,
      tags: {
        create: [{ tagId: tagVeg.id }, { tagId: tagBestSeller.id }]
      }
    }
  });

  await prisma.menuItem.create({
    data: {
      venueId: nescafe.id,
      categoryId: catSnacks.id,
      name: "Masala Maggi",
      description: "Quick 2-minute instant noodles loaded with maggi masala and fresh peas.",
      price: 45.0,
      preparationTime: 5,
      tags: {
        create: [{ tagId: tagVeg.id }, { tagId: tagSpicy.id }]
      }
    }
  });

  console.log('Created Venues, Categories, and Menu Items.');

  // 5. Seed Mess Menu (Weekly)
  const mealsList = [
    { mealType: MealType.BREAKFAST, dishName: 'Aloo Paratha with Curd & Tea', ratingSum: 18, ratingCount: 4 },
    { mealType: MealType.LUNCH, dishName: 'Rajma, Rice, Roti, Salad & Boondi Raita', ratingSum: 23, ratingCount: 5 },
    { mealType: MealType.SNACKS_BOYS, dishName: 'Samosa with Sweet Chutney & Tea', ratingSum: 12, ratingCount: 3 },
    { mealType: MealType.SNACKS_GIRLS, dishName: 'Samosa with Sweet Chutney & Tea', ratingSum: 14, ratingCount: 3 },
    { mealType: MealType.DINNER, dishName: 'Shahi Paneer, Dal Makhani, Roti, Kheer', ratingSum: 28, ratingCount: 6 },
    { mealType: MealType.SOUTH_INDIAN, dishName: 'Masala Dosa, Sambar & Coconut Chutney', ratingSum: 20, ratingCount: 4 },
    { mealType: MealType.INTERNATIONAL, dishName: 'Pasta Primavera, Garlic Bread & Alfredo Sauce', ratingSum: 25, ratingCount: 5 },
  ];

  for (const day of Object.values(Day)) {
    await prisma.messMenu.createMany({
      data: mealsList.map((meal) => ({
        day,
        mealType: meal.mealType,
        dishName: `${meal.dishName} (${day.substring(0, 3)})`,
        ratingSum: meal.ratingSum,
        ratingCount: meal.ratingCount,
      }))
    });
  }

  // Seed default Mess Timings
  const defaultTimings = [
    { mealType: MealType.BREAKFAST, openingTime: '08:00', closingTime: '10:00' },
    { mealType: MealType.LUNCH, openingTime: '12:30', closingTime: '14:30' },
    { mealType: MealType.SNACKS_BOYS, openingTime: '16:30', closingTime: '18:00' },
    { mealType: MealType.SNACKS_GIRLS, openingTime: '16:30', closingTime: '18:00' },
    { mealType: MealType.DINNER, openingTime: '19:30', closingTime: '21:30' },
    { mealType: MealType.SOUTH_INDIAN, openingTime: '12:00', closingTime: '21:00' },
    { mealType: MealType.INTERNATIONAL, openingTime: '11:00', closingTime: '22:00' },
  ];

  for (const t of defaultTimings) {
    await prisma.messTiming.create({
      data: t
    });
  }

  console.log('Created Mess Menu and Mess Timings.');

  // 6. Seed Announcements
  await prisma.announcement.create({
    data: {
      title: "Independence Day Mess Menu Special",
      description: "To celebrate Independence Day, the main mess will serve special tri-color sweets and special paneer dishes during lunch.",
      priority: Priority.HIGH,
      status: AnnouncementStatus.PUBLISHED,
      pinned: true,
    }
  });

  await prisma.announcement.create({
    data: {
      title: "Nescafe Timings Extension",
      description: "During exam weeks, Nescafe Mechanical Block will remain open till 23:00 to support students studying late.",
      priority: Priority.MEDIUM,
      status: AnnouncementStatus.PUBLISHED,
      pinned: false,
    }
  });

  console.log('Created Announcements.');
  console.log('Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

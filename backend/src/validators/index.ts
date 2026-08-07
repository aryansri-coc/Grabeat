import { z } from 'zod';
import { Day, MealType, VenueStatus, Priority, AnnouncementStatus, AdminRole } from '@prisma/client';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const adminSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: z.nativeEnum(AdminRole).default(AdminRole.ADMIN),
});

const operatingHoursSchema = z.object({
  day: z.nativeEnum(Day),
  openingTime: z.string().regex(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format'),
  closingTime: z.string().regex(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format'),
  isClosed: z.boolean().default(false),
});

const imageSchema = z.object({
  url: z.string().url('Invalid image URL'),
  publicId: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
  altText: z.string().optional(),
  displayOrder: z.number().default(0),
});

export const venueSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  building: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  googleMapsLink: z.string().url('Invalid URL').or(z.string().length(0)).optional(),
  phone: z.string().optional(),
  status: z.nativeEnum(VenueStatus).default(VenueStatus.OPEN),
  operatingHours: z.array(operatingHoursSchema).optional(),
  images: z.array(imageSchema).optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  displayOrder: z.number().default(0),
});

export const menuItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be greater than zero'),
  available: z.boolean().default(true),
  featured: z.boolean().default(false),
  preparationTime: z.number().nonnegative().default(15),
  categoryId: z.string(),
  tags: z.array(z.string()).optional(),
  images: z.array(imageSchema).optional(),
});

export const messMenuSchema = z.object({
  day: z.nativeEnum(Day),
  mealType: z.nativeEnum(MealType),
  dishName: z.string().min(1, 'Dish name is required'),
});

export const announcementSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(1, 'Description is required'),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  status: z.nativeEnum(AnnouncementStatus).default(AnnouncementStatus.PUBLISHED),
  publishDate: z.string().or(z.date()).optional().default(() => new Date()),
  pinned: z.boolean().default(false),
});

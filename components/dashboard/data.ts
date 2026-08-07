import type { LucideIcon } from 'lucide-react'
import { BarChart3, Bell, ClipboardList, ChefHat, CircleUserRound, FileText, LayoutDashboard, MapPinned, Megaphone, MessageSquare, Settings, Store, Users, Utensils } from 'lucide-react'

export type PageKey = 'Dashboard' | 'Mess Menu' | 'Food Outlets' | 'Outlet Menus' | 'Announcements' | 'Reviews' | 'Campus Map' | 'Admin Users' | 'Settings'

export const navItems: { label: PageKey; icon: LucideIcon }[] = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Mess Menu', icon: Utensils },
  { label: 'Food Outlets', icon: Store },
  { label: 'Outlet Menus', icon: ClipboardList },
  { label: 'Announcements', icon: Megaphone },
  { label: 'Reviews', icon: MessageSquare },
  { label: 'Campus Map', icon: MapPinned },
  { label: 'Admin Users', icon: Users },
  { label: 'Settings', icon: Settings },
]

export const stats = [
  { label: "Today's menu updated", value: '98%', trend: '+12.4%', caption: 'vs. last week', icon: Utensils, tone: 'indigo' },
  { label: 'Total food outlets', value: '24', trend: '+2', caption: 'this semester', icon: Store, tone: 'emerald' },
  { label: 'Total menu items', value: '186', trend: '+18', caption: 'this month', icon: ClipboardList, tone: 'amber' },
  { label: 'Pending reviews', value: '12', trend: '-8.2%', caption: 'vs. yesterday', icon: MessageSquare, tone: 'rose' },
]

export const activities = [
  { title: 'Admin updated Monday Lunch', detail: 'Rajiv Mehra · Mess Menu', time: '12 min ago', icon: Utensils, color: 'indigo' },
  { title: "Added Domino's Outlet", detail: 'Ananya Sharma · Food Outlets', time: '48 min ago', icon: Store, color: 'emerald' },
  { title: 'Updated Nescafe Menu', detail: 'Kabir Singh · Outlet Menus', time: '2 hours ago', icon: FileText, color: 'amber' },
  { title: 'Added New Announcement', detail: 'Priya Nair · Announcements', time: '3 hours ago', icon: Megaphone, color: 'violet' },
  { title: 'Student Submitted Review', detail: 'Aarav Kapoor · Reviews', time: '5 hours ago', icon: MessageSquare, color: 'rose' },
]

export const meals = [
  { name: 'Breakfast', time: '7:30 AM – 9:30 AM', items: ['Aloo Paratha', 'Curd', 'Seasonal Fruit'], color: 'amber' },
  { name: 'Lunch', time: '12:30 PM – 2:30 PM', items: ['Dal Makhani', 'Jeera Rice', 'Paneer Tikka'], color: 'indigo' },
  { name: 'Snacks', time: '4:30 PM – 6:00 PM', items: ['Masala Chai', 'Veg Samosa', 'Biscuits'], color: 'emerald' },
  { name: 'Dinner', time: '7:30 PM – 9:30 PM', items: ['Chole Bhature', 'Mixed Salad', 'Gulab Jamun'], color: 'violet' },
]

export const outlets = [
  { name: "Domino's", category: 'Fast Food', building: 'Student Centre', open: '11:00 AM', close: '11:00 PM', status: 'Open', location: 'North Campus', initials: 'D' },
  { name: 'Nescafe', category: 'Cafe', building: 'Library Block', open: '8:00 AM', close: '9:00 PM', status: 'Open', location: 'Central Campus', initials: 'N' },
  { name: 'Haldiram’s', category: 'Indian', building: 'Food Court', open: '10:00 AM', close: '10:00 PM', status: 'Closed', location: 'South Campus', initials: 'H' },
  { name: 'Subway', category: 'Fast Food', building: 'Academic Plaza', open: '9:00 AM', close: '9:00 PM', status: 'Open', location: 'North Campus', initials: 'S' },
]

export const menuItems = [
  { name: 'Cappuccino', category: 'Beverage', price: '₹120', available: true, featured: true, outlet: 'Nescafe' },
  { name: 'Veggie Supreme', category: 'Pizza', price: '₹349', available: true, featured: true, outlet: "Domino's" },
  { name: 'Paneer Wrap', category: 'Wraps', price: '₹189', available: false, featured: false, outlet: 'Subway' },
  { name: 'Chole Bhature', category: 'North Indian', price: '₹160', available: true, featured: false, outlet: 'Haldiram’s' },
]

export const reviews = [
  { student: 'Aarav Kapoor', outlet: 'Nescafe', rating: 5, comment: 'The new cold brew is excellent and the service was quick.', date: 'Today, 9:42 AM', status: 'Pending' },
  { student: 'Diya Shah', outlet: "Domino's", rating: 4, comment: 'Good food, but the waiting time could be improved during lunch.', date: 'Yesterday, 5:20 PM', status: 'Approved' },
  { student: 'Rohan Verma', outlet: 'Haldiram’s', rating: 2, comment: 'The food was cold when it arrived.', date: 'Yesterday, 1:12 PM', status: 'Pending' },
]

export const announcements = [
  { title: 'Mess timings updated for mid-semester break', description: 'Breakfast will be served until 10:30 AM from 18–22 March.', priority: 'Important', date: 'Mar 14, 2025', status: 'Published', pinned: true },
  { title: 'New outlet now open: Domino’s', description: 'Find the new outlet on the first floor of the Student Centre.', priority: 'Normal', date: 'Mar 12, 2025', status: 'Published', pinned: false },
  { title: 'Share your feedback', description: 'Help us improve by rating your latest campus meal.', priority: 'Normal', date: 'Mar 10, 2025', status: 'Draft', pinned: false },
]

export const adminUsers = [
  { name: 'Ananya Sharma', role: 'Super Admin', email: 'ananya@cu.ac.in', lastLogin: 'Today, 10:24 AM', status: 'Active', initials: 'AS' },
  { name: 'Kabir Singh', role: 'Menu Manager', email: 'kabir@cu.ac.in', lastLogin: 'Today, 9:12 AM', status: 'Active', initials: 'KS' },
  { name: 'Priya Nair', role: 'Content Editor', email: 'priya@cu.ac.in', lastLogin: 'Mar 14, 2025', status: 'Invited', initials: 'PN' },
]

export const campusPins = [
  { name: "Domino's", building: 'Student Centre', status: 'Open', time: '11:00 AM – 11:00 PM', x: 31, y: 40 },
  { name: 'Nescafe', building: 'Library Block', status: 'Open', time: '8:00 AM – 9:00 PM', x: 56, y: 30 },
  { name: 'Haldiram’s', building: 'Food Court', status: 'Closed', time: '10:00 AM – 10:00 PM', x: 70, y: 62 },
  { name: 'Subway', building: 'Academic Plaza', status: 'Open', time: '9:00 AM – 9:00 PM', x: 44, y: 73 },
]

export const statIconMap: Record<string, LucideIcon> = { BarChart3, Bell, CircleUserRound, ChefHat }

'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { apiRequest } from './api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Search, Shield, MapPin, Phone, Clock, Info, Check, ChevronRight, X, Star,
  UtensilsCrossed, AlertCircle, Sparkles, MessageSquare, ChevronDown
} from 'lucide-react'

interface StudentPortalProps {
  onSwitchToAdmin: () => void
}

export default function StudentPortal({ onSwitchToAdmin }: StudentPortalProps) {
  const [activeTab, setActiveTab] = useState<'OUTLETS' | 'MESS_MENU'>('OUTLETS')
  const [venues, setVenues] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [weeklyMessMenu, setWeeklyMessMenu] = useState<any[]>([])
  const [messTimings, setMessTimings] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBuilding, setSelectedBuilding] = useState('ALL')
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [loading, setLoading] = useState(true)

  // Details Modal state
  const [selectedVenue, setSelectedVenue] = useState<any | null>(null)
  const [venueCategories, setVenueCategories] = useState<any[]>([])
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [loadingMenu, setLoadingMenu] = useState(false)
  const [menuSearchQuery, setMenuSearchQuery] = useState('')
  const [menuFilterVeg, setMenuFilterVeg] = useState<boolean | null>(null) // null = all, true = veg, false = non-veg
  
  // Custom Local Reviews state
  const [reviews, setReviews] = useState<any[]>([])
  const [newReviewName, setNewReviewName] = useState('')
  const [newReviewRating, setNewReviewRating] = useState(5)
  const [newReviewComment, setNewReviewComment] = useState('')

  const mapRef = useRef<HTMLIFrameElement>(null)

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const [venuesRes, annRes, messRes, timingsRes] = await Promise.all([
        apiRequest('/venues'),
        apiRequest('/announcements'),
        apiRequest('/mess-menu'),
        apiRequest('/mess-menu/timings')
      ])
      
      if (venuesRes.success && venuesRes.data) {
        const venueList = venuesRes.data.venues || venuesRes.data.items || (Array.isArray(venuesRes.data) ? venuesRes.data : [])
        setVenues(venueList)
      }
      if (annRes.success && annRes.data) {
        const list = annRes.data.announcements || annRes.data || []
        setAnnouncements(list.filter((a: any) => a.status === 'PUBLISHED'))
      }
      if (messRes.success && messRes.data) {
        setWeeklyMessMenu(messRes.data)
      }
      if (timingsRes.success && timingsRes.data) {
        setMessTimings(timingsRes.data)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  // Send venues to iframe map once ready
  useEffect(() => {
    const handleMapReady = (event: MessageEvent) => {
      if (event.data && event.data.type === 'MAP_READY') {
        mapRef.current?.contentWindow?.postMessage({
          type: 'LOAD_VENUES',
          venues: venues
        }, '*')
      } else if (event.data && event.data.type === 'VIEW_MENU') {
        const venue = venues.find(v => v.id === event.data.venueId)
        if (venue) handleOpenVenueDetails(venue)
      }
    }

    window.addEventListener('message', handleMapReady)
    
    // Also try posting directly if the map was already loaded
    if (venues.length > 0) {
      mapRef.current?.contentWindow?.postMessage({
        type: 'LOAD_VENUES',
        venues: venues
      }, '*')
    }

    return () => window.removeEventListener('message', handleMapReady)
  }, [venues])

  // Get unique buildings for filters
  const buildings = useMemo(() => {
    const set = new Set<string>()
    venues.forEach(v => {
      if (v.building) set.add(v.building)
    })
    return ['ALL', ...Array.from(set)]
  }, [venues])

  // Filter venues
  const filteredVenues = useMemo(() => {
    return venues.filter(v => {
      const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.description && v.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (v.building && v.building.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesBuilding = selectedBuilding === 'ALL' || v.building === selectedBuilding
      
      const matchesStatus = selectedStatus === 'ALL' || v.status === selectedStatus

      return matchesSearch && matchesBuilding && matchesStatus
    })
  }, [venues, searchQuery, selectedBuilding, selectedStatus])

  // Open outlet details
  const handleOpenVenueDetails = async (venue: any) => {
    setSelectedVenue(venue)
    setLoadingMenu(true)
    setMenuSearchQuery('')
    setMenuFilterVeg(null)

    // Load custom reviews from localStorage
    const savedReviews = localStorage.getItem(`reviews_${venue.id}`)
    if (savedReviews) {
      setReviews(JSON.parse(savedReviews))
    } else {
      setReviews([])
    }

    // Fetch categories and menu items
    const [catRes, menuRes] = await Promise.all([
      apiRequest(`/categories/venue/${venue.id}`),
      apiRequest(`/menu-items?venueId=${venue.id}`)
    ])

    if (catRes.success && catRes.data) {
      setVenueCategories(catRes.data)
    }
    if (menuRes.success && menuRes.data) {
      const itemsList = menuRes.data.menuItems || menuRes.data.items || (Array.isArray(menuRes.data) ? menuRes.data : [])
      setMenuItems(itemsList)
    }
    setLoadingMenu(false)
  }

  // Handle Review submission
  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newReviewName.trim()) {
      toast.error('Please enter your name')
      return
    }

    const reviewObj = {
      name: newReviewName,
      rating: newReviewRating,
      comment: newReviewComment,
      date: 'Just now'
    }

    const updatedReviews = [reviewObj, ...reviews]
    setReviews(updatedReviews)
    localStorage.setItem(`reviews_${selectedVenue.id}`, JSON.stringify(updatedReviews))
    
    // Reset form
    setNewReviewName('')
    setNewReviewRating(5)
    setNewReviewComment('')
    toast.success('Thank you! Review posted successfully.')
  }

  // Filtered menu items
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(menuSearchQuery.toLowerCase()))

      const isVegTag = item.tags && (item.tags.includes('Veg') || item.tags.some((t: any) => t.name === 'Veg'))
      const matchesVeg = menuFilterVeg === null || 
        (menuFilterVeg === true && isVegTag) || 
        (menuFilterVeg === false && !isVegTag)

      return matchesSearch && matchesVeg
    })
  }, [menuItems, menuSearchQuery, menuFilterVeg])

  // Helper: check if outlet open right now
  const isOutletOpen = (venue: any) => {
    if (venue.status !== 'OPEN') return false
    
    // Calculate if it's currently open based on operating hours
    if (!venue.operatingHours || venue.operatingHours.length === 0) return true
    
    const daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
    const now = new Date()
    const todayDay = daysOfWeek[now.getDay()]
    const todayHours = venue.operatingHours.find((oh: any) => oh.day === todayDay)
    
    if (!todayHours || todayHours.isClosed) return false
    
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    const [openH, openM] = todayHours.openingTime.split(':').map(Number)
    const [closeH, closeM] = todayHours.closingTime.split(':').map(Number)
    const openMinutes = openH * 60 + openM
    let closeMinutes = closeH * 60 + closeM
    
    if (closeMinutes <= openMinutes) {
      closeMinutes += 24 * 60
    }
    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-16 font-sans">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
              <UtensilsCrossed className="size-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">
                CU Grab Eat
              </h1>
              <p className="text-[10px] text-zinc-500 font-medium tracking-wider uppercase">Campus Dining</p>
            </div>
          </div>
          
          <div className="flex rounded-lg border text-xs overflow-hidden bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setActiveTab('OUTLETS')}
              className={`px-3 py-1.5 font-medium transition-all ${activeTab === 'OUTLETS' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            >
              Outlets Map
            </button>
            <button
              onClick={() => setActiveTab('MESS_MENU')}
              className={`px-3 py-1.5 font-medium transition-all ${activeTab === 'MESS_MENU' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            >
              Hostel Mess Menu
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={onSwitchToAdmin}
              variant="outline"
              size="sm"
              className="gap-2 border-indigo-200 hover:border-indigo-400 dark:border-zinc-800 text-xs font-semibold"
            >
              <Shield className="size-3.5 text-indigo-600" />
              Admin Portal
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-950/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-4 border border-indigo-100 dark:border-indigo-900/50">
            <Sparkles className="size-3" /> {activeTab === 'OUTLETS' ? 'Campus Food Outlets Live Status' : 'Hostel Meals & Menu Timetable'}
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-zinc-900 dark:text-white">
            {activeTab === 'OUTLETS' ? 'Skip the Queues, Dine Smart' : 'Weekly Mess Menu & Ratings'}
          </h2>
          <p className="mt-3 max-w-xl mx-auto text-sm sm:text-base text-zinc-500 dark:text-zinc-400 font-medium">
            {activeTab === 'OUTLETS' 
              ? 'Check real-time opening hours, view menus, see coordinates on campus maps, and read peer reviews of all food joints.'
              : 'Review daily meal schedules across campus hostels, view operating hours, and rate today\'s dishes.'}
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Announcements Section */}
        {announcements.length > 0 && (
          <div className="relative bg-indigo-600/5 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-950/30 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="size-4 text-indigo-600" />
              <h3 className="text-sm font-bold tracking-tight text-indigo-900 dark:text-indigo-400">Campus Dining Announcements</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {announcements.map((ann) => (
                <div key={ann.id} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-4 rounded-xl shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-xs text-zinc-950 dark:text-white">{ann.title}</h4>
                    {ann.pinned && <Badge className="bg-rose-500 hover:bg-rose-600 text-[10px] text-white">Pinned</Badge>}
                  </div>
                  <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3">{ann.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'OUTLETS' ? (
          <>
            {/* Live Interactive Map Section */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold tracking-tight flex items-center gap-1.5">
                  <MapPin className="size-4 text-indigo-600" /> Interactive Outlets Map
                </h3>
              </div>
              <div className="w-full h-80 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white shadow-sm">
                <iframe
                  ref={mapRef}
                  src="/map-view.html"
                  className="w-full h-full border-none"
                  title="Campus Map"
                />
              </div>
            </section>

            {/* Filters and Search */}
            <section className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search outlet name, description, building..."
                  className="pl-10 h-10 text-xs w-full"
                />
              </div>
              
              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                <div className="flex-1 md:w-44">
                  <Select value={selectedBuilding} onValueChange={(val) => setSelectedBuilding(val || 'ALL')}>
                    <SelectTrigger className="h-10 text-xs"><SelectValue placeholder="All Buildings" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Buildings</SelectItem>
                      {buildings.filter(b => b !== 'ALL').map(b => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 md:w-44">
                  <Select value={selectedStatus} onValueChange={(val) => setSelectedStatus(val || 'ALL')}>
                    <SelectTrigger className="h-10 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Statuses</SelectItem>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                      <SelectItem value="TEMPORARILY_CLOSED">Temporarily Closed</SelectItem>
                      <SelectItem value="MAINTENANCE">Under Maintenance</SelectItem>
                      <SelectItem value="COMING_SOON">Coming Soon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Outlets Listing */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="animate-spin size-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
                <p className="text-xs text-zinc-400">Loading campus outlets...</p>
              </div>
            ) : filteredVenues.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-zinc-900 border rounded-2xl border-dashed">
                <AlertCircle className="size-8 mx-auto text-zinc-300 dark:text-zinc-600" />
                <h3 className="mt-2 text-sm font-semibold">No outlets found</h3>
                <p className="text-xs text-zinc-400 mt-1">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVenues.map((venue) => {
                  const openNow = isOutletOpen(venue)
                  const statusColors: Record<string, string> = {
                    OPEN: openNow ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/50' : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200/50',
                    CLOSED: 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200/50',
                    TEMPORARILY_CLOSED: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200/50',
                    COMING_SOON: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200/50',
                    MAINTENANCE: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/50'
                  }

                  const statusLabels: Record<string, string> = {
                    OPEN: openNow ? 'Open Now' : 'Closed',
                    CLOSED: 'Closed',
                    TEMPORARILY_CLOSED: 'Temp Closed',
                    COMING_SOON: 'Coming Soon',
                    MAINTENANCE: 'Maintenance'
                  }

                  const firstImage = venue.images && venue.images.length > 0 ? venue.images[0].url : 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=400'

                  return (
                    <motion.div
                      key={venue.id}
                      layoutId={`venue-card-${venue.id}`}
                      onClick={() => handleOpenVenueDetails(venue)}
                      className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden cursor-pointer hover:shadow-md hover:border-indigo-500/20 dark:hover:border-indigo-400/20 transition-all flex flex-col group"
                    >
                      <div className="h-44 w-full overflow-hidden relative bg-zinc-100 dark:bg-zinc-800">
                        <img
                          src={firstImage}
                          alt={venue.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-sm ${statusColors[venue.status] || ''}`}>
                            {statusLabels[venue.status]}
                          </span>
                        </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {venue.name}
                            </h4>
                          </div>
                          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{venue.description || 'No description provided.'}</p>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
                          <span className="flex items-center gap-1"><MapPin className="size-3.5" /> {venue.building || 'Campus'}</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                            Menu <ChevronRight className="size-3" />
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Service hours timetable */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold tracking-tight mb-4 flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <Clock className="size-4" /> Mess Timetable & Service Hours
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {messTimings.map((t: any) => {
                  const formatTime = (timeStr: string) => {
                    const [hStr, mStr] = timeStr.split(':')
                    const h = parseInt(hStr)
                    const ampm = h >= 12 ? 'PM' : 'AM'
                    const hour = h % 12 === 0 ? 12 : h % 12
                    return `${hour}:${mStr} ${ampm}`
                  }
                  return (
                    <div key={t.mealType} className="p-3 bg-zinc-50 dark:bg-zinc-950 border rounded-xl flex flex-col justify-between">
                      <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">
                        {t.mealType.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mt-1">
                        {formatTime(t.openingTime)} - {formatTime(t.closingTime)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Weekly Days List */}
            <div className="space-y-6">
              {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((dayName) => {
                const dayMeals = weeklyMessMenu.filter((m: any) => m.day === dayName)
                const isMenuAvailable = dayMeals.length > 0

                return (
                  <div key={dayName} className="bg-white dark:bg-zinc-900 border rounded-2xl p-6 shadow-sm border-zinc-200/80 dark:border-zinc-800/80">
                    <h3 className="text-sm font-bold tracking-tight uppercase border-b pb-3 mb-4 text-zinc-900 dark:text-white">
                      {dayName}
                    </h3>
                    
                    {!isMenuAvailable ? (
                      <div className="text-center py-6 text-zinc-400 dark:text-zinc-500 italic text-xs">
                        Menu not available
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dayMeals.map((meal: any) => {
                          const avgRating = meal.ratingCount > 0 ? (meal.ratingSum / meal.ratingCount).toFixed(1) : null
                          
                          return (
                            <div key={meal.id} className="p-4 bg-zinc-50 dark:bg-zinc-950 border rounded-xl flex flex-col justify-between gap-3 border-zinc-200/50 dark:border-zinc-800/50">
                              <div>
                                <span className="text-[9px] font-bold uppercase text-indigo-600 dark:text-indigo-400 tracking-widest">
                                  {meal.mealType.replace('_', ' ')}
                                </span>
                                <h4 className="text-xs font-bold text-zinc-950 dark:text-white mt-1">
                                  {meal.dishName.replace(` (${dayName.substring(0, 3)})`, '')}
                                </h4>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center gap-1">
                                  <Star className={`size-3.5 ${avgRating ? 'text-amber-400 fill-current' : 'text-zinc-300'}`} />
                                  <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
                                    {avgRating ? `${avgRating} (${meal.ratingCount})` : 'No rating'}
                                  </span>
                                </div>

                                <div className="flex items-center gap-0.5">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      onClick={async () => {
                                        toast.loading('Submitting rating...', { id: 'rating-sub' })
                                        const res = await apiRequest(`/mess-menu/${meal.id}/rate`, {
                                          method: 'POST',
                                          body: JSON.stringify({ rating: star }),
                                        })
                                        toast.dismiss('rating-sub')
                                        if (res.success) {
                                          toast.success('Thank you for rating!')
                                          const updatedRes = await apiRequest('/mess-menu')
                                          if (updatedRes.success && updatedRes.data) {
                                            setWeeklyMessMenu(updatedRes.data)
                                          }
                                        } else {
                                          toast.error('Failed to submit rating')
                                        }
                                      }}
                                      className="size-5 flex items-center justify-center hover:scale-110 transition-transform text-zinc-300 hover:text-amber-400 focus:outline-none"
                                      title={`Rate ${star} star`}
                                    >
                                      <Star className="size-3 hover:fill-current" />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* Outlet Details Overlay Modal */}
      <AnimatePresence>
        {selectedVenue && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-xl h-full bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="relative h-48 bg-zinc-100 dark:bg-zinc-900">
                <img
                  src={selectedVenue.images && selectedVenue.images.length > 0 ? selectedVenue.images[0].url : 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=600'}
                  alt={selectedVenue.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button
                  onClick={() => setSelectedVenue(null)}
                  className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 backdrop-blur-sm transition-colors"
                >
                  <X className="size-4" />
                </button>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-lg font-bold">{selectedVenue.name}</h3>
                  <p className="text-xs text-zinc-200 flex items-center gap-1 mt-1"><MapPin className="size-3" /> {selectedVenue.building || 'Campus'}</p>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Contact and timing bar */}
                <div className="grid grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-900/50 border rounded-xl p-4 text-xs">
                  <div className="space-y-1">
                    <span className="font-semibold text-zinc-400 flex items-center gap-1"><Clock className="size-3.5" /> Timing Info</span>
                    <p className="font-medium text-zinc-700 dark:text-zinc-300">
                      {selectedVenue.operatingHours && selectedVenue.operatingHours.length > 0 ? 'Weekly Schedule Added' : 'Daily 9:00 AM - 10:00 PM'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-semibold text-zinc-400 flex items-center gap-1"><Phone className="size-3.5" /> Contact Call</span>
                    <p className="font-medium text-zinc-700 dark:text-zinc-300">{selectedVenue.phone || 'N/A'}</p>
                  </div>
                </div>

                {/* About Description */}
                {selectedVenue.description && (
                  <div>
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">About the outlet</h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{selectedVenue.description}</p>
                  </div>
                )}

                {/* Interactive Menu Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Food Menu & Categories</h4>
                    <Badge variant="outline" className="text-[10px]">{filteredMenuItems.length} Items</Badge>
                  </div>

                  {/* Menu filters */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-zinc-400" />
                      <Input
                        value={menuSearchQuery}
                        onChange={(e) => setMenuSearchQuery(e.target.value)}
                        placeholder="Search menu..."
                        className="pl-8 h-8 text-[11px]"
                      />
                    </div>
                    <div className="flex rounded-md border text-[11px] overflow-hidden shrink-0 bg-white dark:bg-zinc-900">
                      <button
                        onClick={() => setMenuFilterVeg(null)}
                        className={`px-3 py-1.5 ${menuFilterVeg === null ? 'bg-indigo-600 text-white font-medium' : ''}`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setMenuFilterVeg(true)}
                        className={`px-3 py-1.5 border-l ${menuFilterVeg === true ? 'bg-emerald-600 text-white font-medium' : 'text-emerald-600 font-medium'}`}
                      >
                        Veg
                      </button>
                      <button
                        onClick={() => setMenuFilterVeg(false)}
                        className={`px-3 py-1.5 border-l ${menuFilterVeg === false ? 'bg-red-600 text-white font-medium' : 'text-red-600 font-medium'}`}
                      >
                        Non-Veg
                      </button>
                    </div>
                  </div>

                  {loadingMenu ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin size-5 border-2 border-indigo-600 border-t-transparent rounded-full" />
                    </div>
                  ) : filteredMenuItems.length === 0 ? (
                    <p className="text-xs text-center py-6 text-zinc-400 italic">No food items match the search filters.</p>
                  ) : (
                    <div className="space-y-4">
                      {venueCategories.map((category) => {
                        const catItems = filteredMenuItems.filter(item => item.categoryId === category.id)
                        if (catItems.length === 0) return null

                        return (
                          <div key={category.id} className="space-y-2">
                            <h5 className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wide uppercase">{category.name}</h5>
                            <div className="grid gap-3">
                              {catItems.map((item) => {
                                const isVeg = item.tags && (item.tags.includes('Veg') || item.tags.some((t: any) => t.name === 'Veg'))
                                return (
                                  <div key={item.id} className="flex justify-between items-start bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-900 p-3 rounded-xl">
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-1.5">
                                        <span className={`w-2.5 h-2.5 border rounded-sm flex items-center justify-center shrink-0 ${isVeg ? 'border-emerald-600' : 'border-red-600'}`}>
                                          <span className={`w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-emerald-600' : 'bg-red-600'}`} />
                                        </span>
                                        <span className="font-bold text-xs text-zinc-950 dark:text-white">{item.name}</span>
                                      </div>
                                      {item.description && <p className="text-[10px] text-zinc-400">{item.description}</p>}
                                      <div className="text-[10px] text-zinc-500 font-medium">Prep: {item.preparationTime || 15} mins</div>
                                    </div>
                                    <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">₹{item.price}</span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Reviews Section */}
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <MessageSquare className="size-3.5 text-indigo-600" /> Student Reviews & Feedback
                  </h4>

                  {/* Add Review Form */}
                  <form onSubmit={handleAddReview} className="bg-zinc-50 dark:bg-zinc-900/50 border rounded-xl p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-zinc-400">Your Name</label>
                        <Input
                          value={newReviewName}
                          onChange={(e) => setNewReviewName(e.target.value)}
                          placeholder="e.g. Aaryan"
                          className="h-8 text-[11px]"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-zinc-400">Rating Stars</label>
                        <Select
                          value={newReviewRating.toString()}
                          onValueChange={(val) => setNewReviewRating(parseInt(val || '5'))}
                        >
                          <SelectTrigger className="h-8 text-[11px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">⭐⭐⭐⭐⭐ (5/5)</SelectItem>
                            <SelectItem value="4">⭐⭐⭐⭐ (4/5)</SelectItem>
                            <SelectItem value="3">⭐⭐⭐ (3/5)</SelectItem>
                            <SelectItem value="2">⭐⭐ (2/5)</SelectItem>
                            <SelectItem value="1">⭐ (1/5)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-zinc-400">Comment / Review</label>
                      <Input
                        value={newReviewComment}
                        onChange={(e) => setNewReviewComment(e.target.value)}
                        placeholder="Say something about their menu or service..."
                        className="h-8 text-[11px]"
                      />
                    </div>
                    <Button type="submit" size="sm" className="w-full text-xs font-semibold h-8 bg-indigo-600 hover:bg-indigo-700">
                      Submit Review
                    </Button>
                  </form>

                  {/* Reviews List */}
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {reviews.map((rev, idx) => (
                      <div key={idx} className="border-b last:border-0 pb-3 border-zinc-100 dark:border-zinc-900 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-zinc-950 dark:text-white">{rev.name}</span>
                          <span className="text-[10px] text-zinc-400">{rev.date}</span>
                        </div>
                        <div className="flex text-amber-400 gap-0.5 my-1">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="size-3 fill-current" />
                          ))}
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-400 text-[11px]">{rev.comment || 'No comment provided.'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

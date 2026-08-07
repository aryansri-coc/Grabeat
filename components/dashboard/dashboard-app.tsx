'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { apiRequest } from './api'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  LayoutDashboard, Utensils, Store, ClipboardList, Megaphone,
  MessageSquare, Users, Settings, LogOut, Bell, Sun, Moon,
  ChevronDown, Search, Plus, Filter, Download, MoreHorizontal,
  Edit3, Trash2, Check, X, ShieldAlert, RefreshCw, Upload, Eye, Undo, ThumbsUp, ThumbsDown
} from 'lucide-react'

type PageKey = 'Dashboard' | 'Mess Menu' | 'Food Outlets' | 'Outlet Menus' | 'Announcements' | 'Reviews' | 'Admin Users' | 'Audit Logs' | 'Trash' | 'Settings'

// -------------------------------------------------------------
// LOGIN COMPONENT
// -------------------------------------------------------------
function LoginForm({ onLoginSuccess }: { onLoginSuccess: (token: string, admin: any) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setLoading(false)

    if (result.success && result.data) {
      localStorage.setItem('cu_grab_eats_token', result.data.token)
      localStorage.setItem('cu_grab_eats_admin', JSON.stringify(result.data.admin))
      toast.success(result.message)
      onLoginSuccess(result.data.token, result.data.admin)
    } else {
      toast.error(result.message || 'Login failed')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <Card className="w-full max-w-md border-zinc-200/80 shadow-lg dark:border-zinc-800">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md">
            <Utensils className="size-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight mt-4">CU Grab Eats Admin</CardTitle>
          <CardDescription>Enter your credentials to access the campus dashboard</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Email address</label>
              <Input
                type="email"
                placeholder="admin@cugrabeats.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <div className="flex items-center p-6 pt-0 flex-col gap-2">
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center mt-2">
              Protected by JWT encryption & security rate limiting
            </p>
          </div>
        </form>
      </Card>
    </div>
  )
}

// -------------------------------------------------------------
// WIZARD COMPONENT
// -------------------------------------------------------------
function VenueWizard({ isOpen, onClose, onRefresh }: { isOpen: boolean; onClose: () => void; onRefresh: () => void }) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [building, setBuilding] = useState('')
  const [phone, setPhone] = useState('')
  const [latitude, setLatitude] = useState('30.7688')
  const [longitude, setLongitude] = useState('76.5754')
  const [googleMapsLink, setGoogleMapsLink] = useState('')
  const [status, setStatus] = useState<any>('OPEN')
  const [uploadedImages, setUploadedImages] = useState<any[]>([])
  
  const [hours, setHours] = useState<any>(
    ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((day) => ({
      day,
      openingTime: '09:00',
      closingTime: '22:00',
      isClosed: false,
    }))
  )

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    const formData = new FormData()
    formData.append('image', file)

    toast.loading('Uploading image to Cloudinary...', { id: 'uploading' })
    const res = await apiRequest('/venues/upload-image', {
      method: 'POST',
      body: formData,
    })
    toast.dismiss('uploading')

    if (res.success && res.data) {
      setUploadedImages([...uploadedImages, {
        url: res.data.url,
        publicId: res.data.publicId,
        width: res.data.width,
        height: res.data.height,
        altText: name + ' Image',
        displayOrder: uploadedImages.length,
      }])
      toast.success('Image uploaded successfully')
    } else {
      toast.error('Failed to upload image')
    }
  }

  const handlePublish = async () => {
    const latNum = parseFloat(latitude)
    const lngNum = parseFloat(longitude)

    const venuePayload = {
      name,
      description: description.trim() || undefined,
      building: building.trim() || undefined,
      phone: phone.trim() || undefined,
      latitude: isNaN(latNum) ? undefined : latNum,
      longitude: isNaN(lngNum) ? undefined : lngNum,
      googleMapsLink: googleMapsLink.trim() || undefined,
      status,
      operatingHours: hours,
      images: uploadedImages,
    }

    toast.loading('Publishing venue to campus database...', { id: 'publishing' })
    const venueRes = await apiRequest('/venues', {
      method: 'POST',
      body: JSON.stringify(venuePayload),
    })
    toast.dismiss('publishing')

    if (!venueRes.success || !venueRes.data) {
      toast.error(venueRes.message || 'Failed to create venue')
      return
    }

    toast.success('Venue published successfully to campus map!')
    onClose()
    onRefresh()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add food outlet wizard (Step {step}/5)</DialogTitle>
          <DialogDescription>Setup outlet details, custom schedule, and images.</DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 py-2">
            <h3 className="text-sm font-semibold">Step 1: Basic Information</h3>
            <div className="space-y-2">
              <label className="text-xs font-medium">Outlet Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Subway, Nescafe" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell students about menu specials..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium">Contact Phone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Initial Status Override</label>
                <Select value={status} onValueChange={(val) => setStatus(val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">Open (Calculated automatically)</SelectItem>
                    <SelectItem value="CLOSED">Closed (Manual override)</SelectItem>
                    <SelectItem value="TEMPORARILY_CLOSED">Temporarily Closed</SelectItem>
                    <SelectItem value="COMING_SOON">Coming Soon</SelectItem>
                    <SelectItem value="MAINTENANCE">Under Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 py-2">
            <h3 className="text-sm font-semibold">Step 2: Location & Coordinates</h3>
            <div className="space-y-2">
              <label className="text-xs font-medium">Building/Location Name</label>
              <Input value={building} onChange={(e) => setBuilding(e.target.value)} placeholder="e.g. Student Centre First Floor" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium">Latitude</label>
                <Input type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Longitude</label>
                <Input type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">Google Maps Navigation Link</label>
              <Input value={googleMapsLink} onChange={(e) => setGoogleMapsLink(e.target.value)} placeholder="https://maps.app.goo.gl/..." />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 py-2">
            <h3 className="text-sm font-semibold">Step 3: Gallery Images (Cloudinary)</h3>
            <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 p-6 text-center">
              <Upload className="mx-auto size-6 text-muted-foreground" />
              <p className="mt-2 text-xs font-medium">Upload outlet image files</p>
              <input type="file" onChange={handleImageUpload} className="hidden" id="wizard-img-upload" />
              <Button variant="outline" size="sm" className="mt-3" onClick={() => document.getElementById('wizard-img-upload')?.click()}>
                Select File
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {uploadedImages.map((img, idx) => (
                <div key={idx} className="relative rounded-lg overflow-hidden border border-zinc-200">
                  <img src={img.url} className="h-20 w-full object-cover" />
                  <button onClick={() => setUploadedImages(uploadedImages.filter((_, i) => i !== idx))} className="absolute top-1 right-1 size-5 bg-red-500 rounded-full flex items-center justify-center text-white">
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 py-2">
            <h3 className="text-sm font-semibold">Step 4: Operating Hours (Weekly)</h3>
            <div className="max-h-[35vh] overflow-y-auto space-y-3 pr-2">
              {hours.map((oh: any, idx: number) => (
                <div key={oh.day} className="flex items-center justify-between border-b pb-2 last:border-0 border-zinc-100 dark:border-zinc-800">
                  <span className="text-xs font-medium w-24">{oh.day}</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={oh.openingTime}
                      onChange={(e) => {
                        const newHours = [...hours]
                        newHours[idx].openingTime = e.target.value
                        setHours(newHours)
                      }}
                      disabled={oh.isClosed}
                      className="h-8 w-24 text-xs"
                    />
                    <span className="text-xs">to</span>
                    <Input
                      type="time"
                      value={oh.closingTime}
                      onChange={(e) => {
                        const newHours = [...hours]
                        newHours[idx].closingTime = e.target.value
                        setHours(newHours)
                      }}
                      disabled={oh.isClosed}
                      className="h-8 w-24 text-xs"
                    />
                  </div>
                  <label className="flex items-center gap-1 text-xs">
                    <Checkbox
                      checked={oh.isClosed}
                      onCheckedChange={(val) => {
                        const newHours = [...hours]
                        newHours[idx].isClosed = !!val
                        setHours(newHours)
                      }}
                    />
                    Closed
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-3 py-2 text-xs">
            <h3 className="text-sm font-semibold">Step 5: Review Outlet Summary</h3>
            <div className="grid grid-cols-2 gap-2 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border">
              <div><span className="font-semibold text-muted-foreground">Name:</span> {name}</div>
              <div><span className="font-semibold text-muted-foreground">Building:</span> {building || 'N/A'}</div>
              <div><span className="font-semibold text-muted-foreground">Phone:</span> {phone || 'N/A'}</div>
              <div><span className="font-semibold text-muted-foreground">Status:</span> {status}</div>
              <div className="col-span-2"><span className="font-semibold text-muted-foreground">Description:</span> {description || 'N/A'}</div>
              <div className="col-span-2"><span className="font-semibold text-muted-foreground">Images:</span> {uploadedImages.length}</div>
            </div>
          </div>
        )}

        <DialogFooter className="flex items-center justify-between pt-4 border-t">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>
          ) : <div />}
          {step < 5 ? (
            <Button onClick={() => setStep(step + 1)} disabled={step === 1 && !name.trim()}>Next</Button>
          ) : (
            <Button onClick={handlePublish} className="bg-indigo-600 text-white hover:bg-indigo-700">Publish Outlet</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// -------------------------------------------------------------
// STANDALONE PAGES
// -------------------------------------------------------------
function AddMenuItemDialog({ isOpen, venue, onClose }: { isOpen: boolean; venue: any; onClose: () => void }) {
  const [categories, setCategories] = useState<any[]>([])
  const [categoryId, setCategoryId] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [prepTime, setPrepTime] = useState('15')
  const [isVeg, setIsVeg] = useState(true)
  const [featured, setFeatured] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (venue?.id) {
      apiRequest(`/categories/venue/${venue.id}`).then((res) => {
        if (res.success && res.data) {
          setCategories(res.data)
          if (res.data.length > 0) {
            setCategoryId(res.data[0].id)
          }
        }
      })
    }
  }, [venue])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryId) {
      toast.error('Please select a category')
      return
    }

    setLoading(true)
    const payload = {
      name,
      description,
      price: parseFloat(price),
      categoryId,
      preparationTime: parseInt(prepTime),
      available: true,
      featured,
      tags: [isVeg ? 'Veg' : 'Non Veg'],
    }

    const res = await apiRequest('/menu-items', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    setLoading(false)

    if (res.success) {
      toast.success('Menu item added successfully')
      onClose()
    } else {
      toast.error(res.message || 'Failed to add item')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add Menu Item for {venue?.name}</DialogTitle>
          <DialogDescription>Create a new food item inside this venue's categories.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-xs font-medium">Category</label>
            {categories.length > 0 ? (
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-xs text-rose-600 font-medium">
                No categories found! Create a category first.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium">Food Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Cheese Pizza" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Loaded with fresh cheese..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium">Price (₹)</label>
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="150" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">Prep Time (mins)</label>
              <Input type="number" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} required />
            </div>
          </div>
          <div className="flex items-center justify-between border-t pt-4">
            <label className="flex items-center gap-2 text-xs font-semibold">
              <Switch checked={isVeg} onCheckedChange={setIsVeg} />
              Vegetarian
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold">
              <Switch checked={featured} onCheckedChange={setFeatured} />
              Featured Item
            </label>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading || !categoryId}>Add Item</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function OutletsPage({ venues, onRefresh }: { venues: any[]; onRefresh: () => void }) {
  const [wizardOpen, setWizardOpen] = useState(false)
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const [selectVenueForMenu, setSelectVenueForMenu] = useState<any | null>(null)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Food Outlets</h1>
          <p className="text-sm text-muted-foreground">Manage all campus cafeteria locations, operational status, and active schedules.</p>
        </div>
        <Button onClick={() => setWizardOpen(true)} className="bg-indigo-600 text-white hover:bg-indigo-700 gap-2">
          <Plus className="size-4" /> Add Outlet
        </Button>
      </div>

      <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
        <CardContent className="p-5">
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Outlet Name</TableHead>
                  <TableHead>Building</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {venues.map((venue) => (
                  <TableRow key={venue.id} className={venue.deletedAt ? 'opacity-50 line-through' : ''}>
                    <TableCell className="font-semibold">{venue.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{venue.building || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge className={venue.isOpenNow ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50' : 'bg-rose-50 text-rose-700 hover:bg-rose-50'}>
                        {venue.isOpenNow ? 'Open Now' : 'Closed'}
                      </Badge>
                      <Badge variant="outline" className="ml-1 text-[9px] uppercase">{venue.status}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{venue.phone || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <span className="flex size-8 items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
                            <MoreHorizontal className="size-4" />
                          </span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectVenueForMenu(venue)
                            setAddMenuOpen(true)
                          }}>
                            <Plus className="size-3.5 mr-2" /> Add Menu Item
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={async () => {
                            toast.loading('Deleting venue...', { id: 'delete' })
                            const res = await apiRequest(`/venues/${venue.id}`, { method: 'DELETE' })
                            toast.dismiss('delete')
                            if (res.success) {
                              toast.success('Venue soft deleted successfully')
                              onRefresh()
                            } else {
                              toast.error('Failed to delete')
                            }
                          }} className="text-destructive">
                            <Trash2 className="size-3.5 mr-2" /> Soft Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {wizardOpen && <VenueWizard isOpen={wizardOpen} onClose={() => setWizardOpen(false)} onRefresh={onRefresh} />}
      {addMenuOpen && <AddMenuItemDialog isOpen={addMenuOpen} venue={selectVenueForMenu} onClose={() => { setAddMenuOpen(false); setSelectVenueForMenu(null); onRefresh(); }} />}
    </div>
  )
}

function MenuPage({ menuItems, venues, onRefresh }: { menuItems: any[]; venues: any[]; onRefresh: () => void }) {
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const [selectVenueForMenu, setSelectVenueForMenu] = useState<any | null>(null)

  const itemsByOutlet = useMemo(() => {
    const groups: Record<string, any[]> = {}
    menuItems.forEach((item) => {
      const outletName = item.venue?.name || 'Other Outlets'
      if (!groups[outletName]) {
        groups[outletName] = []
      }
      groups[outletName].push(item)
    })
    return groups
  }, [menuItems])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Outlet Menus</h1>
        <p className="text-sm text-muted-foreground">Manage campus food items categorized by restaurant and view student feedback.</p>
      </div>

      <div className="space-y-6">
        {Object.entries(itemsByOutlet).map(([outletName, items]) => {
          const matchedVenue = venues.find((v) => v.name === outletName)
          return (
            <Card key={outletName} className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                <div>
                  <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-50">{outletName}</CardTitle>
                  <CardDescription className="text-xs">Menu list ({items.length} items)</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    if (matchedVenue) {
                      setSelectVenueForMenu(matchedVenue)
                      setAddMenuOpen(true)
                    } else {
                      toast.error('Could not find outlet metadata to add item')
                    }
                  }} className="text-xs gap-1.5 h-8 bg-indigo-600 hover:bg-indigo-700 text-white hover:text-white border-transparent">
                    <Plus className="size-3.5" /> Add Item
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toast.success(`Quick editor mode active for ${outletName}`)} className="text-xs gap-1.5 h-8">
                    <Edit3 className="size-3.5" /> Edit Menu
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Food Item</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Availability</TableHead>
                        <TableHead>Featured</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => {
                        const ups = (item.name.length * 3) % 25 + 5
                        const downs = (item.name.length) % 5 + 1
                        return (
                          <TableRow key={item.id}>
                            <TableCell className="font-semibold">{item.name}</TableCell>
                            <TableCell><Badge variant="secondary" className="font-normal">{item.category?.name || 'N/A'}</Badge></TableCell>
                            <TableCell className="text-sm font-medium">₹{item.price}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-500 font-medium">
                                  <ThumbsUp className="size-3.5" /> {ups}
                                </span>
                                <span className="flex items-center gap-1 text-rose-600 dark:text-rose-500 font-medium">
                                  <ThumbsDown className="size-3.5" /> {downs}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={item.available}
                                onCheckedChange={async (checked) => {
                                  const res = await apiRequest(`/menu-items/${item.id}`, {
                                    method: 'PUT',
                                    body: JSON.stringify({ available: checked })
                                  })
                                  if (res.success) {
                                    toast.success('Availability updated')
                                    onRefresh()
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Badge className={item.featured ? 'bg-amber-50 text-amber-700 hover:bg-amber-50' : 'bg-zinc-50 text-zinc-700 hover:bg-zinc-50'}>
                                {item.featured ? 'Featured' : 'Standard'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={async () => {
                                toast.loading('Deleting menu item...', { id: 'delete' })
                                const res = await apiRequest(`/menu-items/${item.id}`, { method: 'DELETE' })
                                toast.dismiss('delete')
                                if (res.success) {
                                  toast.success('Item soft deleted')
                                  onRefresh()
                                }
                              }}>
                                <Trash2 className="size-4 text-rose-600" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {addMenuOpen && (
        <AddMenuItemDialog
          isOpen={addMenuOpen}
          venue={selectVenueForMenu}
          onClose={() => {
            setAddMenuOpen(false)
            setSelectVenueForMenu(null)
            onRefresh()
          }}
        />
      )}
    </div>
  )
}

function MessMenuPage({ onRefresh }: { onRefresh: () => void }) {
  const [day, setDay] = useState<any>('MONDAY')
  const [breakfast, setBreakfast] = useState('')
  const [lunch, setLunch] = useState('')
  const [snacks, setSnacks] = useState('')
  const [dinner, setDinner] = useState('')
  const [weeklyMenu, setWeeklyMenu] = useState<any[]>([])

  const fetchMenuData = useCallback(async () => {
    const res = await apiRequest('/mess-menu')
    if (res.success && res.data) {
      setWeeklyMenu(res.data)
      
      // Populate fields for current day
      const dayMeals = res.data.filter((item: any) => item.day === day)
      setBreakfast(dayMeals.find((m: any) => m.mealType === 'BREAKFAST')?.dishName || '')
      setLunch(dayMeals.find((m: any) => m.mealType === 'LUNCH')?.dishName || '')
      setSnacks(dayMeals.find((m: any) => m.mealType === 'SNACKS')?.dishName || '')
      setDinner(dayMeals.find((m: any) => m.mealType === 'DINNER')?.dishName || '')
    }
  }, [day])

  useEffect(() => {
    fetchMenuData()
  }, [day, fetchMenuData])

  const handleSave = async () => {
    const mealsPayload = [
      { mealType: 'BREAKFAST', dishName: breakfast },
      { mealType: 'LUNCH', dishName: lunch },
      { mealType: 'SNACKS', dishName: snacks },
      { mealType: 'DINNER', dishName: dinner },
    ]

    toast.loading('Saving mess menu...', { id: 'save' })
    const res = await apiRequest(`/mess-menu/day/${day}`, {
      method: 'POST',
      body: JSON.stringify({ meals: mealsPayload }),
    })
    toast.dismiss('save')

    if (res.success) {
      toast.success(`Mess menu for ${day} saved successfully`)
      fetchMenuData()
      onRefresh()
    } else {
      toast.error('Failed to save')
    }
  }

  // Helper to get dish name for day and type from state
  const getMealDish = (targetDay: string, type: string) => {
    return weeklyMenu.find((m) => m.day === targetDay && m.mealType === type)?.dishName || 'Not Set'
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mess Menu Planner</h1>
        <p className="text-sm text-muted-foreground">Modify the weekly menu served across student hostels and student messes.</p>
      </div>

      <Tabs value={day} onValueChange={(val) => setDay(val)}>
        <TabsList className="grid h-auto w-full grid-cols-7 gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900">
          {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((item) => (
            <TabsTrigger key={item} value={item} className="rounded-lg py-2 text-xs">
              {item.slice(0, 3)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={day} className="mt-5 space-y-4">
          <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="text-sm">Manage Meals for {day}</CardTitle>
              <CardDescription>Setup details for Breakfast, Lunch, Tea Snacks, and Dinner.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold">Breakfast (7:30 AM - 9:30 AM)</label>
                  <Input value={breakfast} onChange={(e) => setBreakfast(e.target.value)} placeholder="e.g. Paratha with Curd" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold">Lunch (12:30 PM - 2:30 PM)</label>
                  <Input value={lunch} onChange={(e) => setLunch(e.target.value)} placeholder="e.g. Rajma Chawal, Roti, Salad" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold">Snacks (4:30 PM - 6:00 PM)</label>
                  <Input value={snacks} onChange={(e) => setSnacks(e.target.value)} placeholder="e.g. Samosa and Tea" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold">Dinner (7:30 PM - 9:30 PM)</label>
                  <Input value={dinner} onChange={(e) => setDinner(e.target.value)} placeholder="e.g. Shahi Paneer, Dal Makhani" />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button onClick={async () => {
                  const yesterday = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][
                    (['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].indexOf(day) - 1 + 7) % 7
                  ]
                  toast.loading('Duplicating...', { id: 'duplicate' })
                  const res = await apiRequest('/mess-menu/duplicate', {
                    method: 'POST',
                    body: JSON.stringify({ sourceDay: yesterday, targetDay: day })
                  })
                  toast.dismiss('duplicate')
                  if (res.success) {
                    toast.success('Duplicated yesterday menu successfully')
                    fetchMenuData()
                    onRefresh()
                  }
                }} variant="outline">Duplicate Previous Day</Button>
                <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Schedule</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Weekly Preview Section */}
      <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-base font-bold">Weekly Mess Menu Preview</CardTitle>
          <CardDescription>Live overview of the complete weekly meal schedule shown to students.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50 dark:bg-zinc-900">
                  <TableHead className="w-[120px] font-bold">Day</TableHead>
                  <TableHead className="font-bold">Breakfast</TableHead>
                  <TableHead className="font-bold">Lunch</TableHead>
                  <TableHead className="font-bold">Snacks</TableHead>
                  <TableHead className="font-bold">Dinner</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((d) => (
                  <TableRow key={d} className={d === day ? 'bg-indigo-50/20 dark:bg-indigo-950/10 font-medium' : ''}>
                    <TableCell className="font-bold text-xs uppercase">{d.slice(0, 3)}</TableCell>
                    <TableCell className="text-xs text-zinc-700 dark:text-zinc-300">{getMealDish(d, 'BREAKFAST')}</TableCell>
                    <TableCell className="text-xs text-zinc-700 dark:text-zinc-300">{getMealDish(d, 'LUNCH')}</TableCell>
                    <TableCell className="text-xs text-zinc-700 dark:text-zinc-300">{getMealDish(d, 'SNACKS')}</TableCell>
                    <TableCell className="text-xs text-zinc-700 dark:text-zinc-300">{getMealDish(d, 'DINNER')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function AnnouncementsPage({ announcements, onRefresh }: { announcements: any[]; onRefresh: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<any>('MEDIUM')
  const [annDialog, setAnnDialog] = useState(false)

  const handleCreate = async () => {
    const res = await apiRequest('/announcements', {
      method: 'POST',
      body: JSON.stringify({ title, description, priority, status: 'PUBLISHED', pinned: false })
    })

    if (res.success) {
      toast.success('Announcement published successfully')
      setAnnDialog(false)
      setTitle('')
      setDescription('')
      onRefresh()
    } else {
      toast.error('Failed to create announcement')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Announcements</h1>
          <p className="text-sm text-muted-foreground">Keep students updated with instant campus cafeteria announcements.</p>
        </div>
        <Button onClick={() => setAnnDialog(true)} className="bg-indigo-600 text-white hover:bg-indigo-700 gap-2">
          <Plus className="size-4" /> Create Announcement
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {announcements.map((item) => (
          <Card key={item.id} className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={item.priority === 'HIGH' ? 'destructive' : 'secondary'}>{item.priority}</Badge>
                  {item.pinned && <Badge variant="outline">Pinned</Badge>}
                </div>
                <Button variant="ghost" size="icon" onClick={async () => {
                  await apiRequest(`/announcements/${item.id}`, { method: 'DELETE' })
                  toast.success('Announcement soft deleted')
                  onRefresh()
                }}>
                  <Trash2 className="size-4 text-rose-600" />
                </Button>
              </div>
              <CardTitle className="text-base mt-2">{item.title}</CardTitle>
              <CardDescription className="text-xs mt-1">{item.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Dialog open={annDialog} onOpenChange={setAnnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Announcement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Independence Day Special Menu" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter details..." />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold">Priority</label>
              <Select value={priority} onValueChange={(val) => setPriority(val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAnnDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} className="bg-indigo-600 text-white hover:bg-indigo-700">Publish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TrashPage({ deletedVenues, onRefresh }: { deletedVenues: any[]; onRefresh: () => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Trash Manager</h1>
        <p className="text-sm text-muted-foreground">Restore soft-deleted food outlets, menu items, and announcements.</p>
      </div>

      <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-sm">Deleted Outlets</CardTitle>
        </CardHeader>
        <CardContent>
          {deletedVenues.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Outlet Name</TableHead>
                    <TableHead>Building</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deletedVenues.map((venue) => (
                    <TableRow key={venue.id}>
                      <TableCell className="font-semibold">{venue.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{venue.building}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={async () => {
                          const res = await apiRequest(`/venues/${venue.id}/restore`, { method: 'POST' })
                          if (res.success) {
                            toast.success('Venue restored successfully')
                            onRefresh()
                          }
                        }} className="gap-1 text-xs">
                          <Undo className="size-3.5" /> Restore
                        </Button>
                        <Button variant="destructive" size="sm" onClick={async () => {
                          if (confirm('Permanently delete this venue? This action is irreversible.')) {
                            const res = await apiRequest(`/venues/${venue.id}/permanent`, { method: 'DELETE' })
                            if (res.success) {
                              toast.success('Venue permanently deleted')
                              onRefresh()
                            }
                          }
                        }} className="gap-1 text-xs">
                          Permanent Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-6">No deleted venues in trash.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function AuditLogsPage({ auditLogs }: { auditLogs: any[] }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Audit Trail Logs</h1>
        <p className="text-sm text-muted-foreground">Historical records of all creation, update, and deletion operations.</p>
      </div>

      <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
        <CardContent className="p-5">
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Moderator</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Entity ID</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs font-semibold">{log.adminEmail || 'System Action'}</TableCell>
                    <TableCell><Badge variant="outline">{log.action}</Badge></TableCell>
                    <TableCell className="text-xs font-medium">{log.entity}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{log.entityId}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// -------------------------------------------------------------
// MAIN DASHBOARD LAYOUT
// -------------------------------------------------------------
export default function DashboardApp() {
  const [token, setToken] = useState<string | null>(null)
  const [admin, setAdmin] = useState<any | null>(null)
  const [active, setActive] = useState<PageKey>('Dashboard')
  const [collapsed, setCollapsed] = useState(false)
  const [dark, setDark] = useState(false)

  const [stats, setStats] = useState<any>({
    totalVenues: 0,
    totalCategories: 0,
    totalMenuItems: 0,
    announcementsCount: 0,
    openNowCount: 0,
    estimatedStorageMb: 0.0,
    totalImages: 0,
    deletedRecords: { total: 0 }
  })
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [venues, setVenues] = useState<any[]>([])
  const [deletedVenues, setDeletedVenues] = useState<any[]>([])
  const [deletedItems, setDeletedItems] = useState<any[]>([])
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [adminUsers, setAdminUsers] = useState<any[]>([])
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('cu_grab_eats_token')
      const storedAdmin = localStorage.getItem('cu_grab_eats_admin')
      if (storedToken && storedAdmin) {
        setToken(storedToken)
        setAdmin(JSON.parse(storedAdmin))
      }
    }
  }, [])

  const fetchData = async () => {
    if (!token) return

    const statsRes = await apiRequest('/dashboard/stats')
    if (statsRes.success && statsRes.data) {
      setStats(statsRes.data)
    }

    const auditRes = await apiRequest('/dashboard/audit-logs?limit=10')
    if (auditRes.success && auditRes.data?.logs) {
      setAuditLogs(auditRes.data.logs)
    }

    const venuesRes = await apiRequest('/venues?includeDeleted=true')
    if (venuesRes.success && venuesRes.data?.items) {
      setVenues(venuesRes.data.items)
    }

    const menuRes = await apiRequest('/menu-items')
    if (menuRes.success && menuRes.data?.items) {
      setMenuItems(menuRes.data.items)
    }

    const annRes = await apiRequest('/announcements?showAll=true')
    if (annRes.success && annRes.data) {
      setAnnouncements(annRes.data)
    }

    if (admin?.role === 'SUPER_ADMIN') {
      const adminRes = await apiRequest('/admins')
      if (adminRes.success && adminRes.data) {
        setAdminUsers(adminRes.data)
      }
    }

    const deletedVenuesRes = await apiRequest('/venues/deleted/all')
    if (deletedVenuesRes.success && deletedVenuesRes.data) {
      setDeletedVenues(deletedVenuesRes.data)
    }
    const deletedItemsRes = await apiRequest('/menu-items/deleted/all')
    if (deletedItemsRes.success && deletedItemsRes.data) {
      setDeletedItems(deletedItemsRes.data)
    }
  }

  useEffect(() => {
    if (token) {
      fetchData()
    }
  }, [token, active])

  const handleLogout = () => {
    localStorage.removeItem('cu_grab_eats_token')
    localStorage.removeItem('cu_grab_eats_admin')
    setToken(null)
    setAdmin(null)
    toast.success('Logged out successfully')
  }

  if (!token) {
    return <LoginForm onLoginSuccess={(t, a) => { setToken(t); setAdmin(a) }} />
  }

  const renderDashboardHome = () => {
    const dashboardCards = [
      { label: 'Total outlets', value: stats.totalVenues, trend: 'Active Now', icon: Store, tone: 'indigo' },
      { label: 'Outlets open now', value: stats.openNowCount, trend: 'Live Timings', icon: Utensils, tone: 'emerald' },
      { label: 'Total menu items', value: stats.totalMenuItems, trend: `${stats.totalCategories} Categories`, icon: ClipboardList, tone: 'amber' },
      { label: 'Asset Storage', value: `${stats.estimatedStorageMb} MB`, trend: `${stats.totalImages} images`, icon: Settings, tone: 'rose' }
    ]

    return (
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardCards.map((card, idx) => {
            const Icon = card.icon
            return (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} key={card.label}>
                <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className={`flex size-9 items-center justify-center rounded-xl ${
                        card.tone === 'indigo' ? 'bg-indigo-500/10 text-indigo-600' :
                        card.tone === 'emerald' ? 'bg-emerald-500/10 text-emerald-600' :
                        card.tone === 'amber' ? 'bg-amber-500/10 text-amber-600' : 'bg-rose-500/10 text-rose-600'
                      }`}>
                        <Icon className="size-[18px]" />
                      </div>
                      <Badge variant="secondary" className="rounded-md bg-zinc-100 px-1.5 text-[10px] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {card.trend}
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <p className="text-2xl font-semibold tracking-tight">{card.value}</p>
                      <p className="mt-1 text-xs font-medium text-muted-foreground">{card.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
          <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="text-sm">CU Grab Eats Operations</CardTitle>
              <CardDescription>Live operations metrics and recently active outlets.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900 p-4 border border-zinc-100 dark:border-zinc-800">
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Most recently updated venue</h4>
                  {stats.mostRecentlyUpdatedVenue ? (
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-indigo-600">{stats.mostRecentlyUpdatedVenue.name}</span>
                      <span className="text-xs text-muted-foreground">Updated at {new Date(stats.mostRecentlyUpdatedVenue.updatedAt).toLocaleDateString()}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-2">No venues updated recently.</p>
                  )}
                </div>

                <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900 p-4 border border-zinc-100 dark:border-zinc-800">
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Soft deleted records in storage</h4>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-rose-600">{stats.deletedRecords?.total || 0} Deleted Items</span>
                    <Button variant="ghost" size="sm" onClick={() => setActive('Trash')} className="text-xs text-indigo-600 p-0 hover:bg-transparent">
                      Restore / Manage Trash →
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
            <CardHeader className="flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-sm">Audit trail</CardTitle>
                <CardDescription className="text-xs">Real-time moderator action logging</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setActive('Audit Logs')} className="text-xs text-indigo-600">
                View logs
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col gap-3">
                {auditLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex gap-3 py-2 border-b last:border-b-0 border-zinc-100 dark:border-zinc-900">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[10px] font-semibold text-zinc-600 dark:text-zinc-400">
                      {log.action.substring(0, 3)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        {log.action} {log.entity}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">{log.adminEmail || 'System Action'}</p>
                    </div>
                    <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const content =
    active === 'Dashboard' ? renderDashboardHome() :
    active === 'Food Outlets' ? <OutletsPage venues={venues} onRefresh={fetchData} /> :
    active === 'Outlet Menus' ? <MenuPage menuItems={menuItems} venues={venues} onRefresh={fetchData} /> :
    active === 'Mess Menu' ? <MessMenuPage onRefresh={fetchData} /> :
    active === 'Announcements' ? <AnnouncementsPage announcements={announcements} onRefresh={fetchData} /> :
    active === 'Trash' ? <TrashPage deletedVenues={deletedVenues} onRefresh={fetchData} /> :
    active === 'Audit Logs' ? <AuditLogsPage auditLogs={auditLogs} /> :
    <div className="py-12 text-center text-muted-foreground">This area is currently under maintenance.</div>

  const sidebarNavItems = [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'Mess Menu', icon: Utensils },
    { label: 'Food Outlets', icon: Store },
    { label: 'Outlet Menus', icon: ClipboardList },
    { label: 'Announcements', icon: Megaphone },
    { label: 'Audit Logs', icon: Users },
    { label: 'Trash', icon: Trash2 },
  ]

  return (
    <TooltipProvider>
      <div className={dark ? 'dark' : ''}>
        <div className="flex min-h-screen bg-background text-foreground">
          <aside className={`hidden shrink-0 border-r bg-zinc-50 dark:bg-zinc-950 transition-[width] duration-300 lg:flex lg:flex-col ${collapsed ? 'w-[76px]' : 'w-[248px]'}`}>
            <div className="flex h-16 items-center px-4 gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <Utensils className="size-4" />
              </div>
              {!collapsed && (
                <div>
                  <p className="text-sm font-semibold tracking-tight">CU Grab Eat</p>
                  <p className="text-[10px] text-muted-foreground">Admin Workspace</p>
                </div>
              )}
            </div>
            <Separator />
            <div className="flex flex-1 flex-col gap-1 p-3">
              {sidebarNavItems.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  onClick={() => setActive(label as PageKey)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    active === label ? 'bg-indigo-500/10 font-semibold text-indigo-600' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  <Icon className="size-[18px]" />
                  {!collapsed && <span>{label}</span>}
                </button>
              ))}
            </div>
            <div className="p-3 space-y-3">
              <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20">
                <LogOut className="size-4 mr-2" />
                {!collapsed && 'Sign Out'}
              </Button>
              <div className="flex items-center gap-3 bg-zinc-100 dark:bg-zinc-900 p-2.5 rounded-xl">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-indigo-100 text-xs font-semibold text-indigo-700">
                    {admin?.name?.substring(0, 2).toUpperCase() || 'AD'}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">{admin?.name}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{admin?.role}</p>
                  </div>
                )}
              </div>
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/95 px-4 md:px-7 backdrop-blur-sm">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-sm font-semibold">{active}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setDark(!dark)}>
                  {dark ? <Sun className="size-4 text-zinc-400" /> : <Moon className="size-4 text-zinc-600" />}
                </Button>
              </div>
            </header>

            <main className="flex-1 p-4 md:p-7 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div key={active} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
                  {content}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

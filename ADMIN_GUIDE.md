# Admin Dashboard Guide

## Overview
The Virex Admin Dashboard is a modern, responsive interface built with MUI (Material-UI) components that allows administrators to manage various aspects of the website.

## Access URL
- **Development**: http://localhost:3001/admin
- **Production**: https://your-domain.com/admin

## Features Implemented

### 1. Dashboard Layout
- **Sidebar Navigation**: Logo, menu items (Dashboard, Products, All Products, Newsletter)
- **Top Header**: Search bar, export button (context-sensitive), user profile
- **Breadcrumb Navigation**: Shows current page hierarchy
- **Responsive Design**: Mobile-friendly with collapsible sidebar

### 2. Newsletter Subscription Management (`/admin/newsletter`)
- **DataGrid Features**:
  - View all newsletter subscriptions
  - Pagination (10, 25, 50, 100 rows per page)
  - Server-side pagination for performance
  - Edit email addresses
  - Toggle active/inactive status
  - Delete subscriptions
  - Export to CSV functionality
- **Real-time Data**: Connected to Supabase `newsletter_subscriptions` table
- **Search & Filter**: Built-in DataGrid search capabilities

### 3. Products Management (`/admin/products`)
- **Overview Page**: Quick actions and product management shortcuts
- **All Products** (`/admin/products/all`): Placeholder for comprehensive product DataGrid

### 4. Dashboard Overview (`/admin`)
- **Statistics Cards**: Product count, subscriber count, categories, users
- **Quick Actions**: Direct links to main functions
- **Recent Activity**: Live activity feed

## Technical Features

### Design System
- **MUI v7**: Latest Material-UI components
- **Custom Theme**: Matches the design provided in the image
- **Responsive Breakpoints**: Mobile-first design approach
- **Color Scheme**: 
  - Primary: #566BDA (Blue)
  - Background: #F8F9FB (Light Gray)
  - Paper: #FFFFFF (White)

### Database Integration
- **Supabase**: PostgreSQL database with real-time capabilities
- **Row Level Security**: Proper access control
- **API Endpoints**: RESTful endpoints for CRUD operations

### Mobile Responsiveness
- **Adaptive Layout**: Sidebar collapses on mobile
- **Touch-Friendly**: Optimized for mobile interactions
- **Responsive DataGrid**: Adjusts column sizes for mobile screens

## Usage Instructions

### Accessing the Admin Panel
1. Navigate to `/admin` in your browser
2. The dashboard will load with the main overview

### Managing Newsletter Subscriptions
1. Go to `/admin/newsletter`
2. View paginated list of all subscribers
3. **Edit**: Click the edit icon to modify email or status
4. **Delete**: Click delete icon (with confirmation)
5. **Export**: Use the "Export CSV" button in the header

### Navigation
- **Desktop**: Use the permanent sidebar for navigation
- **Mobile**: Tap the hamburger menu icon to open sidebar
- **Breadcrumbs**: Click breadcrumb items to navigate up the hierarchy

## File Structure
```
src/
├── app/admin/
│   ├── layout.tsx              # Admin layout wrapper
│   ├── page.tsx               # Dashboard overview
│   ├── newsletter/
│   │   └── page.tsx           # Newsletter management
│   └── products/
│       ├── page.tsx           # Products overview
│       └── all/
│           └── page.tsx       # All products (placeholder)
├── components/admin/
│   ├── AdminLayout.tsx        # Main layout component
│   ├── AdminSidebar.tsx       # Sidebar navigation
│   ├── AdminHeader.tsx        # Top header
│   ├── AdminBreadcrumb.tsx    # Breadcrumb navigation
│   └── NewsletterDataGrid.tsx # Newsletter DataGrid
├── lib/
│   └── mui-theme.ts           # MUI theme configuration
└── api/admin/
    └── newsletter/
        ├── route.ts           # GET, POST endpoints
        └── [id]/
            └── route.ts       # GET, PUT, DELETE by ID
```

## Future Enhancements

### Phase 2 - Product Management
- Complete product DataGrid implementation
- Product CRUD operations
- Category management
- Maker/manufacturer management
- Image upload functionality

### Phase 3 - Advanced Features
- User management and authentication
- Advanced search and filtering
- Bulk operations
- Data export in multiple formats
- Analytics and reporting
- Real-time notifications

### Phase 4 - System Features
- Role-based access control
- Audit logging
- System settings
- API documentation
- Backup and restore

## API Endpoints

### Newsletter Subscriptions
- `GET /api/admin/newsletter` - List with pagination
- `POST /api/admin/newsletter` - Create new subscription  
- `GET /api/admin/newsletter/[id]` - Get single subscription
- `PUT /api/admin/newsletter/[id]` - Update subscription
- `DELETE /api/admin/newsletter/[id]` - Delete subscription

## Troubleshooting

### Common Issues
1. **Port 3000 in use**: App will automatically use port 3001
2. **MUI Grid errors**: Using MUI v7 `size` prop instead of `item xs={}`
3. **Database connection**: Ensure SUPABASE_URL and SUPABASE_ANON_KEY are set

### Performance Tips
- DataGrid uses server-side pagination for large datasets
- Images are optimized with Next.js Image component
- Responsive design reduces mobile bandwidth usage

## Development Commands
```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run start  # Start production server
npm run lint   # Run ESLint
```

The admin interface is now ready for use and can be extended with additional features as needed.
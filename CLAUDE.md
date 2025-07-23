# Community Platform Development Guide

## Project Overview
This is a Next.js 15 community platform built with TypeScript, Firebase/Firestore, and Tailwind CSS. The platform manages business listings, user profiles, jobs, and education records for a community.

## Key Commands

### Development
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production (includes linting and type checking)
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Firebase
```bash
firebase deploy --only firestore:rules    # Deploy Firestore security rules
firebase emulators:start                  # Start Firebase emulators for local development
```

## Architecture

### Core Technologies
- **Next.js 15** with TypeScript
- **Firebase/Firestore** for data persistence and authentication
- **Tailwind CSS** for styling
- **FontAwesome** for icons
- **Cloudinary** for image uploads
- **Leaflet + OpenStreetMap** for interactive maps (free, no API keys)
- **React-Leaflet** for React map components

### Key Directories
- `src/app/` - Next.js app router pages and API routes
- `src/components/` - Reusable React components
- `src/components/business/` - Business-specific components (search, map, cards)
- `src/models/` - TypeScript classes for data models (User, Business, Job, etc.)
- `src/services/` - Service classes for Firebase operations
- `src/hooks/` - Custom React hooks (especially useAuth)
- `src/utils/` - Utility functions (geocoding, location services, Waze parsing)
- `src/scripts/` - Administrative scripts for data migration

### Data Models
- **User**: Community members with approval status
- **Business**: Business listings with metadata, contact info, hours
- **Admin**: Administrative users with permissions
- **Job**: Job postings
- **Education**: Educational records
- **Tag**: Categorized tags for various purposes

## Authentication & Permissions

### User Types
1. **Unauthenticated** - Limited access to business listings
2. **Pending Users** - Registered but waiting for approval
3. **Approved Users** - Full access to community features
4. **Admins** - Administrative privileges

### Firestore Security Rules
Located in `firestore.rules`. Key principles:
- Approved users can read most community content
- Users can only edit their own data
- Admins have broader read/write permissions
- Business owners can manage their own businesses

## Development Status & Known Issues

### Current Build Status
✅ **MAJOR ISSUES FIXED** - Critical TypeScript errors resolved:

#### Fixed Issues ✅
- Model `any` types converted to `Record<string, unknown>`
- BaseService type safety improvements
- Business model type safety
- **Business creation data structure** - Fixed missing `jobPostings`, `isActive`, `wazeUrl`, `serviceAreas`
- **User profile updates** - Fixed `businessId` property access
- **Education management system** - Full CRUD operations with validation and error handling
- **Firestore permissions** - Updated education collection rules for proper user access
- **Data integrity** - Fixed undefined values in Firestore documents
- API route error handling improvements

#### Remaining Issues ⚠️ (Mostly Warnings)
- Admin dashboard component errors (3 `any` types)
- Some API routes still have `any` types
- Various unused import warnings
- Some `<img>` tags should use Next.js `<Image>` (warnings only)
- Unused variables and missing React dependencies (warnings only)

### Recent Major Updates

#### Education Management System (Latest)
1. **Complete CRUD Operations**: Create, read, update, delete education records with full validation
2. **Smart Form Design**: Dropdown with "Other" option for custom inputs on Institution, Degree, and Job Title
3. **Dynamic Input Switching**: Seamless toggle between predefined options and custom text input
4. **Status Management**: Support for In Progress, Completed, and Planned education with appropriate year fields
5. **Data Integrity**: Proper handling of optional fields and Firestore document validation
6. **Auto-populate Integration**: Current education data feeds into student networking search
7. **Firestore Security**: Updated permission rules for proper user access to education documents

#### Student Networking Platform
1. **Smart Matching Algorithm**: Prioritizes same institution, degree, city, and military unit connections
2. **Auto-population**: Pre-fills search from user's current education data
3. **Students vs Alumni Toggle**: Filter between current students and recent graduates (5-year window)
4. **Contact Revelation**: Simple click-to-reveal name and phone number for connections
5. **August Graduation Logic**: Alumni status determined by August graduation date

#### Business Discovery Platform
1. **Advanced Search & Filtering**: Location-based search with "Near Me" functionality using geolocation API
2. **Interactive Map View**: Leaflet-based map with business markers, hover previews (desktop), and tap interactions (mobile)
3. **Location Intelligence**: Geocoding system for Waze URLs and comprehensive Israeli service areas mapping
4. **Mobile-First Design**: Fully responsive interface optimized for mobile devices with touch-friendly interactions
5. **Enhanced Business Cards**: Quick action buttons (call, email, navigate with Waze-style icon)
6. **Dual Interaction Patterns**: Desktop hover-to-preview + click-to-navigate, Mobile tap-to-preview + tap-again-to-navigate
7. **Real-time Distance Calculations**: Haversine formula for accurate proximity-based search and sorting

#### Previous Updates
1. **Firebase Permissions**: Fixed individual business page access for non-owners
2. **Custom Text Input**: Added free text input for both tags and services in business forms
3. **Waze URL Parsing**: Enhanced to handle Hebrew text and malformed URLs
4. **Type Safety**: Ongoing conversion from `any` to proper TypeScript types

## Common Development Tasks

### Adding a New Model
1. Create interface in `src/models/YourModel.ts`
2. Implement class with `toFirestore()` and `fromFirestore()` methods
3. Create service in `src/services/YourModelService.ts` extending `BaseService`
4. Update Firestore security rules if needed

### Adding Authentication
Use the `useAuth` hook:
```typescript
const { user, isAuthenticated, isAdmin, isApproved } = useAuth();
```

### Business Management
- **Add**: `/add-business` (5-step form)
- **Edit**: `/edit-business/[id]` (5-step form)
- **View**: `/businesses/[id]` (individual business page)
- **Discovery**: `/businesses` (advanced search with map/list views)

### Education Management
- **Profile Integration**: `/profile/education` (comprehensive education CRUD)
- **Smart Forms**: Dropdown + "Other" option for flexible data entry
- **Validation**: Required field checking and data sanitization
- **Student Discovery**: Auto-feeds data to `/students` networking page

### Business Discovery Features
- **Text Search**: Real-time search across business names, descriptions, categories, and tags
- **Location Search**: "Near Me" with geolocation API + manual address/city input with autocomplete
- **Distance-Based Results**: Sort by proximity with adjustable radius controls (1-50km slider)
- **Category & Tag Filtering**: Multi-select filter chips with active filter count display
- **Map View**: Interactive Leaflet map with custom markers, hover cards (desktop), and mobile-optimized popups
- **View Toggle**: Seamless switching between list and map views with persistent search state
- **Mobile Optimized**: Touch-friendly interface with appropriate interaction patterns and responsive breakpoints

### Location Services
- **Geocoding**: Free Nominatim (OpenStreetMap) service for address validation
- **Service Areas**: Comprehensive Israeli cities and regions mapping
- **Distance Calculations**: Haversine formula for accurate distance measurement
- **Waze Integration**: Parse Waze URLs to extract addresses and coordinates

### Image Uploads
Use `ClientCloudinaryService` for browser-side uploads to Cloudinary.

## Key Components & Utilities

### Business Components
- **`BusinessSearchFilters`**: Advanced search interface with location, text, and filter controls
- **`BusinessMap`**: Interactive Leaflet map with business markers and popups
- **`EnhancedBusinessCard`**: Rich business cards with quick action buttons
- **Mobile Optimized**: All components responsive with touch-friendly interactions

### Location Utilities
- **`geocodingUtils.ts`**: Free geocoding service using Nominatim (OpenStreetMap)
- **`businessLocationEnhancer.ts`**: Israeli service areas mapping and distance calculations
- **`wazeUtils.ts`**: Parse Waze URLs and extract addresses/coordinates

### Key Features
- **Desktop Map Interaction**: Hover markers for preview cards, click markers to navigate directly to business
- **Mobile Map Interaction**: First tap shows detailed popup, second tap navigates to business page
- **Distance-Based Search**: Find businesses within specified radius with real-time distance display
- **Service Areas**: Support for both specific addresses and regional coverage (3-tier Israeli mapping system)
- **Rate Limiting**: Respects free geocoding service limits with proper error handling
- **Navigation Integration**: Waze-style location arrow icon for seamless GPS navigation
- **Responsive Design**: Mobile-first approach with touch-optimized controls and interactions

## Deployment Notes

### Before Deploying
1. Fix remaining TypeScript errors: `npm run build`
2. Deploy Firestore rules: `firebase deploy --only firestore:rules`
3. Ensure environment variables are set (.env.local)

### Environment Variables Required
- Firebase configuration
- Cloudinary credentials
- Next.js environment settings

## Admin Tools

### Location Enhancement
- **Admin Page**: `/admin/enhance-locations` (admin only)
- **Purpose**: Geocode existing businesses to add coordinates for map/distance features
- **Process**: Parses Waze URLs and maps service areas to center coordinates
- **Safe**: Can be run multiple times without duplicating data

### User Management
- **Profile System**: Complete user profile management with education tracking
- **Education CRUD**: Full create, read, update, delete operations for education records
- **Student Networking**: Automated matching and connection system based on education data

## Testing
Currently no automated tests. Manual testing required for:
- User registration/approval flow
- Business creation/editing
- Firebase permissions
- Image uploads
- Waze URL parsing
- **Location-based search** and distance calculations with radius controls
- **Map interactions** (desktop hover vs mobile tap patterns)
- **Mobile responsiveness** across different screen sizes and orientations
- **Geolocation features** ("Near Me" functionality with permission handling)
- **Touch interactions** (tap-to-preview, tap-again-to-navigate on mobile)
- **Navigation integration** (Waze URL parsing and GPS navigation)
- **Education management** (CRUD operations, form validation, Firestore integration)
- **Student networking** (profile matching, contact revelation, alumni/student filtering)

## Support
For Firebase permission issues, check Firestore rules and user authentication status.
For build errors, focus on TypeScript strict mode compliance and proper error handling.
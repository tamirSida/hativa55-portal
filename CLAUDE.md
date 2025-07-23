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

### Key Directories
- `src/app/` - Next.js app router pages and API routes
- `src/components/` - Reusable React components
- `src/models/` - TypeScript classes for data models (User, Business, Job, etc.)
- `src/services/` - Service classes for Firebase operations
- `src/hooks/` - Custom React hooks (especially useAuth)
- `src/utils/` - Utility functions

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
- API route error handling improvements

#### Remaining Issues ⚠️ (Mostly Warnings)
- Admin dashboard component errors (3 `any` types)
- Some API routes still have `any` types
- Various unused import warnings
- Some `<img>` tags should use Next.js `<Image>` (warnings only)
- Unused variables and missing React dependencies (warnings only)

### Recent Changes
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
- Add: `/add-business` (5-step form)
- Edit: `/edit-business/[id]` (5-step form)
- View: `/businesses/[id]` (individual business page)
- List: `/businesses` (all businesses with filters)

### Image Uploads
Use `ClientCloudinaryService` for browser-side uploads to Cloudinary.

## Deployment Notes

### Before Deploying
1. Fix remaining TypeScript errors: `npm run build`
2. Deploy Firestore rules: `firebase deploy --only firestore:rules`
3. Ensure environment variables are set (.env.local)

### Environment Variables Required
- Firebase configuration
- Cloudinary credentials
- Next.js environment settings

## Testing
Currently no automated tests. Manual testing required for:
- User registration/approval flow
- Business creation/editing
- Firebase permissions
- Image uploads
- Waze URL parsing

## Support
For Firebase permission issues, check Firestore rules and user authentication status.
For build errors, focus on TypeScript strict mode compliance and proper error handling.
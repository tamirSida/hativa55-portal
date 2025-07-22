import { NextRequest, NextResponse } from 'next/server';
import { BusinessService } from '@/services/BusinessService';
import { auth } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    // Get the Authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'חסר אימות משתמש' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'חסר אימות משתמש' },
        { status: 401 }
      );
    }

    // Debug: Log the token to see if we're getting it
    console.log('Received auth token:', token.substring(0, 20) + '...');

    const body = await request.json();
    
    // Extract and validate required fields
    const {
      name,
      description,
      category,
      phone,
      email,
      website,
      locationType,
      wazeUrl,
      serviceAreas,
      logoUrl,
      imageUrls,
      openHours,
      serviceTags,
      ownerId
    } = body;

    // Validate required fields
    if (!name || !description || !category || !phone || !ownerId) {
      return NextResponse.json(
        { error: 'שדות חובה חסרים' },
        { status: 400 }
      );
    }

    // Validate location data
    if (locationType === 'specific' && !wazeUrl) {
      return NextResponse.json(
        { error: 'קישור Waze נדרש למיקום מדויק' },
        { status: 400 }
      );
    }

    if (locationType === 'service-areas' && (!serviceAreas || serviceAreas.length === 0)) {
      return NextResponse.json(
        { error: 'אזורי שירות נדרשים' },
        { status: 400 }
      );
    }

    // Create extended business data - Remove undefined fields for Firestore
    const businessData: any = {
      ownerId,
      name,
      description,
      serviceTags: serviceTags || [],
      metadata: {
        category,
        contactInfo: {
          phone
        },
        images: {
          galleryUrls: imageUrls || []
        },
        openHours: openHours || {},
        locationType
      }
    };

    // Add optional fields only if they have values
    if (locationType === 'specific' && wazeUrl) {
      businessData.wazeUrl = wazeUrl;
    }
    
    if (locationType === 'service-areas' && serviceAreas && serviceAreas.length > 0) {
      businessData.serviceAreas = serviceAreas;
    }

    // Add optional contact info
    if (email) {
      businessData.metadata.contactInfo.email = email;
    }
    
    if (website) {
      businessData.metadata.contactInfo.website = website;
    }

    // Add logo if provided
    if (logoUrl) {
      businessData.metadata.images.logoUrl = logoUrl;
    }

    const businessService = new BusinessService();
    const businessId = await businessService.createBusiness(businessData);

    return NextResponse.json({
      message: 'העסק נוצר בהצלחה',
      businessId,
      business: businessData
    });

  } catch (error: any) {
    console.error('Error creating business:', error);
    
    // More detailed error logging for debugging
    if (error.code === 'invalid-argument') {
      console.error('Invalid Firestore data:', JSON.stringify(businessData, null, 2));
    }
    
    return NextResponse.json(
      { error: error.message || 'שגיאה ביצירת העסק' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const ownerId = searchParams.get('ownerId');

    const businessService = new BusinessService();

    let businesses;
    if (category) {
      businesses = await businessService.getBusinessesByCategory(category);
    } else if (ownerId) {
      businesses = await businessService.getBusinessesByOwner(ownerId);
    } else {
      businesses = await businessService.getActiveBusinesses();
    }

    return NextResponse.json({
      businesses: businesses.map(business => ({
        ...business.toFirestore(),
        id: business.id
      }))
    });

  } catch (error: any) {
    console.error('Error fetching businesses:', error);
    
    return NextResponse.json(
      { error: error.message || 'שגיאה בטעינת העסקים' },
      { status: 500 }
    );
  }
}
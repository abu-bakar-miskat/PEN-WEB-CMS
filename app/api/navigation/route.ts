import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/navigation
 * Fetches navigation data for the website
 * Query params:
 * - website_id: string (optional, filter by website ID)
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get('website_id');
    const institutionId = process.env.INSTITUTION_ID;

    let finalWebsiteId = websiteId;
    let sqlQuery = '';

    // If no website_id provided, get it from institution
    if (!finalWebsiteId && institutionId) {
      const { data: institutionWebsites } = await supabase
        .from('websites')
        .select('id')
        .eq('institution_id', institutionId)
        .limit(1)
        .single();

      if (institutionWebsites) {
        finalWebsiteId = institutionWebsites.id;
      }
    }

    if (!finalWebsiteId) {
      return NextResponse.json(
        { error: 'Website not found. Please provide website_id or configure INSTITUTION_ID.' },
        { status: 404 }
      );
    }

    // Fetch navigation data
    const { data: websiteData, error } = await supabase
      .from('websites')
      .select('id, navigation')
      .eq('id', finalWebsiteId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Website not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!websiteData) {
      return NextResponse.json(
        { error: 'Website not found' },
        { status: 404 }
      );
    }

    // Build SQL query
    sqlQuery = `SELECT id, navigation FROM websites WHERE id = '${finalWebsiteId}' LIMIT 1;`;

    // Handle navigation data structure
    let navigationData: { logo?: string; nav: { items: unknown[] }; footer: { columns?: unknown[]; items?: unknown[] } } = {
      logo: '',
      nav: { items: [] },
      footer: { columns: [] },
    };

    if (websiteData.navigation && typeof websiteData.navigation === 'object') {
      if (Object.keys(websiteData.navigation).length > 0) {
        navigationData = {
          logo: (websiteData.navigation as { logo?: string }).logo || '',
          nav: (websiteData.navigation as { nav?: { items: unknown[] } }).nav || { items: [] },
          footer: (websiteData.navigation as { footer?: { columns?: unknown[]; items?: unknown[] } }).footer || { columns: [] },
        };
        if (!Array.isArray(navigationData.nav.items)) {
          navigationData.nav.items = [];
        }
        if (!Array.isArray(navigationData.footer.columns) && !Array.isArray(navigationData.footer.items)) {
          navigationData.footer.columns = [];
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        websiteId: websiteData.id,
        navigation: navigationData
      },
      query: sqlQuery
    });
  } catch (error) {
    console.error('Error fetching navigation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

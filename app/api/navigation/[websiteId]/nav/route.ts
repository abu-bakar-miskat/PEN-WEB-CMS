import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/navigation/[websiteId]/nav
 * Fetches navigation menu items for a specific website
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> }
) {
  try {
    const supabase = await createClient();
    const { websiteId } = await params;

    if (!websiteId) {
      return NextResponse.json(
        { error: 'Website ID is required' },
        { status: 400 }
      );
    }

    // Fetch navigation data
    const { data: websiteData, error } = await supabase
      .from('websites')
      .select('id, navigation')
      .eq('id', websiteId)
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
    const sqlQuery = `SELECT id, navigation->'nav' as nav FROM websites WHERE id = '${websiteId}' LIMIT 1;`;

    // Extract nav data from navigation object
    let navData: { items: unknown[] } = { items: [] };

    if (websiteData.navigation && typeof websiteData.navigation === 'object') {
      const navigation = websiteData.navigation as { nav?: { items?: unknown[] } };
      if (navigation.nav) {
        navData = {
          items: Array.isArray(navigation.nav.items) ? navigation.nav.items : [],
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        websiteId: websiteData.id,
        nav: navData
      },
      query: sqlQuery
    });
  } catch (error) {
    console.error('Error fetching nav:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

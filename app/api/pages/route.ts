import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/pages
 * Fetches all pages with optional filtering by institution
 * Query params:
 * - published: boolean (filter by published status)
 * - website_id: string (filter by website ID)
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const institutionId = process.env.INSTITUTION_ID;
    const published = searchParams.get('published');
    const websiteId = searchParams.get('website_id');

    let websiteIds: string[] = [];
    
    // Get website IDs for the institution if institution ID is configured
    if (institutionId) {
      const { data: institutionWebsites } = await supabase
        .from('websites')
        .select('id')
        .eq('institution_id', institutionId);
      
      if (institutionWebsites) {
        websiteIds = institutionWebsites.map(w => w.id);
      }
    }

    // Build query
    let query = supabase.from('pages').select('*');

    if (websiteId) {
      query = query.eq('website_id', websiteId);
    } else if (websiteIds.length > 0) {
      query = query.in('website_id', websiteIds);
    }

    // Filter by published status if provided
    if (published !== null) {
      query = query.eq('is_published', published === 'true');
    }

    query = query.order('order_index', { ascending: true });

    const { data: pages, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: pages || [],
      count: pages?.length || 0,
      query: websiteId
        ? `SELECT * FROM pages WHERE website_id = '${websiteId}'${published !== null ? ` AND is_published = ${published === 'true'}` : ''} ORDER BY order_index ASC;`
        : websiteIds.length > 0
        ? `SELECT * FROM pages WHERE website_id IN (${websiteIds.map(id => `'${id}'`).join(', ')})${published !== null ? ` AND is_published = ${published === 'true'}` : ''} ORDER BY order_index ASC;`
        : `SELECT * FROM pages${published !== null ? ` WHERE is_published = ${published === 'true'}` : ''} ORDER BY order_index ASC;`
    });
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

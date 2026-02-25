import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/blogs/website/[websiteId]
 * Fetches all blogs for a specific website
 * Query params:
 * - published: boolean (filter by published status, default: only published)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> }
) {
  try {
    const supabase = await createClient();
    const { websiteId } = await params;
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published');

    if (!websiteId) {
      return NextResponse.json(
        { error: 'Website ID is required' },
        { status: 400 }
      );
    }

    // Build query
    let query = supabase
      .from('blogs')
      .select('*')
      .eq('website_id', websiteId);

    // Filter by published status if provided, otherwise default to published only
    if (published !== null) {
      query = query.eq('is_published', published === 'true');
    } else {
      // Default to published blogs only
      query = query.eq('is_published', true);
    }

    query = query.order('created_at', { ascending: false });

    const { data: blogs, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: blogs || [],
      count: blogs?.length || 0,
      website_id: websiteId,
      query: `SELECT * FROM blogs WHERE website_id = '${websiteId}'${published !== null ? ` AND is_published = ${published === 'true'}` : ' AND is_published = true'} ORDER BY created_at DESC;`
    });
  } catch (error) {
    console.error('Error fetching blogs by website:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

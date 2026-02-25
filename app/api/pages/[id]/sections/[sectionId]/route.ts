import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

type Section = { id?: string } & Record<string, unknown>;

/**
 * GET /api/pages/[id]/sections/[sectionId]
 * Fetches a specific section from a page by section ID
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const supabase = await createClient();
    const { id, sectionId } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Page ID is required' },
        { status: 400 }
      );
    }

    if (!sectionId) {
      return NextResponse.json(
        { error: 'Section ID is required' },
        { status: 400 }
      );
    }

    const { data: pageData, error } = await supabase
      .from('pages')
      .select('id, website_id, sections')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Page not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!pageData) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    let sections: unknown[] = [];
    if (pageData.sections) {
      if (typeof pageData.sections === 'string') {
        try {
          sections = JSON.parse(pageData.sections);
        } catch {
          sections = [];
        }
      } else if (Array.isArray(pageData.sections)) {
        sections = pageData.sections;
      }
    }

    const isSection = (value: unknown): value is Section => {
      if (typeof value !== 'object' || value === null) return false;
      if (!('id' in value)) return true;
      const id = (value as { id?: unknown }).id;
      return typeof id === 'string' || typeof id === 'undefined';
    };

    const section = sections.find(
      (s): s is Section => isSection(s) && s.id === sectionId
    );

    if (!section) {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        pageId: pageData.id,
        websiteId: pageData.website_id,
        section: section
      }
    });
  } catch (error) {
    console.error('Error fetching section:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

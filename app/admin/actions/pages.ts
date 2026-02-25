'use server';

import { createClient } from '@/lib/supabase/server';
import { getUserRoleInfo } from '@/lib/auth/getUserRole';

export async function deletePage(pageId: string) {
  const supabase = await createClient();
  
  // Get the page to check website access
  const { data: page, error: pageError } = await supabase
    .from('pages')
    .select('website_id')
    .eq('id', pageId)
    .single();
  
  if (pageError || !page) {
    return { error: 'Page not found' };
  }
  
  // Verify user has access to the website (same pattern as course-management)
  const accessCheck = await verifyWebsiteAccess(page.website_id);
  if (!accessCheck.hasAccess) {
    return { error: accessCheck.error || 'Access denied' };
  }

  // Only delete from database, do not delete local files
  const { error } = await supabase.from('pages').delete().eq('id', pageId);
  
  return { error };
}

/**
 * Verify user has access to update a website (same pattern as course-management)
 */
async function verifyWebsiteAccess(websiteId: string): Promise<{ hasAccess: boolean; error?: string }> {
  const supabase = await createClient();
  const { userRole, userCompany, isAdministrator } = await getUserRoleInfo();
  
  // Check if user has a role
  if (!userRole) {
    return { hasAccess: false, error: 'You do not have permission to update pages. Please contact your administrator.' };
  }
  
  // Get website with institution info
  const { data: website, error: websiteError } = await supabase
    .from('websites')
    .select('institution_id')
    .eq('id', websiteId)
    .single();
  
  if (websiteError || !website) {
    return { hasAccess: false, error: 'Website not found' };
  }
  
  // Check user access to this website's institution (same pattern as course-management)
  // Only administrators have full access; all other users must match company group
  if (!isAdministrator) {
    if (!userCompany) {
      return { hasAccess: false, error: 'You do not have permission to update pages. Please contact your administrator.' };
    }
    
    // Get the institution's group
    const { data: institution } = await supabase
      .from('Institutions')
      .select('group')
      .eq('id', website.institution_id)
      .single();
    
    // Check if user's company matches institution's group
    if (!institution || institution.group !== userCompany) {
      return { hasAccess: false, error: 'You do not have permission to update pages for this website. Access denied.' };
    }
  }
  
  return { hasAccess: true };
}

export async function updatePage(pageId: string, pageData: {
  website_id: string;
  title: string;
  slug: string;
  order_index?: number;
  is_published?: boolean;
  meta_title?: string | null;
  meta_description?: string | null;
  sections?: unknown;
}) {
  const supabase = await createClient();
  
  // Verify user has access to the website
  const accessCheck = await verifyWebsiteAccess(pageData.website_id);
  if (!accessCheck.hasAccess) {
    return { error: accessCheck.error || 'Access denied' };
  }
  
  const { error } = await supabase
    .from('pages')
    .update(pageData)
    .eq('id', pageId);
  
  return { error };
}

export async function createPage(pageData: {
  website_id: string;
  title: string;
  slug: string;
  order_index?: number;
  is_published?: boolean;
  meta_title?: string | null;
  meta_description?: string | null;
  sections?: unknown;
}) {
  const supabase = await createClient();
  
  // Verify user has access to the website
  const accessCheck = await verifyWebsiteAccess(pageData.website_id);
  if (!accessCheck.hasAccess) {
    return { error: accessCheck.error || 'Access denied', data: null };
  }
  
  const { data, error } = await supabase
    .from('pages')
    .insert(pageData)
    .select()
    .single();
  
  return { data, error };
}

export async function togglePagePublish(pageId: string, currentStatus: boolean) {
  const supabase = await createClient();
  
  // Get the page to check website access
  const { data: page, error: pageError } = await supabase
    .from('pages')
    .select('website_id')
    .eq('id', pageId)
    .single();
  
  if (pageError || !page) {
    return { error: 'Page not found' };
  }
  
  // Verify user has access to the website
  const accessCheck = await verifyWebsiteAccess(page.website_id);
  if (!accessCheck.hasAccess) {
    return { error: accessCheck.error || 'Access denied' };
  }
  
  const { error } = await supabase
    .from('pages')
    .update({ is_published: !currentStatus })
    .eq('id', pageId);
  
  return { error };
}

'use server';

import { createClient } from '@/lib/supabase/server';
import { getUserRoleInfo } from '@/lib/auth/getUserRole';

export async function deleteBlog(blogId: string) {
  const supabase = await createClient();
  
  // Get the blog to check website access
  const { data: blog, error: blogError } = await supabase
    .from('blogs')
    .select('website_id')
    .eq('id', blogId)
    .single();
  
  if (blogError || !blog) {
    return { error: 'Blog not found' };
  }
  
  // Verify user has access to the website (same pattern as course-management)
  const accessCheck = await verifyWebsiteAccess(blog.website_id);
  if (!accessCheck.hasAccess) {
    return { error: accessCheck.error || 'Access denied' };
  }

  const { error } = await supabase.from('blogs').delete().eq('id', blogId);
  
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
    return { hasAccess: false, error: 'You do not have permission to update blogs. Please contact your administrator.' };
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
      return { hasAccess: false, error: 'You do not have permission to update blogs. Please contact your administrator.' };
    }
    
    // Get the institution's group
    const { data: institution } = await supabase
      .from('Institutions')
      .select('group')
      .eq('id', website.institution_id)
      .single();
    
    // Check if user's company matches institution's group
    if (!institution || institution.group !== userCompany) {
      return { hasAccess: false, error: 'You do not have permission to update blogs for this website. Access denied.' };
    }
  }
  
  return { hasAccess: true };
}

export async function updateBlog(blogId: string, blogData: {
  website_id: string;
  title: string;
  subtitle?: string;
  content?: unknown;
  slug: string;
  featured_image?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  og_image?: string | null;
  is_published?: boolean;
  categories?: string[] | null;
}) {
  const supabase = await createClient();
  
  // Verify user has access to the website
  const accessCheck = await verifyWebsiteAccess(blogData.website_id);
  if (!accessCheck.hasAccess) {
    return { error: accessCheck.error || 'Access denied', data: null };
  }
  
  const { data, error } = await supabase
    .from('blogs')
    .update(blogData)
    .eq('id', blogId)
    .select()
    .single();
  
  return { data, error };
}

export async function createBlog(blogData: {
  website_id: string;
  title: string;
  subtitle?: string;
  content?: unknown;
  slug: string;
  featured_image?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  og_image?: string | null;
  is_published?: boolean;
  categories?: string[] | null;
}) {
  const supabase = await createClient();
  
  // Verify user has access to the website
  const accessCheck = await verifyWebsiteAccess(blogData.website_id);
  if (!accessCheck.hasAccess) {
    return { error: accessCheck.error || 'Access denied', data: null };
  }
  
  const { data, error } = await supabase
    .from('blogs')
    .insert(blogData)
    .select()
    .single();
  
  return { data, error };
}

export async function toggleBlogPublish(blogId: string, currentStatus: boolean) {
  const supabase = await createClient();
  
  // Get the blog to check website access
  const { data: blog, error: blogError } = await supabase
    .from('blogs')
    .select('website_id')
    .eq('id', blogId)
    .single();
  
  if (blogError || !blog) {
    return { error: 'Blog not found' };
  }
  
  // Verify user has access to the website
  const accessCheck = await verifyWebsiteAccess(blog.website_id);
  if (!accessCheck.hasAccess) {
    return { error: accessCheck.error || 'Access denied' };
  }
  
  const { error } = await supabase
    .from('blogs')
    .update({ is_published: !currentStatus })
    .eq('id', blogId);
  
  return { error };
}

'use server';

import { createClient } from '@/lib/supabase/server';
import { getUserRoleInfo } from '@/lib/auth/getUserRole';

export async function getInstitutionNameByWebsiteId(websiteId: string) {
  const supabase = await createClient();
  
  // First get the website to find its institution_id
  const { data: website, error: websiteError } = await supabase
    .from('websites')
    .select('institution_id')
    .eq('id', websiteId)
    .single();
  
  if (websiteError || !website) {
    return { institutionName: null, error: websiteError?.message || 'Website not found' };
  }
  
  // Then get the institution name
  const { data: institution, error: institutionError } = await supabase
    .from('Institutions')
    .select('institutionName')
    .eq('id', website.institution_id)
    .single();
  
  if (institutionError || !institution) {
    return { institutionName: null, error: institutionError?.message || 'Institution not found' };
  }
  
  return { 
    institutionName: institution.institutionName || null, 
    error: null 
  };
}

export async function getWebsitesByInstitution() {
  const supabase = await createClient();
  const institutionId = process.env.INSTITUTION_ID;

  if (!institutionId) {
    return { data: [], error: 'Institution ID not configured' };
  }

  const { data, error } = await supabase
    .from('websites')
    .select('*')
    .eq('institution_id', institutionId)

  return { data: data || [], error };
}

export async function getWebsiteNavigation(websiteId?: string) {
  const supabase = await createClient();
  
  if (!websiteId) {
    // Fallback to institution_id from env
    const institutionId = process.env.INSTITUTION_ID;
    if (!institutionId) {
      return { data: null, error: 'Institution ID not configured and no website_id provided' };
    }
    const { data, error } = await supabase
      .from('websites')
      .select('id, navigation')
      .eq('institution_id', institutionId)
      .limit(1)
      .single();

    if (error || !data) {
      return { data: null, error: error?.message || 'Website not found' };
    }
    
    // Handle navigation data for fallback case
    let navigationData: { 
      logo?: string; 
      logos?: unknown[]; 
      cta?: { enabled: boolean; text: string; url: string; style?: string };
      nav: { items: unknown[] }; 
      footer: { items: unknown[]; columns?: unknown[] } 
    } = {
      logo: '',
      logos: [],
      cta: { enabled: false, text: '', url: '', style: 'primary' },
      nav: { items: [] },
      footer: { items: [], columns: [] },
    };
    
    if (data.navigation && typeof data.navigation === 'object') {
      if (Object.keys(data.navigation).length > 0) {
        const nav = data.navigation as { 
          logo?: string; 
          logos?: unknown[]; 
          cta?: { enabled: boolean; text: string; url: string; style?: string };
          nav?: { items: unknown[] }; 
          footer?: { items: unknown[]; columns?: unknown[] } 
        };
        navigationData = {
          logo: nav.logo || '',
          logos: nav.logos || [],
          cta: nav.cta || { enabled: false, text: '', url: '', style: 'primary' },
          nav: nav.nav || { items: [] },
          footer: nav.footer || { items: [], columns: [] },
        };
        if (!Array.isArray(navigationData.nav.items)) {
          navigationData.nav.items = [];
        }
        if (!Array.isArray(navigationData.footer.items)) {
          navigationData.footer.items = [];
        }
        if (!Array.isArray(navigationData.footer.columns)) {
          navigationData.footer.columns = [];
        }
      }
    }

    return { 
      data: {
        websiteId: data.id,
        navigation: navigationData
      }, 
      error: null 
    };
  }
  
  // Use provided website_id
  const { data, error } = await supabase
    .from('websites')
    .select('id, navigation')
    .eq('id', websiteId)
    .single();

  if (error || !data) {
    return { data: null, error: 'Website not found' };
  }

  // Handle empty object or null navigation
  let navigationData: { 
    logo?: string; 
    logos?: unknown[]; 
    cta?: { enabled: boolean; text: string; url: string; style?: string };
    nav: { items: unknown[] }; 
    footer: { items: unknown[]; columns?: unknown[] } 
  } = {
    logo: '',
    logos: [],
    cta: { enabled: false, text: '', url: '', style: 'primary' },
    nav: { items: [] },
    footer: { items: [], columns: [] },
  };
  
  if (data.navigation && typeof data.navigation === 'object') {
    // Check if navigation is not an empty object
    if (Object.keys(data.navigation).length > 0) {
      const nav = data.navigation as { 
        logo?: string; 
        logos?: unknown[]; 
        cta?: { enabled: boolean; text: string; url: string; style?: string };
        nav?: { items: unknown[] }; 
        footer?: { items: unknown[]; columns?: unknown[] } 
      };
      navigationData = {
        logo: nav.logo || '',
        logos: nav.logos || [],
        cta: nav.cta || { enabled: false, text: '', url: '', style: 'primary' },
        nav: nav.nav || { items: [] },
        footer: nav.footer || { items: [], columns: [] },
      };
      // Ensure items arrays exist
      if (!Array.isArray(navigationData.nav.items)) {
        navigationData.nav.items = [];
      }
      if (!Array.isArray(navigationData.footer.items)) {
        navigationData.footer.items = [];
      }
      if (!Array.isArray(navigationData.footer.columns)) {
        navigationData.footer.columns = [];
      }
    }
  }

  return { 
    data: {
      websiteId: data.id,
      navigation: navigationData
    }, 
    error: null 
  };
}

export async function updateWebsiteNavigation(navigation: { 
  logo?: string; 
  logos?: unknown[]; 
  cta?: { enabled: boolean; text: string; url: string; style?: string };
  nav: { items: unknown[] }; 
  footer: { columns?: unknown[]; items?: unknown[] } 
}, websiteId?: string) {
  const supabase = await createClient();
  
  // Get user role and company (same pattern as course-management)
  const { userRole, userCompany, isAdministrator } = await getUserRoleInfo();
  
  // Check if user has a role
  if (!userRole) {
    return { error: 'You do not have permission to update websites. Please contact your administrator.' };
  }
  
  let website;
  
  if (websiteId) {
    // Use provided website_id - get website with institution info
    const { data, error: fetchError } = await supabase
      .from('websites')
      .select('id, institution_id')
      .eq('id', websiteId)
      .single();
    
    if (fetchError || !data) {
      return { error: 'Website not found' };
    }
    website = data;
    
    // Check user access to this website's institution (same pattern as course-management)
    // Only administrators have full access; all other users must match company group
    if (!isAdministrator) {
      if (!userCompany) {
        return { error: 'You do not have permission to update this website. Please contact your administrator.' };
      }
      
      // Get the institution's group
      const { data: institution } = await supabase
        .from('Institutions')
        .select('group')
        .eq('id', website.institution_id)
        .single();
      
      // Check if user's company matches institution's group
      if (!institution || institution.group !== userCompany) {
        return { error: 'You do not have permission to update this website. Access denied.' };
      }
    }
  } else {
    // Fallback to institution_id from env
    const institutionId = process.env.INSTITUTION_ID;
    if (!institutionId) {
      return { error: 'Institution ID not configured and no website_id provided' };
    }
    
    // Check user access to this institution
    // Only administrators have full access; all other users must match company group
    if (!isAdministrator) {
      if (!userCompany) {
        return { error: 'You do not have permission to update this website. Please contact your administrator.' };
      }
      
      const { data: institution } = await supabase
        .from('Institutions')
        .select('group')
        .eq('id', institutionId)
        .single();
      
      if (!institution || institution.group !== userCompany) {
        return { error: 'You do not have permission to update this website. Access denied.' };
      }
    }
    
    const { data, error: fetchError } = await supabase
      .from('websites')
      .select('id')
      .eq('institution_id', institutionId)
      .limit(1)
      .single();

    if (fetchError || !data) {
      return { error: 'Website not found' };
    }
    website = data;
  }

  const { error } = await supabase
    .from('websites')
    .update({ navigation })
    .eq('id', website.id);

  return { error };
}

export async function getPagesByInstitution() {
  const supabase = await createClient();
  const institutionId = process.env.INSTITUTION_ID;

  if (!institutionId) {
    return { data: [], error: 'Institution ID not configured' };
  }

  // Get websites for this institution
  const { data: institutionWebsites } = await supabase
    .from('websites')
    .select('id')
    .eq('institution_id', institutionId);

  if (!institutionWebsites || institutionWebsites.length === 0) {
    return { data: [], error: null };
  }

  const websiteIds = institutionWebsites.map((w) => w.id);

  const { data, error } = await supabase
    .from('pages')
    .select('id, title')
    .in('website_id', websiteIds)
    .order('title', { ascending: true });

  return { data: data || [], error };
}

interface CreateWebsiteInput {
  institution_id: number;
  title: string;
}

export async function createWebsiteForInstitution(input: CreateWebsiteInput) {
  const supabase = await createClient();
  const { isAdministrator } = await getUserRoleInfo();

  if (!isAdministrator) {
    return { data: null, error: 'Only administrators can create websites.' };
  }

  const payload = {
    institution_id: input.institution_id,
    title: input.title.trim(),
  };

  const { data, error } = await supabase
    .from('websites')
    .insert(payload)
    .select('id')
    .single();

  if (error || !data) {
    return { data: null, error: error?.message || 'Failed to create website.' };
  }

  return { data, error: null };
}


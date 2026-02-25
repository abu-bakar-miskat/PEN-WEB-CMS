'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Plus, Trash2, GripVertical, ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { getWebsitesByInstitution } from '@/app/admin/actions/websites';
import { createBlog, updateBlog } from '@/app/admin/actions/blogs';
import Image from 'next/image';

interface ContentField {
  name: string;
  data: unknown;
}

interface Section {
  title: string;
  content?: ContentField[]; // Simple array: name and data only
}


interface Website {
  id: string;
  title?: string;
  name?: string;
  [key: string]: unknown;
}

interface Blog {
  id?: string;
  website_id: string;
  title: string;
  subtitle: string;
  content: string | Record<string, unknown> | { sections: Section[] };
  slug: string;
  featured_image: string;
  meta_title: string;
  meta_description: string;
  og_image: string;
  is_published?: boolean;
  categories?: string[];
}

export default function BlogEditor() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const isNew = params.id === 'new';
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [uploadingFields, setUploadingFields] = useState<Record<string, string>>({});
  const [websites, setWebsites] = useState<Website[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [customCategory, setCustomCategory] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  
  const [blog, setBlog] = useState<Blog>({
    website_id: '',
    title: '',
    subtitle: '',
    content: { sections: [] },
    slug: '',
    featured_image: '',
    meta_title: '',
    meta_description: '',
    og_image: '',
    is_published: false,
    categories: [],
  });

  // Generate URL-friendly slug from text
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  // Check if slug is unique and generate unique version if needed
  const ensureUniqueSlug = async (baseSlug: string, excludeId?: string): Promise<string> => {
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      let query = supabase
        .from('blogs')
        .select('id')
        .eq('slug', slug);
      
      if (excludeId) {
        query = query.neq('id', excludeId);
      }
      
      const { data } = await query;
      
      if (!data || data.length === 0) {
        return slug;
      }
      
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  };

  const sections = (blog.content && typeof blog.content === 'object' && 'sections' in blog.content)
    ? (blog.content.sections as Section[])
    : [];

  const toggleSectionExpanded = (sectionIndex: number) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      const key = `section-${sectionIndex}`;
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const addSection = () => {
    const newSection: Section = {
      title: `Section ${sections.length + 1}`,
      content: [],
    };
    const updatedContent = {
      ...(blog.content as { sections: Section[] }),
      sections: [...sections, newSection],
    };
    setBlog({ ...blog, content: updatedContent });
    setExpandedSections((prev) => new Set(prev).add(`section-${sections.length}`));
  };

  const removeSection = (index: number) => {
    const updatedSections = sections.filter((_, i) => i !== index);
    const updatedContent = {
      ...(blog.content as { sections: Section[] }),
      sections: updatedSections,
    };
    setBlog({ ...blog, content: updatedContent });
  };

  const updateSection = (index: number, updates: Partial<Section>) => {
    const updatedSections = [...sections];
    updatedSections[index] = { ...updatedSections[index], ...updates };
    const updatedContent = {
      ...(blog.content as { sections: Section[] }),
      sections: updatedSections,
    };
    setBlog({ ...blog, content: updatedContent });
  };

  const addFieldToSection = (sectionIndex: number) => {
    const section = sections[sectionIndex];
    const currentContent = section.content || [];
    
    const newField: ContentField = {
      name: `field_${currentContent.length + 1}`,
      data: '',
    };
    
    const updatedSections = [...sections];
    updatedSections[sectionIndex] = {
      ...section,
      content: [...currentContent, newField],
    };
    const updatedContent = {
      ...(blog.content as { sections: Section[] }),
      sections: updatedSections,
    };
    setBlog({ ...blog, content: updatedContent });
  };

  const removeFieldFromSection = (sectionIndex: number, fieldIndex: number) => {
    const section = sections[sectionIndex];
    const currentContent = section.content || [];
    
    const updatedSections = [...sections];
    updatedSections[sectionIndex] = {
      ...section,
      content: currentContent.filter((_, i) => i !== fieldIndex),
    };
    const updatedContentObj = {
      ...(blog.content as { sections: Section[] }),
      sections: updatedSections,
    };
    setBlog({ ...blog, content: updatedContentObj });
  };

  const updateFieldName = (
    sectionIndex: number,
    fieldIndex: number,
    newName: string
  ) => {
    const section = sections[sectionIndex];
    const currentContent = section.content || [];
    
    const updatedContent = [...currentContent];
    updatedContent[fieldIndex] = {
      ...updatedContent[fieldIndex],
      name: newName,
    };
    
    const updatedSections = [...sections];
    updatedSections[sectionIndex] = {
      ...section,
      content: updatedContent,
    };
    const updatedContentObj = {
      ...(blog.content as { sections: Section[] }),
      sections: updatedSections,
    };
    setBlog({ ...blog, content: updatedContentObj });
  };

  const updateFieldData = (
    sectionIndex: number,
    fieldIndex: number,
    data: unknown
  ) => {
    const section = sections[sectionIndex];
    const currentContent = section.content || [];
    
    const updatedContent = [...currentContent];
    updatedContent[fieldIndex] = {
      ...updatedContent[fieldIndex],
      data,
    };
    
    const updatedSections = [...sections];
    updatedSections[sectionIndex] = {
      ...section,
      content: updatedContent,
    };
    const updatedContentObj = {
      ...(blog.content as { sections: Section[] }),
      sections: updatedSections,
    };
    setBlog({ ...blog, content: updatedContentObj });
  };

  const handleFileUpload = async (
    sectionIndex: number,
    fieldIndex: number,
    file: File
  ) => {
    const uploadKey = `${sectionIndex}-${fieldIndex}`;
    setUploadingFields((prev) => ({ ...prev, [uploadKey]: 'uploading' }));
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.url) {
        updateFieldData(sectionIndex, fieldIndex, data.url);
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploadingFields((prev) => {
        const newState = { ...prev };
        delete newState[uploadKey];
        return newState;
      });
    }
  };

  const handleSectionDragStart = (e: React.DragEvent, sectionIndex: number) => {
    setDraggedSectionId(`section-${sectionIndex}`);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', sectionIndex.toString());
  };

  const handleSectionDrop = (e: React.DragEvent, targetSectionIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    const dragData = e.dataTransfer.getData('text/plain');
    if (!dragData) return;
    
    const draggedIndex = parseInt(dragData);
    if (isNaN(draggedIndex) || draggedIndex === targetSectionIndex) {
      setDraggedSectionId(null);
      return;
    }
    
    const newSections = [...sections];
    const [draggedSection] = newSections.splice(draggedIndex, 1);
    newSections.splice(targetSectionIndex, 0, draggedSection);
    
    const updatedContent = {
      ...(blog.content as { sections: Section[] }),
      sections: newSections,
    };
    setBlog({ ...blog, content: updatedContent });
    
    setDraggedSectionId(null);
  };

  const handleSectionDragEnd = () => {
    setDraggedSectionId(null);
    document.querySelectorAll('.opacity-50').forEach((el) => {
      el.classList.remove('opacity-50');
    });
    document.querySelectorAll('.border-purple-400').forEach((el) => {
      el.classList.remove('border-purple-400');
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: websitesData } = await getWebsitesByInstitution();
      if (websitesData && websitesData.length > 0) {
        setWebsites(websitesData);
        
        if (isNew) {
          setBlog(prev => ({
            ...prev,
            website_id: websitesData[0].id,
          }));
        }
      }

      // Fetch existing categories from all blogs
      const { data: allBlogs } = await supabase
        .from('blogs')
        .select('categories');
      
      if (allBlogs) {
        const categorySet = new Set<string>();
        allBlogs.forEach((blog) => {
          if (blog.categories && Array.isArray(blog.categories)) {
            blog.categories.forEach((cat: string) => {
              if (cat && cat.trim()) {
                categorySet.add(cat.trim());
              }
            });
          }
        });
        setExistingCategories(Array.from(categorySet).sort());
      }

      if (!isNew && params.id) {
        const { data: blogData } = await supabase
          .from('blogs')
          .select('*')
          .eq('id', params.id)
          .single();

        if (blogData) {
          // Handle content field - it might be JSONB with sections or old format
          let content: { sections: Section[] } | Record<string, unknown> = { sections: [] };
          
          if (blogData.content) {
            if (typeof blogData.content === 'object') {
              // Check if it already has sections structure
              if ('sections' in blogData.content && Array.isArray(blogData.content.sections)) {
                // Convert old format to new simplified format
                const oldSections = blogData.content.sections as Array<{
                  title?: string;
                  fields?: Array<{ name?: string; value?: unknown }>;
                  content?: Array<{ name: string; data: unknown }> | Record<string, unknown>;
                }>;
                const newSections: Section[] = oldSections.map((oldSection) => {
                  // If already in new format (array of ContentField)
                  if (Array.isArray(oldSection.content)) {
                    return {
                      title: oldSection.title || 'Untitled Section',
                      content: oldSection.content,
                    };
                  }
                  
                  // Convert old format with fields array
                  const oldFields = oldSection.fields || [];
                  const contentArray: ContentField[] = oldFields.map((field) => ({
                    name: field.name || `field_${Date.now()}`,
                    data: field.value || '',
                  }));
                  
                  // If content is an object, convert to array
                  if (oldSection.content && typeof oldSection.content === 'object' && !Array.isArray(oldSection.content)) {
                    Object.entries(oldSection.content).forEach(([key, value]) => {
                      if (key !== '_fieldDefinitions' && key !== 'fields') {
                        contentArray.push({ name: key, data: value });
                      }
                    });
                  }
                  
                  return {
                    title: oldSection.title || 'Untitled Section',
                    content: contentArray,
                  };
                });
                content = { sections: newSections };
              } else {
                // Old format - convert to sections
                content = {
                  sections: [{
                    title: 'Main Content',
                    content: [{ name: 'content', data: typeof blogData.content === 'string' ? blogData.content : JSON.stringify(blogData.content) }],
                  }],
                };
              }
            } else if (typeof blogData.content === 'string') {
              // String content - convert to sections
              content = {
                sections: [{
                  title: 'Main Content',
                  content: [{ name: 'content', data: blogData.content }],
                }],
              };
            }
          }
          
          setBlog({
            ...blogData,
            content,
            categories: blogData.categories && Array.isArray(blogData.categories) ? blogData.categories : [],
          });
          // Mark slug as manually edited for existing blogs so it doesn't auto-update
          setSlugManuallyEdited(true);
        }
      }
      setLoading(false);
    };
    
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, isNew]);

  const handleImageUpload = async (file: File, field: 'featured_image' | 'og_image') => {
    setUploadingImage(field);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.url) {
        setBlog({ ...blog, [field]: data.url });
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploadingImage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (!blog.website_id) {
      alert('Please select a website');
      setSaving(false);
      return;
    }

    if (!blog.slug) {
      alert('Please enter a slug');
      setSaving(false);
      return;
    }

    // Ensure slug is unique before saving
    const cleanedSlug = generateSlug(blog.slug);
    if (!cleanedSlug) {
      alert('Please enter a valid slug');
      setSaving(false);
      return;
    }

    const uniqueSlug = await ensureUniqueSlug(cleanedSlug, isNew ? undefined : params.id as string);

    // Content is already clean - just name and data
    const cleanedContent = blog.content;

    const blogData = {
      website_id: blog.website_id,
      title: blog.title,
      subtitle: blog.subtitle,
      content: cleanedContent,
      slug: uniqueSlug,
      featured_image: blog.featured_image || null,
      meta_title: blog.meta_title || null,
      meta_description: blog.meta_description || null,
      og_image: blog.og_image || null,
      is_published: blog.is_published,
      categories: blog.categories && blog.categories.length > 0 ? blog.categories : null,
    };

    // Use server actions with role-based access checks (same pattern as course-management)
    const result = isNew
      ? await createBlog(blogData)
      : await updateBlog(params.id as string, blogData);

    if (result.error) {
      alert(result.error);
      setSaving(false);
    } else {
      router.push('/admin/blogs');
      router.refresh();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/blogs">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">
            {isNew ? 'Create New Blog' : 'Edit Blog'}
          </h1>
        </div>
      </div>

      {!isNew && params.id && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
                  Blog ID
                </label>
                <div className="bg-white border border-slate-300 rounded px-3 py-2 font-mono text-sm text-slate-900 break-all">
                  {params.id}
                </div>
              </div>
              {blog.website_id && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
                    Website ID
                  </label>
                  <div className="bg-white border border-slate-300 rounded px-3 py-2 font-mono text-sm text-slate-900 break-all">
                    {blog.website_id}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-xs font-medium text-slate-700 mb-1">
                    Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={blog.title}
                    onChange={async (e) => {
                      const newTitle = e.target.value;
                      
                      // Auto-generate slug from title (only for new blogs and if slug wasn't manually edited)
                      if (isNew && !slugManuallyEdited && newTitle) {
                        const generatedSlug = generateSlug(newTitle);
                        if (generatedSlug) {
                          const uniqueSlug = await ensureUniqueSlug(generatedSlug);
                          setBlog(prev => ({ ...prev, title: newTitle, slug: uniqueSlug }));
                        } else {
                          setBlog(prev => ({ ...prev, title: newTitle }));
                        }
                      } else {
                        setBlog(prev => ({ ...prev, title: newTitle }));
                      }
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter blog title"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="subtitle" className="block text-xs font-medium text-slate-700 mb-1">
                    Subtitle
                  </label>
                  <input
                    id="subtitle"
                    type="text"
                    value={blog.subtitle}
                    onChange={(e) => setBlog({ ...blog, subtitle: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter blog subtitle"
                  />
                </div>

                <div>
                  <label htmlFor="slug" className="block text-xs font-medium text-slate-700 mb-1">
                    URL Slug *
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-sm">/</span>
                    <input
                      id="slug"
                      type="text"
                      value={blog.slug}
                      onChange={async (e) => {
                        const newSlug = e.target.value;
                        setSlugManuallyEdited(true);
                        setBlog({ ...blog, slug: newSlug });
                      }}
                      onBlur={async () => {
                        // Ensure slug is unique when user finishes editing
                        if (blog.slug) {
                          const cleanedSlug = generateSlug(blog.slug);
                          if (cleanedSlug && cleanedSlug !== blog.slug) {
                            const uniqueSlug = await ensureUniqueSlug(cleanedSlug, isNew ? undefined : params.id as string);
                            setBlog(prev => ({ ...prev, slug: uniqueSlug }));
                          } else if (cleanedSlug) {
                            const uniqueSlug = await ensureUniqueSlug(cleanedSlug, isNew ? undefined : params.id as string);
                            if (uniqueSlug !== blog.slug) {
                              setBlog(prev => ({ ...prev, slug: uniqueSlug }));
                            }
                          }
                        }
                      }}
                      className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="blog-slug"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Full URL: /{blog.slug || 'blog-slug'}
                    {isNew && !slugManuallyEdited && (
                      <span className="text-purple-600 ml-2">(auto-generated from title)</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Content Sections */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Content Sections</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Add multiple sections to your blog. Each section can have different types of content fields.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={addSection}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Section
                </Button>
              </div>

              {sections.length > 0 ? (
                <div className="space-y-3">
                  {sections.map((section, index) => {
                    const sectionKey = `section-${index}`;
                    const isExpanded = expandedSections.has(sectionKey);
                    const isSectionDragging = draggedSectionId === sectionKey;
                    
                    return (
                      <div
                        key={sectionKey}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (draggedSectionId && draggedSectionId !== sectionKey) {
                            e.currentTarget.classList.add('border-purple-400', 'bg-purple-50');
                          }
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.classList.remove('border-purple-400', 'bg-purple-50');
                        }}
                        onDrop={(e) => {
                          handleSectionDrop(e, index);
                          e.currentTarget.classList.remove('border-purple-400', 'bg-purple-50');
                        }}
                        className={`border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 transition ${
                          isSectionDragging ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div
                                  draggable
                                  onDragStart={(e) => {
                                    handleSectionDragStart(e, index);
                                    e.stopPropagation();
                                  }}
                                  onDragEnd={handleSectionDragEnd}
                                  className="cursor-grab active:cursor-grabbing shrink-0"
                                >
                                  <GripVertical 
                                    className="w-5 h-5 text-slate-400" 
                                    onMouseDown={(e) => e.stopPropagation()}
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => toggleSectionExpanded(index)}
                                  className="text-slate-400 hover:text-slate-600"
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="w-5 h-5" />
                                  ) : (
                                    <ChevronRight className="w-5 h-5" />
                                  )}
                                </button>
                                <span className="text-sm font-medium text-slate-500">
                                  #{index + 1}
                                </span>
                                <h4 className="font-medium text-slate-900">
                                  {section.title || `Section ${index + 1}`}
                                </h4>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-8">
                                <div>
                                  <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Section Name
                                  </label>
                                  <input
                                    type="text"
                                    value={section.title || ''}
                                    onChange={(e) => {
                                      updateSection(index, { title: e.target.value });
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Section title"
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                type="button"
                                onClick={() => removeSection(index)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Expanded Section Editor */}
                        {isExpanded && (
                          <div className="px-4 pb-4 border-t border-slate-200 pt-4">
                            <div className="flex items-center justify-between mb-4">
                              <h5 className="text-sm font-semibold text-slate-900">Section Fields</h5>
                              <Button
                                type="button"
                                onClick={() => addFieldToSection(index)}
                                variant="outline"
                                size="sm"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Field
                              </Button>
                            </div>
                            
                            {section.content && section.content.length > 0 ? (
                              <div className="space-y-3">
                                {section.content.map((field, fieldIndex) => {
                                  const fieldUploadKey = `${index}-${fieldIndex}`;
                                  const isUploading = uploadingFields[fieldUploadKey] === 'uploading';
                                  const fieldData = field.data;
                                  
                                  return (
                                    <div
                                      key={fieldIndex}
                                      className="border border-slate-200 rounded-lg p-3 bg-white transition hover:border-purple-300"
                                    >
                                      <div className="flex items-start gap-3">
                                        <div className="flex-1 space-y-3">
                                          <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                              Field Name
                                            </label>
                                            <input
                                              type="text"
                                              value={field.name}
                                              onChange={(e) => {
                                                e.stopPropagation();
                                                updateFieldName(index, fieldIndex, e.target.value);
                                              }}
                                              onFocus={(e) => e.stopPropagation()}
                                              className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                              autoFocus={false}
                                            />
                                          </div>
                                          
                                          {/* Field Data Input */}
                                          <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                              Data
                                            </label>
                                            
                                            {typeof fieldData === 'string' && (
                                              fieldData.startsWith('http') || fieldData.startsWith('/') ? (
                                                // URL/Link
                                                <div className="space-y-2">
                                                  <input
                                                    type="text"
                                                    value={fieldData}
                                                    onChange={(e) => updateFieldData(index, fieldIndex, e.target.value)}
                                                    className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    placeholder="/about or https://example.com"
                                                  />
                                                  {fieldData && (
                                                    <a
                                                      href={fieldData}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="text-xs text-purple-600 hover:underline"
                                                    >
                                                      {fieldData}
                                                    </a>
                                                  )}
                                                </div>
                                              ) : fieldData.length > 200 ? (
                                                // Long text - use textarea
                                                <textarea
                                                  value={fieldData}
                                                  onChange={(e) => updateFieldData(index, fieldIndex, e.target.value)}
                                                  rows={5}
                                                  className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                />
                                              ) : (
                                                // Short text
                                                <input
                                                  type="text"
                                                  value={fieldData}
                                                  onChange={(e) => updateFieldData(index, fieldIndex, e.target.value)}
                                                  className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                />
                                              )
                                            )}
                                            
                                            {typeof fieldData === 'number' && (
                                              <input
                                                type="number"
                                                value={fieldData}
                                                onChange={(e) => updateFieldData(index, fieldIndex, parseFloat(e.target.value) || 0)}
                                                className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                              />
                                            )}
                                            
                                            {typeof fieldData === 'boolean' && (
                                              <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                  type="checkbox"
                                                  checked={fieldData}
                                                  onChange={(e) => updateFieldData(index, fieldIndex, e.target.checked)}
                                                  className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                                />
                                                <span className="text-xs text-slate-600">Enabled</span>
                                              </label>
                                            )}
                                            
                                            {typeof fieldData === 'string' && (fieldData.includes('<img') || fieldData.match(/\.(jpg|jpeg|png|gif|webp)/i)) && (
                                              <div className="space-y-2">
                                                <input
                                                  type="file"
                                                  accept="image/*"
                                                  onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleFileUpload(index, fieldIndex, file);
                                                  }}
                                                  className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                  disabled={isUploading}
                                                />
                                                {fieldData && (
                                                  <div className="relative w-full h-32 border border-slate-300 rounded-lg overflow-hidden bg-slate-100">
                                                    <Image
                                                      src={fieldData}
                                                      alt={field.name}
                                                      fill
                                                      className="object-contain"
                                                      unoptimized
                                                    />
                                                  </div>
                                                )}
                                                {isUploading && (
                                                  <div className="flex items-center gap-2 text-xs text-slate-600">
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                    <span>Uploading...</span>
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                            
                                            {!fieldData && (
                                              <div className="space-y-2">
                                                <input
                                                  type="text"
                                                  value=""
                                                  onChange={(e) => updateFieldData(index, fieldIndex, e.target.value)}
                                                  className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                  placeholder="Enter data..."
                                                />
                                                <div className="flex gap-2">
                                                  <Button
                                                    type="button"
                                                    onClick={() => {
                                                      const input = document.createElement('input');
                                                      input.type = 'file';
                                                      input.accept = 'image/*';
                                                      input.onchange = (e) => {
                                                        const file = (e.target as HTMLInputElement).files?.[0];
                                                        if (file) handleFileUpload(index, fieldIndex, file);
                                                      };
                                                      input.click();
                                                    }}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs"
                                                  >
                                                    Upload Image
                                                  </Button>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        
                                        <Button
                                          type="button"
                                          onClick={() => removeFieldFromSection(index, fieldIndex)}
                                          variant="ghost"
                                          size="sm"
                                          className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-center py-4 text-slate-500 border border-slate-200 rounded-lg bg-slate-50">
                                <p className="text-xs mb-2">No fields added yet.</p>
                                <Button
                                  type="button"
                                  onClick={() => addFieldToSection(index)}
                                  variant="outline"
                                  size="sm"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add Field
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 border border-slate-200 rounded-lg bg-slate-50">
                  <p className="mb-4">No sections added yet.</p>
                  <Button
                    type="button"
                    onClick={addSection}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Section
                  </Button>
                </div>
              )}
            </div>

            {/* Images */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Images</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Featured Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'featured_image');
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={uploadingImage === 'featured_image'}
                  />
                  {blog.featured_image && (
                    <div className="mt-3 relative w-full h-48 border border-slate-300 rounded-lg overflow-hidden bg-slate-100">
                      <Image
                        src={blog.featured_image}
                        alt="Featured"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  {uploadingImage === 'featured_image' && (
                    <div className="flex items-center gap-2 text-xs text-slate-600 mt-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Uploading...</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    OG Image (Open Graph)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'og_image');
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={uploadingImage === 'og_image'}
                  />
                  {blog.og_image && (
                    <div className="mt-3 relative w-full h-48 border border-slate-300 rounded-lg overflow-hidden bg-slate-100">
                      <Image
                        src={blog.og_image}
                        alt="OG Image"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  {uploadingImage === 'og_image' && (
                    <div className="flex items-center gap-2 text-xs text-slate-600 mt-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Uploading...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 sticky top-6 h-fit">
              {/* Publish Box */}
              <div className="border-b border-slate-200 pb-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Publish</h3>
                <div className="space-y-4">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      isNew ? 'Publish' : 'Update'
                    )}
                  </Button>
                  <Link href="/admin/blogs" className="block">
                    <Button variant="outline" className="w-full">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Blog Attributes */}
              <div className="border-b border-slate-200 pb-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Blog Attributes</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="website_id" className="block text-xs font-medium text-slate-700 mb-1">
                      Website *
                    </label>
                    <select
                      id="website_id"
                      value={blog.website_id}
                      onChange={(e) => setBlog({ ...blog, website_id: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select a website</option>
                      {websites.map((website) => (
                        <option key={website.id} value={website.id}>
                          {website.title || 'Untitled Website'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={blog.is_published || false}
                      onChange={(e) => setBlog({ ...blog, is_published: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-slate-700">Published</span>
                  </label>
                </div>
              </div>

              {/* Categories */}
              <div className="border-b border-slate-200 pb-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Categories</h3>
                <div className="space-y-4">
                  {/* Existing Categories */}
                  {existingCategories.length > 0 && (
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-2">
                        Select Categories
                      </label>
                      <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-3 space-y-2 bg-slate-50">
                        {existingCategories.map((category) => {
                          const isChecked = blog.categories?.includes(category) || false;
                          return (
                            <label
                              key={category}
                              className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded transition"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  const currentCategories = blog.categories || [];
                                  if (e.target.checked) {
                                    setBlog({
                                      ...blog,
                                      categories: [...currentCategories, category],
                                    });
                                  } else {
                                    setBlog({
                                      ...blog,
                                      categories: currentCategories.filter((cat) => cat !== category),
                                    });
                                  }
                                }}
                                className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                              />
                              <span className="text-sm text-slate-700">{category}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Custom Category Input */}
                  <div>
                    <label htmlFor="custom_category" className="block text-xs font-medium text-slate-700 mb-1">
                      Add Custom Category
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="custom_category"
                        type="text"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const trimmed = customCategory.trim();
                            if (trimmed) {
                              const currentCategories = blog.categories || [];
                              if (!currentCategories.includes(trimmed)) {
                                setBlog({
                                  ...blog,
                                  categories: [...currentCategories, trimmed],
                                });
                                // Add to existing categories if not already there
                                if (!existingCategories.includes(trimmed)) {
                                  setExistingCategories([...existingCategories, trimmed].sort());
                                }
                              }
                              setCustomCategory('');
                            }
                          }
                        }}
                        className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Type and press Enter"
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          const trimmed = customCategory.trim();
                          if (trimmed) {
                            const currentCategories = blog.categories || [];
                            if (!currentCategories.includes(trimmed)) {
                              setBlog({
                                ...blog,
                                categories: [...currentCategories, trimmed],
                              });
                              // Add to existing categories if not already there
                              if (!existingCategories.includes(trimmed)) {
                                setExistingCategories([...existingCategories, trimmed].sort());
                              }
                            }
                            setCustomCategory('');
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Selected Categories Display */}
                  {blog.categories && blog.categories.length > 0 && (
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-2">
                        Selected Categories
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {blog.categories.map((category) => (
                          <span
                            key={category}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                          >
                            {category}
                            <button
                              type="button"
                              onClick={() => {
                                setBlog({
                                  ...blog,
                                  categories: blog.categories?.filter((cat) => cat !== category) || [],
                                });
                              }}
                              className="hover:text-purple-900"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SEO Settings */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-4">SEO Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="meta_title" className="block text-xs font-medium text-slate-700 mb-1">
                      Meta Title
                    </label>
                    <input
                      id="meta_title"
                      type="text"
                      value={blog.meta_title}
                      onChange={(e) => setBlog({ ...blog, meta_title: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="SEO title"
                    />
                  </div>

                  <div>
                    <label htmlFor="meta_description" className="block text-xs font-medium text-slate-700 mb-1">
                      Meta Description
                    </label>
                    <textarea
                      id="meta_description"
                      value={blog.meta_description || ''}
                      onChange={(e) => setBlog({ ...blog, meta_description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="SEO description"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

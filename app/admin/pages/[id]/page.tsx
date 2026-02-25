'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Plus, Trash2, GripVertical, ChevronDown, ChevronRight, Check } from 'lucide-react';
import Link from 'next/link';
import { getWebsitesByInstitution } from '@/app/admin/actions/websites';
import { createPage, updatePage } from '@/app/admin/actions/pages';
import Image from 'next/image';
import RichTextEditor from '@/components/ui/rich-text-editor';

interface RepeatableItem {
  [key: string]: unknown;
}

interface RepeatableFieldConfig {
  name: string;
  type: 'text' | 'richtext' | 'email' | 'phone' | 'image' | 'pdf' | 'video' | 'link' | 'number' | 'boolean' | 'geopoint' | 'repeatable';
  required?: boolean;
  repeatableFields?: RepeatableFieldConfig[]; // For nested repeatable groups
}

interface FieldDefinition {
  name: string;
  type: 'text' | 'richtext' | 'email' | 'phone' | 'image' | 'pdf' | 'video' | 'link' | 'number' | 'boolean' | 'geopoint' | 'repeatable';
  required?: boolean;
  repeatableFields?: RepeatableFieldConfig[];
}

interface Section {
  id?: string;
  component_type: string;
  title?: string;
  content?: Record<string, unknown>; // Only data values, no metadata
  fieldDefinitions?: FieldDefinition[]; // UI-only metadata, not saved
  order_index?: number;
  is_visible?: boolean;
}

const fieldTypes = [
  { value: 'text', label: 'Plain Text' },
  { value: 'richtext', label: 'Rich Text' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'link', label: 'Link' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'geopoint', label: 'Geo Point' },
  { value: 'image', label: 'Image' },
  { value: 'pdf', label: 'PDF' },
  { value: 'video', label: 'Video' },
  { value: 'repeatable', label: 'Repeatable Items' },
];

interface Website {
  id: string;
  title?: string;
  name?: string;
  [key: string]: unknown;
}

interface Page {
  id?: string;
  website_id: string;
  slug: string;
  title: string;
  is_published: boolean;
  meta_title: string;
  meta_description: string;
  order_index: number;
  sections: Section[];
}

export default function PageEditor() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const isNew = params.id === 'new';
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [originalSlug, setOriginalSlug] = useState<string>('');
  const [createPageFile, setCreatePageFile] = useState(false);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [uploadingFields, setUploadingFields] = useState<Record<string, string>>({});
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const [draggedFieldId, setDraggedFieldId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [duplicateFieldError, setDuplicateFieldError] = useState<{ sectionIndex: number; fieldIndex: number } | null>(null);
  const [activeEditingField, setActiveEditingField] = useState<{ sectionIndex: number; fieldIndex: number } | null>(null);
  const [originalDatabaseContent, setOriginalDatabaseContent] = useState<Record<number, Record<string, unknown>>>({});
  
  const toggleSectionExpanded = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };
  
  const addFieldToSection = (sectionIndex: number) => {
    const section = page.sections[sectionIndex];
    const currentContent = section.content || {};
    const fieldDefinitions = section.fieldDefinitions || [];
    
    // Generate a unique default name
    let defaultName = `field_${fieldDefinitions.length + 1}`;
    let counter = 1;
    const existingNames = new Set(fieldDefinitions.map(f => f.name));
    while (existingNames.has(defaultName)) {
      defaultName = `field_${fieldDefinitions.length + 1}_${counter}`;
      counter++;
    }
    
    const newField: FieldDefinition = {
      name: defaultName,
      type: 'text',
      required: false,
    };
    
    const newFieldIndex = fieldDefinitions.length;
    // Use index-based key for storing value
    const indexKey = `_idx_${newFieldIndex}`;
    
    const updatedSections = [...page.sections];
    updatedSections[sectionIndex] = {
      ...section,
      content: {
        ...currentContent,
        [indexKey]: '',
      },
      fieldDefinitions: [...fieldDefinitions, newField],
    };
    setPage({ ...page, sections: updatedSections });
  };
  
  const removeFieldFromSection = (sectionIndex: number, fieldIndex: number) => {
    const section = page.sections[sectionIndex];
    const currentContent = section.content || {};
    const fieldDefinitions = section.fieldDefinitions || [];
    
    // Validate field index
    if (fieldIndex < 0 || fieldIndex >= fieldDefinitions.length) return;
    
    // Remove the value using index-based key
    const indexKey = `_idx_${fieldIndex}`;
    const updatedContent = { ...currentContent };
    delete updatedContent[indexKey];
    
    // Remove the field definition by index
    const updatedDefinitions = fieldDefinitions.filter((_, idx) => idx !== fieldIndex);
    
    // Reindex remaining fields' content keys
    const reindexedContent: Record<string, unknown> = {};
    updatedDefinitions.forEach((_, newIndex) => {
      // Find the original index for this field
      const originalIndex = newIndex < fieldIndex ? newIndex : newIndex + 1;
      const originalKey = `_idx_${originalIndex}`;
      if (currentContent[originalKey] !== undefined) {
        reindexedContent[`_idx_${newIndex}`] = currentContent[originalKey];
      }
    });
    
    const updatedSections = [...page.sections];
    updatedSections[sectionIndex] = {
      ...section,
      content: reindexedContent,
      fieldDefinitions: updatedDefinitions,
    };
    setPage({ ...page, sections: updatedSections });
  };
  
  const updateFieldDefinition = (
    sectionIndex: number,
    fieldIndex: number,
    updates: Partial<FieldDefinition>
  ) => {
    const section = page.sections[sectionIndex];
    const currentContent = section.content || {};
    const fieldDefinitions = section.fieldDefinitions || [];
    
    if (fieldIndex < 0 || fieldIndex >= fieldDefinitions.length) return;
    
    const currentField = fieldDefinitions[fieldIndex];
    const oldFieldName = currentField.name;
    
    const indexKey = `_idx_${fieldIndex}`;
    const currentValue = currentContent[indexKey];
    
    const updatedField = { ...currentField, ...updates };
    
    const newFieldName = updates.name !== undefined ? updates.name : oldFieldName;
    
    setActiveEditingField({ sectionIndex, fieldIndex });
    
    if (newFieldName && newFieldName.trim().length > 0 && newFieldName !== oldFieldName) {
   
      const duplicateField = fieldDefinitions.find(
        (f, idx) => idx !== fieldIndex && f.name?.trim() === newFieldName.trim()
      );
      
      if (duplicateField) {
     
        setDuplicateFieldError({ sectionIndex, fieldIndex });
      } else {
    
        if (duplicateFieldError?.sectionIndex === sectionIndex && duplicateFieldError?.fieldIndex === fieldIndex) {
          setDuplicateFieldError(null);
        }
      }
    } else if (newFieldName === oldFieldName) {
      // Name hasn't changed - only clear error if THIS specific field had it
      // Don't check or modify error state for any other fields
      if (duplicateFieldError?.sectionIndex === sectionIndex && duplicateFieldError?.fieldIndex === fieldIndex) {
        setDuplicateFieldError(null);
      }
    } else {
      // Name is empty - only clear error if THIS specific field had it
      if (duplicateFieldError?.sectionIndex === sectionIndex && duplicateFieldError?.fieldIndex === fieldIndex) {
        setDuplicateFieldError(null);
      }
    }
    
    const updatedContent = { ...currentContent };
    if (!(indexKey in updatedContent)) {
      updatedContent[indexKey] = currentValue !== undefined ? currentValue : '';
    }
    
    updatedField.name = newFieldName;
    
    const updatedDefinitions = [...fieldDefinitions];
    updatedDefinitions[fieldIndex] = updatedField;
    
    const updatedSections = [...page.sections];
    updatedSections[sectionIndex] = {
      ...section,
      content: updatedContent,
      fieldDefinitions: updatedDefinitions,
    };
    setPage({ ...page, sections: updatedSections });
  };
  
  const updateFieldValue = (
    sectionIndex: number,
    fieldIndex: number,
    value: unknown
  ) => {
    const section = page.sections[sectionIndex];
    const currentContent = section.content || {};
    const fieldDefinitions = section.fieldDefinitions || [];
    
    if (fieldIndex < 0 || fieldIndex >= fieldDefinitions.length) return;
    
    const indexKey = `_idx_${fieldIndex}`;
    
    const updatedContent = {
      ...currentContent,
      [indexKey]: value,
    };
    
    const updatedSections = [...page.sections];
    updatedSections[sectionIndex] = {
      ...section,
      content: updatedContent,
    };
    setPage({ ...page, sections: updatedSections });
  };
  
  const handleFileUpload = async (
    sectionIndex: number,
    fieldIndex: number,
    file: File,
    altText: string = ''
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
        updateFieldValue(sectionIndex, fieldIndex, { url: data.url, alt: altText });
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
  
  const handleSectionDragStart = (e: React.DragEvent, sectionId: string) => {
    setDraggedSectionId(sectionId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', sectionId);
  };
  
  const handleSectionDrop = (e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const dragData = e.dataTransfer.getData('text/plain') || draggedSectionId;
    if (!dragData) return;
    
    const sections = [...page.sections];
    const draggedIndex = sections.findIndex((s) => {
      const sId = s.id || `section-${sections.indexOf(s)}`;
      return sId === dragData;
    });
    const targetIndex = sections.findIndex((s) => {
      const sId = s.id || `section-${sections.indexOf(s)}`;
      return sId === targetSectionId;
    });
    
    if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
      setDraggedSectionId(null);
      return;
    }
    
    const newSections = [...sections];
    const [draggedSection] = newSections.splice(draggedIndex, 1);
    newSections.splice(targetIndex, 0, draggedSection);
    
    const updatedSections = newSections.map((section, idx) => ({
      ...section,
      order_index: idx,
    }));
    
    setPage((prevPage) => ({
      ...prevPage,
      sections: updatedSections,
    }));
    
    setDraggedSectionId(null);
  };
  
  const handleSectionDragEnd = () => {
    setDraggedSectionId(null);
    document.querySelectorAll('.opacity-50').forEach((el) => {
      el.classList.remove('opacity-50');
    });
    document.querySelectorAll('.border-blue-300, .border-teal-300').forEach((el) => {
      el.classList.remove('border-blue-300', 'border-teal-300');
    });
  };

  const handleFieldDragStart = (e: React.DragEvent, sectionIndex: number, fieldIndex: number) => {
    const fieldId = `section-${sectionIndex}-field-${fieldIndex}`;
    setDraggedFieldId(fieldId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ sectionIndex, fieldIndex }));
    e.stopPropagation();
  };

  const handleFieldDrop = (e: React.DragEvent, targetSectionIndex: number, targetFieldIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    const dragData = e.dataTransfer.getData('text/plain');
    if (!dragData) return;
    
    try {
      const { sectionIndex: draggedSectionIndex, fieldIndex: draggedFieldIndex } = JSON.parse(dragData);
      
      // Only allow reordering within the same section
      if (draggedSectionIndex !== targetSectionIndex) {
        setDraggedFieldId(null);
        return;
      }
      
      if (draggedFieldIndex === targetFieldIndex) {
        setDraggedFieldId(null);
        return;
      }
      
      const section = page.sections[draggedSectionIndex];
      const fieldDefinitions = [...(section.fieldDefinitions || [])];
      const content = { ...(section.content || {}) };
      
      const [draggedField] = fieldDefinitions.splice(draggedFieldIndex, 1);
      fieldDefinitions.splice(targetFieldIndex, 0, draggedField);
      
      const originalValues: unknown[] = [];
      for (let i = 0; i < fieldDefinitions.length; i++) {
        const key = `_idx_${i}`;
        originalValues[i] = content[key];
      }
      
      const reorderedContent: Record<string, unknown> = {};
      
      const originalFieldDefinitions = [...(section.fieldDefinitions || [])];
      fieldDefinitions.forEach((fieldDef, newIndex) => {
        const originalIndex = originalFieldDefinitions.findIndex(
          (origField) => 
            origField.name === fieldDef.name && 
            origField.type === fieldDef.type
        );
        
        if (originalIndex >= 0 && originalIndex < originalValues.length) {
          reorderedContent[`_idx_${newIndex}`] = originalValues[originalIndex] !== undefined ? originalValues[originalIndex] : '';
        } else {
          reorderedContent[`_idx_${newIndex}`] = '';
        }
      });
      
      const updatedSections = [...page.sections];
      updatedSections[draggedSectionIndex] = {
        ...section,
        fieldDefinitions,
        content: reorderedContent,
      };
      
      setPage({ ...page, sections: updatedSections });
      setDraggedFieldId(null);
    } catch (err) {
      console.error('Error handling field drop:', err);
      setDraggedFieldId(null);
    }
  };

  const handleFieldDragEnd = () => {
    setDraggedFieldId(null);
    // Clean up any drag styling
    document.querySelectorAll('[data-field-drag]').forEach((el) => {
      el.classList.remove('opacity-50', 'border-blue-300', 'bg-blue-100/80', 'border-teal-300', 'bg-teal-100/80');
    });
  };

  const formatFieldNameForDatabase = (fieldName: string): string => {
    return fieldName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') 
      .replace(/[\s_-]+/g, '_') 
      .replace(/^_+|_+$/g, ''); 
  };

  const isFieldDuplicate = (sectionIndex: number, fieldIndex: number): boolean => {
    const hasError = duplicateFieldError !== null && 
                     duplicateFieldError.sectionIndex === sectionIndex && 
                     duplicateFieldError.fieldIndex === fieldIndex;
    
    const isActiveField = activeEditingField !== null &&
                          activeEditingField.sectionIndex === sectionIndex &&
                          activeEditingField.fieldIndex === fieldIndex;
    
    return hasError && isActiveField;
  };
  
  const [page, setPage] = useState<Page>({
    website_id: '',
    slug: '',
    title: '',
    is_published: false,
    meta_title: '',
    meta_description: '',
    order_index: 0,
    sections: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: websitesData } = await getWebsitesByInstitution();
      console.log("websitesData", websitesData);
      if (websitesData && websitesData.length > 0) {
        setWebsites(websitesData);
        
        if (isNew) {
          setPage(prev => {
            if (!prev.website_id) {
              return {
                ...prev,
                website_id: websitesData[0].id,
              };
            }
            return prev;
          });
        }
      }

      if (!isNew && params.id) {
        const { data: pageData } = await supabase
          .from('pages')
          .select('*')
          .eq('id', params.id)
          .single();

        if (pageData) {
          setOriginalSlug(pageData.slug);
          
            let sections = pageData.sections || [];
          
          if (typeof sections === 'string') {
            try {
              sections = JSON.parse(sections);
            } catch {
              sections = [];
            }
          }
          
          if (!Array.isArray(sections)) {
            sections = [];
          }
          
          const originalDbContent: Record<number, Record<string, unknown>> = {};
          
          const processedSections = sections.map((section: Section, index: number) => {
            let content = section.content || {};
            
            if (typeof content === 'string') {
              try {
                content = JSON.parse(content);
              } catch {
                content = {};
              }
            }
            
            originalDbContent[index] = { ...content };
            
            let fieldDefinitions: FieldDefinition[] = [];
            
            if (content && typeof content === 'object' && 'fields' in content && Array.isArray((content as { fields?: unknown[] }).fields)) {
              const oldFields = (content as { fields: Array<{ id?: string; name: string; type: string; value: unknown; required?: boolean; repeatableFields?: RepeatableFieldConfig[] }> }).fields;
              const newContent: Record<string, unknown> = {};
              
              oldFields.forEach((field) => {
                const fieldName = field.name || `field_${Date.now()}`;
                newContent[fieldName] = field.value || '';
                fieldDefinitions.push({
                  name: fieldName,
                  type: field.type as FieldDefinition['type'],
                  required: field.required || false,
                  repeatableFields: field.repeatableFields?.map((rf) => ({
                    name: rf.name,
                    type: rf.type,
                    required: rf.required,
                  })),
                });
              });
              
              content = newContent;
            }
            else if (content && typeof content === 'object' && '_fieldDefinitions' in content) {
              fieldDefinitions = (content as { _fieldDefinitions?: FieldDefinition[] })._fieldDefinitions || [];
              const newContent = { ...content };
              delete newContent._fieldDefinitions;
              content = newContent;
            }
            else if (content && typeof content === 'object' && Object.keys(content).length > 0 && fieldDefinitions.length === 0) {
              Object.keys(content).forEach((key) => {
                const value = content[key];
                let fieldType: FieldDefinition['type'] = 'text';
                
                if (typeof value === 'boolean') {
                  fieldType = 'boolean';
                } else if (typeof value === 'number') {
                  fieldType = 'number';
                } else if (typeof value === 'object' && value !== null && 'url' in value) {
                  if ('alt' in value) {
                    fieldType = 'image';
                  } else {
                    fieldType = 'link';
                  }
                } else if (typeof value === 'string') {
                  if (value.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
                    fieldType = 'image';
                  }
                  else if (value.match(/\.(pdf)$/i)) {
                    fieldType = 'pdf';
                  }
                  else if (value.match(/\.(mp4|webm|ogg|youtube|vimeo)/i)) {
                    fieldType = 'video';
                  }
                  else if (value.match(/<\/?[a-z][\s\S]*>/i)) {
                    fieldType = 'richtext';
                  }
                  else if (value.match(/^(https?:\/\/|\/)/i) || value.match(/^[a-z0-9][a-z0-9-]*(\.[a-z0-9][a-z0-9-]*)+(\/.*)?$/i)) {
                    fieldType = 'link';
                  }
                  else {
                    fieldType = 'text';
                  }
                } else if (Array.isArray(value)) {
                  fieldType = 'repeatable';
                }
                
                let repeatableFieldsConfig: RepeatableFieldConfig[] | undefined = undefined;
                if (fieldType === 'repeatable') {
                  const configKey = `_${key}_config`;
                  if (content[configKey] && Array.isArray(content[configKey])) {
                    const savedConfig = content[configKey] as unknown[];
                    repeatableFieldsConfig = savedConfig.map((item: unknown) => {
                      if (item && typeof item === 'object' && 'name' in item && 'type' in item) {
                        const validTypes: RepeatableFieldConfig['type'][] = ['text', 'richtext', 'email', 'phone', 'image', 'pdf', 'video', 'link', 'number', 'boolean', 'geopoint', 'repeatable'];
                        const itemType = String((item as { type: unknown }).type || 'text');
                        const configItem = item as { name: unknown; type: unknown; required?: boolean; repeatableFields?: unknown };
                        
                        let nestedRepeatableFields: RepeatableFieldConfig[] | undefined = undefined;
                        if (itemType === 'repeatable' && configItem.repeatableFields && Array.isArray(configItem.repeatableFields)) {
                          nestedRepeatableFields = (configItem.repeatableFields as unknown[]).map((nestedItem: unknown) => {
                            if (nestedItem && typeof nestedItem === 'object' && 'name' in nestedItem && 'type' in nestedItem) {
                              const nestedItemType = String((nestedItem as { type: unknown }).type || 'text');
                              return {
                                name: String((nestedItem as { name: unknown }).name || ''),
                                type: (validTypes.includes(nestedItemType as RepeatableFieldConfig['type']) ? nestedItemType : 'text') as RepeatableFieldConfig['type'],
                                required: Boolean((nestedItem as { required?: boolean }).required || false),
                              };
                            }
                            return { name: '', type: 'text' as RepeatableFieldConfig['type'], required: false };
                          }).filter((rf) => rf.name && rf.name.trim().length > 0);
                        }
                        
                        return {
                          name: String(configItem.name || ''),
                          type: (validTypes.includes(itemType as RepeatableFieldConfig['type']) ? itemType : 'text') as RepeatableFieldConfig['type'],
                          required: Boolean(configItem.required || false),
                          repeatableFields: nestedRepeatableFields,
                        };
                      }
                      return { name: '', type: 'text' as RepeatableFieldConfig['type'], required: false };
                    }).filter((rf) => rf.name && rf.name.trim().length > 0);
                  } else if (Array.isArray(value) && value.length > 0) {
                    const firstItem = value[0];
                    if (firstItem && typeof firstItem === 'object') {
                      repeatableFieldsConfig = Object.keys(firstItem).map((itemKey) => {
                        const itemValue = firstItem[itemKey];
                        let fieldType: RepeatableFieldConfig['type'] = 'text';
                        
                        let nestedRepeatableFields: RepeatableFieldConfig[] | undefined = undefined;
                        if (Array.isArray(itemValue)) {
                          fieldType = 'repeatable';
                          if (itemValue.length > 0 && typeof itemValue[0] === 'object' && itemValue[0] !== null) {
                            const firstNestedItem = itemValue[0];
                            nestedRepeatableFields = Object.keys(firstNestedItem).map((nestedItemKey) => {
                              const nestedItemValue = firstNestedItem[nestedItemKey];
                              let nestedFieldType: RepeatableFieldConfig['type'] = 'text';
                              
                              if (Array.isArray(nestedItemValue)) {
                                nestedFieldType = 'repeatable';
                              } else if (typeof nestedItemValue === 'boolean') {
                                nestedFieldType = 'boolean';
                              } else if (typeof nestedItemValue === 'number') {
                                nestedFieldType = 'number';
                              } else if (typeof nestedItemValue === 'object' && nestedItemValue !== null && 'url' in nestedItemValue) {
                                // Distinguish between image objects {url, alt} and link objects {url, text}
                                if ('alt' in nestedItemValue) {
                                  nestedFieldType = 'image';
                                } else {
                                  nestedFieldType = 'link';
                                }
                              } else if (typeof nestedItemValue === 'string') {
                                if (nestedItemValue.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
                                  nestedFieldType = 'image';
                                } else if (nestedItemValue.match(/\.(pdf)$/i)) {
                                  nestedFieldType = 'pdf';
                                } else if (nestedItemValue.match(/\.(mp4|webm|ogg)$/i)) {
                                  nestedFieldType = 'video';
                                } else if (nestedItemValue.match(/<\/?[a-z][\s\S]*>/i)) {
                                  nestedFieldType = 'richtext';
                                } else if (nestedItemValue.match(/^(https?:\/\/|\/)/i) || nestedItemValue.match(/^[a-z0-9][a-z0-9-]*(\.[a-z0-9][a-z0-9-]*)+(\/.*)?$/i)) {
                                  nestedFieldType = 'link';
                                } else if (nestedItemValue.match(/^-?\d+(\.\d+)?$/) && nestedItemValue.trim() !== '') {
                                  nestedFieldType = 'number';
                                }
                              }
                              
                              return {
                                name: nestedItemKey,
                                type: nestedFieldType,
                                required: false,
                              };
                            });
                          }
                        } else if (typeof itemValue === 'boolean') {
                          fieldType = 'boolean';
                        } else if (typeof itemValue === 'number') {
                          fieldType = 'number';
                        } else if (typeof itemValue === 'object' && itemValue !== null && 'url' in itemValue) {
                          // Distinguish between image objects {url, alt} and link objects {url, text}
                          if ('alt' in itemValue) {
                            fieldType = 'image';
                          } else {
                            fieldType = 'link';
                          }
                        } else if (typeof itemValue === 'string') {
                          if (itemValue.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
                            fieldType = 'image';
                          } else if (itemValue.match(/\.(pdf)$/i)) {
                            fieldType = 'pdf';
                          } else if (itemValue.match(/\.(mp4|webm|ogg)$/i)) {
                            fieldType = 'video';
                          }
                          else if (itemValue.match(/<\/?[a-z][\s\S]*>/i)) {
                            fieldType = 'richtext';
                          }
                          else if (itemValue.match(/^(https?:\/\/|\/)/i) || itemValue.match(/^[a-z0-9][a-z0-9-]*(\.[a-z0-9][a-z0-9-]*)+(\/.*)?$/i)) {
                            fieldType = 'link';
                          }
                          else if (itemValue.match(/^-?\d+(\.\d+)?$/) && itemValue.trim() !== '') {
                            fieldType = 'number';
                          }
                          else {
                            fieldType = 'text';
                          }
                        }
                        
                        return {
                          name: itemKey,
                          type: fieldType,
                          required: false,
                          repeatableFields: nestedRepeatableFields,
                        };
                      });
                    }
                  }
                }
                
                fieldDefinitions.push({
                  name: key,
                  type: fieldType,
                  required: false,
                  repeatableFields: repeatableFieldsConfig,
                });
              });
            }
            
            const indexBasedContent: Record<string, unknown> = {};
            fieldDefinitions.forEach((fieldDef, fieldIndex) => {
              const fieldName = fieldDef.name?.trim();
              if (fieldName) {
                const formattedName = formatFieldNameForDatabase(fieldName);
                let value: unknown = undefined;
                
                if (content[fieldName] !== undefined) {
                  value = content[fieldName];
                }
                else if (content[formattedName] !== undefined) {
                  value = content[formattedName];
                }
                else {
                  const matchingKey = Object.keys(content).find(
                    k => k.toLowerCase() === fieldName.toLowerCase() || 
                         k.toLowerCase() === formattedName.toLowerCase()
                  );
                  if (matchingKey) {
                    value = content[matchingKey];
                  }
                }
                
                if (value === undefined) {
                  value = fieldDef.type === 'repeatable' ? [] : '';
                }
                
                if (fieldDef.type === 'repeatable' && !Array.isArray(value)) {
                  value = [];
                }
                
                const indexKey = `_idx_${fieldIndex}`;
                indexBasedContent[indexKey] = value;
              }
            });
            
            return {
              id: section.id || `section-${index}`,
              component_type: section.component_type || 'custom',
              title: section.title || '',
              content: indexBasedContent,
              fieldDefinitions: fieldDefinitions,
              order_index: section.order_index ?? index,
              is_visible: section.is_visible !== undefined ? section.is_visible : true,
            };
          });

          console.log('Processed sections:', processedSections);
          console.log('Loaded page data:', {
            id: pageData.id,
            website_id: pageData.website_id,
            slug: pageData.slug,
            title: pageData.title,
            meta_title: pageData.meta_title,
            meta_description: pageData.meta_description,
            sections_count: processedSections.length,
          });

          const updatedPage = {
            id: pageData.id,
            website_id: pageData.website_id || '',
            slug: pageData.slug || '',
            title: pageData.title || '',
            is_published: pageData.is_published || false,
            meta_title: pageData.meta_title || '',
            meta_description: pageData.meta_description || '',
            order_index: pageData.order_index || 0,
            sections: processedSections,
          };

          setPage(updatedPage);
          setOriginalDatabaseContent(originalDbContent);

          if (processedSections.length > 0) {
            const sectionIds = processedSections.map((_section: Section, idx: number) => `section-${idx}`);
            setExpandedSections(new Set(sectionIds));
          }
        } else {
          console.warn('No page data found for ID:', params.id);
        }
      }
      setLoading(false);
    };
    
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setValidationError(null);

    if (!page.website_id) {
      setValidationError('Please select a website');
      setSaving(false);
      return;
    }

    if (!page.title || !page.slug) {
      setValidationError('Please fill in required fields (Title and Slug)');
      setSaving(false);
      return;
    }

    const emptyFields: Array<{ sectionTitle: string; fieldName: string }> = [];
   
    const duplicateFields: Array<{ sectionTitle: string; fieldName: string }> = [];
    
    page.sections.forEach((section, sectionIndex) => {
      const fieldDefinitions = section.fieldDefinitions || [];
      const content = section.content || {};
      
      // Check for duplicate field names in this section
      const fieldNameMap = new Map<string, number>();
      fieldDefinitions.forEach((fieldDef) => {
        const fieldName = fieldDef.name?.trim();
        if (fieldName && fieldName.length > 0) {
          const count = fieldNameMap.get(fieldName) || 0;
          fieldNameMap.set(fieldName, count + 1);
        }
      });
      
      // Find duplicates
      fieldNameMap.forEach((count, fieldName) => {
        if (count > 1) {
          duplicateFields.push({
            sectionTitle: section.title || `Section ${sectionIndex + 1}`,
            fieldName: fieldName,
          });
        }
      });
      
      fieldDefinitions.forEach((fieldDef, fieldIndex) => {
        const fieldName = fieldDef.name?.trim();
        if (fieldName && fieldName.length > 0) {
          const indexKey = `_idx_${fieldIndex}`;
          const fieldValue = content[indexKey];
          let isEmpty = false;
          if (fieldDef.type === 'link') {
            if (typeof fieldValue === 'object' && fieldValue !== null && 'url' in fieldValue) {
              isEmpty = !(fieldValue as { url?: string }).url || (fieldValue as { url?: string }).url === '';
            } else {
              isEmpty = !fieldValue || fieldValue === '' || fieldValue === null || fieldValue === undefined;
            }
          } else {
            isEmpty = 
              fieldValue === null ||
              fieldValue === undefined ||
              fieldValue === '' ||
              (Array.isArray(fieldValue) && fieldValue.length === 0);
          }
          
          if (isEmpty) {
            emptyFields.push({
              sectionTitle: section.title || `Section ${sectionIndex + 1}`,
              fieldName: fieldName,
            });
          }
        }
      });
    });

    if (duplicateFields.length > 0) {
      const errorMessage = `Please fix duplicate field names:\n${duplicateFields.map(f => `- ${f.sectionTitle}: "${f.fieldName}" (appears multiple times)`).join('\n')}\n\nEach field name must be unique within a section.`;
      setValidationError(errorMessage);
      setSaving(false);
      return;
    }

    if (emptyFields.length > 0) {
      const errorMessage = `Please fill in all field values:\n${emptyFields.map(f => `- ${f.sectionTitle}: "${f.fieldName}"`).join('\n')}`;
      setValidationError(errorMessage);
      setSaving(false);
      return;
    }

    try {
      const cleanedSections = (page.sections || []).map((section, sectionIndex) => {
      const { fieldDefinitions, ...sectionWithoutMetadata } = section;
        const content = sectionWithoutMetadata.content || {};
        
        const cleanedContent: Record<string, unknown> = {};
        (fieldDefinitions || []).forEach((fieldDef, fieldIndex) => {
          const fieldName = fieldDef.name?.trim();
          if (fieldName && fieldName.length > 0) {
            const indexKey = `_idx_${fieldIndex}`;
            const value = content[indexKey];
            
            const formattedKey = formatFieldNameForDatabase(fieldName);
            
            if (fieldDef.type === 'repeatable') {
              if (Array.isArray(value) && value.length > 0) {
                cleanedContent[formattedKey] = value;
              }
              
              const originalDbSectionContent = originalDatabaseContent[sectionIndex];
              const configKey = `_${formattedKey}_config`;
              
              const fieldExistedInOriginal = originalDbSectionContent && 
                originalDbSectionContent[formattedKey] !== undefined &&
                originalDbSectionContent[formattedKey] !== null;
              
              if (fieldExistedInOriginal) {
                const originalConfig = originalDbSectionContent[configKey];
                const currentConfig = fieldDef.repeatableFields && fieldDef.repeatableFields.length > 0 
                  ? fieldDef.repeatableFields 
                  : null;
                
                if (originalConfig && currentConfig) {
                  const configChanged = JSON.stringify(originalConfig) !== JSON.stringify(currentConfig);
                  
                  if (configChanged) {
                    cleanedContent[configKey] = currentConfig;
                  }
                }
              }
            } else {
              if (value !== undefined && value !== null && value !== '') {
                cleanedContent[formattedKey] = value;
              }
            }
          }
        });
        
        Object.keys(cleanedContent).forEach(key => {
          if (key.startsWith('_idx_')) {
            delete cleanedContent[key];
          }
        });
        
        return {
          ...sectionWithoutMetadata,
          content: cleanedContent,
        };
    });

    const pageData = {
      website_id: page.website_id,
      title: page.title,
      slug: page.slug,
        order_index: page.order_index || 0,
        is_published: page.is_published || false,
      meta_title: page.meta_title || null,
      meta_description: page.meta_description || null,
      sections: cleanedSections,
    };

      console.log('Saving page data:', { ...pageData, sections: `[${cleanedSections.length} sections]` });

      // Use server actions with role-based access checks (same pattern as course-management)
      const result = isNew
        ? await createPage(pageData)
        : await updatePage(params.id as string, pageData);

    if (result.error) {
        console.error('Database error:', result.error);
        setValidationError(`Error saving page: ${result.error}`);
      setSaving(false);
        return;
      }
      
      const data = result.data;

      console.log('Page saved successfully:', data);

      if (createPageFile) {
        try {
          const response = await fetch('/api/create-page-file', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              slug: page.slug,
              title: page.title,
              originalSlug: originalSlug,
              action: isNew ? 'create' : 'update',
            }),
          });

          const result = await response.json();
          if (!result.success) {
            console.warn('Failed to create/update page file:', result.error);
          }
        } catch (fileError) {
          console.error('Error creating/updating page file:', fileError);
        }
      }

      if (isNew && data?.id) {
        router.push(`/admin/pages/${data.id}`);
      router.refresh();
        return;
      }

      setSaveSuccess(true);
      setSaving(false);
      setValidationError(null);
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);

      if (!isNew && params.id) {
        const { data: updatedPageData } = await supabase
          .from('pages')
          .select('*')
          .eq('id', params.id)
          .single();

        if (updatedPageData) {
          setOriginalSlug(updatedPageData.slug);
          
          let sections = updatedPageData.sections || [];
          
          if (typeof sections === 'string') {
            try {
              sections = JSON.parse(sections);
            } catch {
              sections = [];
            }
          }
          
          if (!Array.isArray(sections)) {
            sections = [];
          }
          
          // Store original database content for comparison
          const originalDbContentAfterSave: Record<number, Record<string, unknown>> = {};
          
          const processedSections = sections.map((section: Section, index: number) => {
            let content = section.content || {};
            
            if (typeof content === 'string') {
              try {
                content = JSON.parse(content);
              } catch {
                content = {};
              }
            }
            
            // Store original database content (with formatted field names) for this section
            originalDbContentAfterSave[index] = { ...content };
            
            const fieldDefinitions: FieldDefinition[] = [];
            
            // Generate fieldDefinitions from content if they don't exist
            if (content && typeof content === 'object' && Object.keys(content).length > 0) {
              Object.keys(content).forEach((key) => {
                const value = content[key];
                let fieldType: FieldDefinition['type'] = 'text';
                
                if (typeof value === 'number') {
                  fieldType = 'number';
                } else if (typeof value === 'object' && value !== null && 'url' in value) {
                  // Distinguish between image objects {url, alt} and link objects {url, text}
                  if ('alt' in value) {
                    fieldType = 'image';
                  } else {
                    fieldType = 'link';
                  }
                } else if (typeof value === 'string') {
                  // Check for specific file types first (these can be URLs too)
                  // Check if it's an image URL
                  if (value.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
                    fieldType = 'image';
                  }
                  // Check if it's a PDF URL
                  else if (value.match(/\.(pdf)$/i)) {
                    fieldType = 'pdf';
                  }
                  // Check if it's a video URL
                  else if (value.match(/\.(mp4|webm|ogg|youtube|vimeo)/i)) {
                    fieldType = 'video';
                  }
                  // Check if it contains HTML tags (richtext) - more specific check
                  else if (value.match(/<\/?[a-z][\s\S]*>/i)) {
                    fieldType = 'richtext';
                  }
                  // Check if it's a URL/link (http, https, or relative path starting with /)
                  else if (value.match(/^(https?:\/\/|\/)/i) || value.match(/^[a-z0-9][a-z0-9-]*(\.[a-z0-9][a-z0-9-]*)+(\/.*)?$/i)) {
                    fieldType = 'link';
                  }
                  // Long text or text with newlines defaults to 'text' (textarea removed)
                  // Default to text for short strings without special patterns
                  else {
                    fieldType = 'text';
                  }
                } else if (Array.isArray(value)) {
                  fieldType = 'repeatable';
                }
                
                // For repeatable fields, check if there's a saved configuration
                let repeatableFieldsConfig: RepeatableFieldConfig[] | undefined = undefined;
                if (fieldType === 'repeatable') {
                  const configKey = `_${key}_config`;
                  if (content[configKey] && Array.isArray(content[configKey])) {
                    // Validate and ensure types are correct when loading from database
                    const savedConfig = content[configKey] as unknown[];
                    repeatableFieldsConfig = savedConfig.map((item: unknown) => {
                      if (item && typeof item === 'object' && 'name' in item && 'type' in item) {
                        const validTypes: RepeatableFieldConfig['type'][] = ['text', 'richtext', 'email', 'phone', 'image', 'pdf', 'video', 'link', 'number', 'boolean', 'geopoint', 'repeatable'];
                        const itemType = String((item as { type: unknown }).type || 'text');
                        const configItem = item as { name: unknown; type: unknown; required?: boolean; repeatableFields?: unknown };
                        
                        // Recursively load nested repeatable fields if type is repeatable
                        let nestedRepeatableFields: RepeatableFieldConfig[] | undefined = undefined;
                        if (itemType === 'repeatable' && configItem.repeatableFields && Array.isArray(configItem.repeatableFields)) {
                          nestedRepeatableFields = (configItem.repeatableFields as unknown[]).map((nestedItem: unknown) => {
                            if (nestedItem && typeof nestedItem === 'object' && 'name' in nestedItem && 'type' in nestedItem) {
                              const nestedItemType = String((nestedItem as { type: unknown }).type || 'text');
                              return {
                                name: String((nestedItem as { name: unknown }).name || ''),
                                type: (validTypes.includes(nestedItemType as RepeatableFieldConfig['type']) ? nestedItemType : 'text') as RepeatableFieldConfig['type'],
                                required: Boolean((nestedItem as { required?: boolean }).required || false),
                              };
                            }
                            return { name: '', type: 'text' as RepeatableFieldConfig['type'], required: false };
                          }).filter((rf) => rf.name && rf.name.trim().length > 0);
                        }
                        
                        return {
                          name: String(configItem.name || ''),
                          type: (validTypes.includes(itemType as RepeatableFieldConfig['type']) ? itemType : 'text') as RepeatableFieldConfig['type'],
                          required: Boolean(configItem.required || false),
                          repeatableFields: nestedRepeatableFields,
                        };
                      }
                      return { name: '', type: 'text' as RepeatableFieldConfig['type'], required: false };
                    }).filter((rf) => rf.name && rf.name.trim().length > 0);
                  } else if (Array.isArray(value) && value.length > 0) {
                    // If no config exists, infer the structure from the first item in the array
                    const firstItem = value[0];
                    if (firstItem && typeof firstItem === 'object') {
                      repeatableFieldsConfig = Object.keys(firstItem).map((itemKey) => {
                        const itemValue = firstItem[itemKey];
                        let fieldType: RepeatableFieldConfig['type'] = 'text';
                        
                        // Infer type from value
                        let nestedRepeatableFields: RepeatableFieldConfig[] | undefined = undefined;
                        if (Array.isArray(itemValue)) {
                          // Check for nested repeatable groups
                          fieldType = 'repeatable';
                          // Infer nested repeatable fields configuration from first nested item
                          if (itemValue.length > 0 && typeof itemValue[0] === 'object' && itemValue[0] !== null) {
                            const firstNestedItem = itemValue[0];
                            nestedRepeatableFields = Object.keys(firstNestedItem).map((nestedItemKey) => {
                              const nestedItemValue = firstNestedItem[nestedItemKey];
                              let nestedFieldType: RepeatableFieldConfig['type'] = 'text';
                              
                              if (Array.isArray(nestedItemValue)) {
                                nestedFieldType = 'repeatable';
                              } else if (typeof nestedItemValue === 'boolean') {
                                nestedFieldType = 'boolean';
                              } else if (typeof nestedItemValue === 'number') {
                                nestedFieldType = 'number';
                              } else if (typeof nestedItemValue === 'object' && nestedItemValue !== null && 'url' in nestedItemValue) {
                                // Distinguish between image objects {url, alt} and link objects {url, text}
                                if ('alt' in nestedItemValue) {
                                  nestedFieldType = 'image';
                                } else {
                                  nestedFieldType = 'link';
                                }
                              } else if (typeof nestedItemValue === 'string') {
                                if (nestedItemValue.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
                                  nestedFieldType = 'image';
                                } else if (nestedItemValue.match(/\.(pdf)$/i)) {
                                  nestedFieldType = 'pdf';
                                } else if (nestedItemValue.match(/\.(mp4|webm|ogg)$/i)) {
                                  nestedFieldType = 'video';
                                } else if (nestedItemValue.match(/<\/?[a-z][\s\S]*>/i)) {
                                  nestedFieldType = 'richtext';
                                } else if (nestedItemValue.match(/^(https?:\/\/|\/)/i) || nestedItemValue.match(/^[a-z0-9][a-z0-9-]*(\.[a-z0-9][a-z0-9-]*)+(\/.*)?$/i)) {
                                  nestedFieldType = 'link';
                                } else if (nestedItemValue.match(/^-?\d+(\.\d+)?$/) && nestedItemValue.trim() !== '') {
                                  nestedFieldType = 'number';
                                }
                              }
                              
                              return {
                                name: nestedItemKey,
                                type: nestedFieldType,
                                required: false,
                              };
                            });
                          }
                        } else if (typeof itemValue === 'boolean') {
                          fieldType = 'boolean';
                        } else if (typeof itemValue === 'number') {
                          fieldType = 'number';
                        } else if (typeof itemValue === 'object' && itemValue !== null && 'url' in itemValue) {
                          // Check for link objects (stored as {url: "...", text: "..."})
                          fieldType = 'link';
                        } else if (typeof itemValue === 'string') {
                          // Check for specific file types first (these can be URLs too)
                          if (itemValue.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
                            fieldType = 'image';
                          } else if (itemValue.match(/\.(pdf)$/i)) {
                            fieldType = 'pdf';
                          } else if (itemValue.match(/\.(mp4|webm|ogg)$/i)) {
                            fieldType = 'video';
                          }
                          // Check if it contains HTML tags (richtext) - more specific check
                          else if (itemValue.match(/<\/?[a-z][\s\S]*>/i)) {
                            fieldType = 'richtext';
                          }
                          // Check if it's a URL/link (http, https, or relative path starting with /)
                          else if (itemValue.match(/^(https?:\/\/|\/)/i) || itemValue.match(/^[a-z0-9][a-z0-9-]*(\.[a-z0-9][a-z0-9-]*)+(\/.*)?$/i)) {
                            fieldType = 'link';
                          }
                          // Check if it's a number stored as string (e.g., "123", "45.67")
                          else if (itemValue.match(/^-?\d+(\.\d+)?$/) && itemValue.trim() !== '') {
                            fieldType = 'number';
                          }
                          // Long text or text with newlines defaults to 'text' (textarea removed)
                          // Default to text for short strings without special patterns
                          else {
                            fieldType = 'text';
                          }
                        }
                        
                        return {
                          name: itemKey,
                          type: fieldType,
                          required: false,
                          repeatableFields: nestedRepeatableFields,
                        };
                      });
                    }
                  }
                }
                
                fieldDefinitions.push({
                  name: key,
                  type: fieldType,
                  required: false,
                  repeatableFields: repeatableFieldsConfig,
                });
              });
            }
            
            // Convert content from field names to index-based keys
            // Database stores with formatted field names, but UI uses index-based keys
            const indexBasedContent: Record<string, unknown> = {};
            fieldDefinitions.forEach((fieldDef, fieldIndex) => {
              const fieldName = fieldDef.name?.trim();
              if (fieldName) {
                // Try to find the value by multiple possible keys:
                // 1. Original field name (as it appears in DB)
                // 2. Formatted name (lowercase with underscores)
                // 3. Case-insensitive match
                const formattedName = formatFieldNameForDatabase(fieldName);
                let value: unknown = undefined;
                
                // First try original name (most likely to match)
                if (content[fieldName] !== undefined) {
                  value = content[fieldName];
                }
                // Then try formatted name
                else if (content[formattedName] !== undefined) {
                  value = content[formattedName];
                }
                // Finally, try case-insensitive match
                else {
                  const matchingKey = Object.keys(content).find(
                    k => k.toLowerCase() === fieldName.toLowerCase() || 
                         k.toLowerCase() === formattedName.toLowerCase()
                  );
                  if (matchingKey) {
                    value = content[matchingKey];
                  }
                }
                
                // Default to empty value if not found
                if (value === undefined) {
                  value = fieldDef.type === 'repeatable' ? [] : '';
                }
                
                // For repeatable fields, ensure value is an array
                if (fieldDef.type === 'repeatable' && !Array.isArray(value)) {
                  value = [];
                }
                
                // Store using index-based key
                const indexKey = `_idx_${fieldIndex}`;
                indexBasedContent[indexKey] = value;
              }
            });
            
            return {
              id: section.id || `section-${index}`,
              component_type: section.component_type || 'custom',
              title: section.title || '',
              content: indexBasedContent,
              fieldDefinitions: fieldDefinitions,
              order_index: section.order_index ?? index,
              is_visible: section.is_visible !== undefined ? section.is_visible : true,
            };
          });

          setPage({
            id: updatedPageData.id,
            website_id: updatedPageData.website_id || '',
            slug: updatedPageData.slug || '',
            title: updatedPageData.title || '',
            is_published: updatedPageData.is_published || false,
            meta_title: updatedPageData.meta_title || '',
            meta_description: updatedPageData.meta_description || '',
            order_index: updatedPageData.order_index || 0,
            sections: processedSections,
          });
          // Update original sections and database content after save to reflect current state
          setOriginalDatabaseContent(originalDbContentAfterSave);
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setValidationError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setSaving(false);
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
          <Link href="/admin/pages">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">
            {isNew ? 'Create New Page' : 'Edit Page'}
          </h1>
        </div>
      </div>

      {validationError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start justify-between">
          <div className="flex items-start gap-2 flex-1">
            <svg className="w-5 h-5 text-red-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <span className="text-red-800 font-medium block mb-1">Validation Error</span>
              <pre className="text-red-700 text-sm whitespace-pre-wrap font-sans">{validationError}</pre>
            </div>
          </div>
          <button
            onClick={() => setValidationError(null)}
            className="text-red-600 shrink-0 ml-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {!isNew && params.id && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
                  Page ID
                </label>
                <div className="bg-white border border-slate-300 rounded px-3 py-2 font-mono text-sm text-slate-900 break-all">
                  {params.id}
                </div>
              </div>
              {page.website_id && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
                    Website ID
                  </label>
                  <div className="bg-white border border-slate-300 rounded px-3 py-2 font-mono text-sm text-slate-900 break-all">
                    {page.website_id}
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
                API Route
              </label>
              <div className="bg-white border border-slate-300 rounded px-3 py-2">
                <code className="text-xs text-slate-700 font-mono break-all">
                  GET /api/pages/{params.id}
                </code>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">
                    Page Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={page.title}
                    onChange={(e) => setPage({ ...page, title: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all"
                    placeholder="Enter page title"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="slug" className="block text-sm font-semibold text-slate-700 mb-2">
                    URL Slug *
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-base">/</span>
                    <input
                      id="slug"
                      type="text"
                      value={page.slug}
                      onChange={(e) => setPage({ ...page, slug: e.target.value })}
                      className="flex-1 px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all"
                      placeholder="page-slug"
                      required
                    />
                  </div>
                  <p className="text-sm text-slate-500 mt-1.5">
                    Full URL: /{page.slug || 'page-slug'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 tracking-tight mb-1.5">Sections</h3>
              <p className="text-sm text-slate-600">
                Add multiple sections to this page. Each section can be edited in detail.
              </p>
            </div>

            {page.sections && page.sections.length > 0 ? (
              <div className="space-y-3">
                {page.sections.map((section, index) => {
                  if (!section.id) {
                    section.id = `section-${Date.now()}-${index}`;
                  }
                  const sectionId = section.id;
                  const isExpanded = expandedSections.has(sectionId);
                  const currentContent = section.content || {};
                  const fieldDefinitions = section.fieldDefinitions || [];
                  const isSectionDragging = draggedSectionId === sectionId;
                  
                  return (
                    <div
                      key={sectionId}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (draggedSectionId && draggedSectionId !== sectionId) {
                          e.currentTarget.classList.add('border-blue-300', 'bg-blue-100/80');
                        }
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove('border-blue-300', 'bg-blue-100/80');
                      }}
                      onDrop={(e) => {
                        handleSectionDrop(e, sectionId);
                        e.currentTarget.classList.remove('border-blue-300', 'bg-blue-100/80');
                      }}
                      className={`border border-blue-300/60 rounded-lg bg-blue-50 transition ${
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
                                  handleSectionDragStart(e, sectionId);
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
                                onClick={() => toggleSectionExpanded(sectionId)}
                                className="text-slate-400"
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
                              <span className="px-2 py-0.5 bg-blue-200 text-blue-800 rounded text-xs font-medium">
                                {section.component_type || 'custom'}
                              </span>
                            </div>
                            
                            {!isNew && params.id && section.id && (
                              <div className="ml-8 mt-2 mb-3 p-2 bg-blue-50 border border-blue-300 rounded text-xs">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  <div>
                                    <span className="text-slate-500 font-medium">Section ID:</span>
                                    <code className="ml-2 font-mono text-slate-700 break-all">
                                      {section.id}
                                    </code>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 font-medium">API Route:</span>
                                    <code className="ml-2 font-mono text-slate-700 break-all">
                                      /api/pages/{params.id}/sections/{section.id}
                                    </code>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 ml-8">
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                  Section Name
                                </label>
                                <input
                                  type="text"
                                  value={section.title || ''}
                                  onChange={(e) => {
                                    const updatedSections = [...page.sections];
                                    updatedSections[index] = { ...section, title: e.target.value };
                                    setPage({ ...page, sections: updatedSections });
                                  }}
                                  className="w-full px-3 py-2 text-sm border border-blue-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                                  placeholder="Section title"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                  Component Type
                                </label>
                                <select
                                  value={section.component_type || 'custom'}
                                  onChange={(e) => {
                                    const updatedSections = [...page.sections];
                                    updatedSections[index] = { ...section, component_type: e.target.value };
                                    setPage({ ...page, sections: updatedSections });
                                  }}
                                  className="w-full px-3 py-2 text-sm border border-blue-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                                >
                                  <option value="custom">Custom</option>
                                  <option value="hero">Hero</option>
                                  <option value="content">Content</option>
                                  <option value="features">Features</option>
                                  <option value="cta">Call to Action</option>
                                  <option value="testimonials">Testimonials</option>
                                </select>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                  Order Index
                                </label>
                                <input
                                  type="number"
                                  value={section.order_index ?? index}
                                  onChange={(e) => {
                                    const updatedSections = [...page.sections];
                                    updatedSections[index] = { 
                                      ...section, 
                                      order_index: parseInt(e.target.value) || 0 
                                    };
                                    setPage({ ...page, sections: updatedSections });
                                  }}
                                  className="w-full px-3 py-2 text-sm border border-blue-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              type="button"
                              onClick={() => {
                                const updatedSections = page.sections.filter((_, i) => i !== index);
                                setPage({ ...page, sections: updatedSections });
                              }}
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
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
                          </div>
                          
                          {fieldDefinitions.length > 0 ? (
                            <div className="space-y-3">
                              {fieldDefinitions.map((fieldDef, fieldIndex) => {
                                const fieldUploadKey = `${index}-${fieldDef.name}`;
                                const isUploading = uploadingFields[fieldUploadKey] === 'uploading';
                                // Use index-based key to get value (prevents conflicts with duplicate names)
                                const indexKey = `_idx_${fieldIndex}`;
                                const fieldValue = currentContent[indexKey];
                                // Use stable key based on section and field index, not the name
                                const stableKey = `section-${index}-field-${fieldIndex}`;
                                
                                const fieldDragId = `section-${index}-field-${fieldIndex}`;
                                const isFieldDragging = draggedFieldId === fieldDragId;
                                
                                // Check if this field has a duplicate name
                                const hasDuplicateName = isFieldDuplicate(index, fieldIndex);
                                
                                return (
                                  <div
                                    key={stableKey}
                                    data-field-drag
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (draggedFieldId && draggedFieldId !== fieldDragId) {
                                        e.currentTarget.classList.add('border-teal-300', 'bg-teal-100/80');
                                      }
                                    }}
                                    onDragLeave={(e) => {
                                      e.currentTarget.classList.remove('border-teal-300', 'bg-teal-100/80');
                                    }}
                                    onDrop={(e) => {
                                      handleFieldDrop(e, index, fieldIndex);
                                      e.currentTarget.classList.remove('border-teal-300', 'bg-teal-100/80');
                                    }}
                                    className={`border border-teal-300/60 rounded-lg p-3 bg-teal-50 transition ${
                                      isFieldDragging ? 'opacity-50' : ''
                                    }`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <div
                                        draggable
                                        onDragStart={(e) => {
                                          handleFieldDragStart(e, index, fieldIndex);
                                          e.stopPropagation();
                                        }}
                                        onDragEnd={handleFieldDragEnd}
                                        className="cursor-grab active:cursor-grabbing shrink-0 mt-1"
                                      >
                                        <GripVertical 
                                          className="w-4 h-4 text-slate-400" 
                                          onMouseDown={(e) => e.stopPropagation()}
                                        />
                                      </div>
                                      <div className="flex-1 space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                          <div>
                                            <div className="flex items-center gap-1.5 mb-1">
                                              <label className="block text-xs font-medium text-slate-600">
                                                Field Name
                                              </label>
                                            </div>
                                            <div className="w-full">
                                            {(() => {
                                              // Check if this field existed in the original database content
                                              const originalContent = originalDatabaseContent[index] || {};
                                              const formattedFieldName = formatFieldNameForDatabase(fieldDef.name);
                                              const isOldField = !isNew && (formattedFieldName in originalContent || fieldDef.name in originalContent);
                                              
                                              return (
                                                <input
                                                  type="text"
                                                  value={fieldDef.name}
                                                  onChange={(e) => {
                                                    if (!isOldField) {
                                                      e.stopPropagation();
                                                      const newName = e.target.value;
                                                      // Mark this field as actively being edited
                                                      setActiveEditingField({ sectionIndex: index, fieldIndex });
                                                      // Allow any input, including empty
                                                      // The updateFieldDefinition function will check for duplicates and show warnings
                                                      // Use fieldIndex instead of fieldDef.name to uniquely identify the field
                                                      updateFieldDefinition(index, fieldIndex, { name: newName });
                                                    }
                                                  }}
                                                  onFocus={(e) => {
                                                    if (!isOldField) {
                                                      e.stopPropagation();
                                                      // Mark this field as actively being edited when focused
                                                      setActiveEditingField({ sectionIndex: index, fieldIndex });
                                                    } else {
                                                      e.preventDefault();
                                                      e.target.blur();
                                                    }
                                                  }}
                                                  onBlur={(e) => {
                                                    if (!isOldField) {
                                                      e.stopPropagation();
                                                      // Clear active editing field after a short delay to allow error to persist briefly
                                                      setTimeout(() => {
                                                        setActiveEditingField((prev) => {
                                                          if (prev?.sectionIndex === index && prev?.fieldIndex === fieldIndex) {
                                                            return null;
                                                          }
                                                          return prev;
                                                        });
                                                      }, 200);
                                                    }
                                                  }}
                                                  disabled={isOldField}
                                                  readOnly={isOldField}
                                                  className={`w-full px-3 py-2 text-sm border rounded-lg bg-white transition-all ${
                                                    isOldField
                                                      ? 'border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed' 
                                                      : isFieldDuplicate(index, fieldIndex)
                                                        ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400'
                                                        : 'border-teal-300 focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400'
                                                  }`}
                                                  placeholder={isOldField ? "Field name (locked)" : "Enter field name"}
                                                  autoFocus={false}
                                                />
                                              );
                                            })()}
                                              {isFieldDuplicate(index, fieldIndex) && (
                                                <p className="text-xs text-red-600 mt-1 font-medium">
                                                  ⚠️ This field name already exists in this section. Please update it to a unique name.
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                          <div>
                                            <div className="flex items-center gap-1.5 mb-1">
                                              <label className="block text-xs font-medium text-slate-600">
                                                Field Type
                                              </label>
                                            </div>
                                            <select
                                              value={fieldDef.type}
                                              onChange={(e) => {
                                                const newType = e.target.value as FieldDefinition['type'];
                                                const updates: Partial<FieldDefinition> = {
                                                  type: newType,
                                                };
                                                // Initialize repeatableFields if type is repeatable
                                                if (newType === 'repeatable' && !fieldDef.repeatableFields) {
                                                  updates.repeatableFields = [];
                                                } else if (newType !== 'repeatable') {
                                                  // Clear value when changing type
                                                  updateFieldValue(index, fieldIndex, '');
                                                }
                                                // Use fieldIndex instead of fieldDef.name to uniquely identify the field
                                                updateFieldDefinition(index, fieldIndex, updates);
                                              }}
                                              className="w-full px-3 py-2 text-sm border border-teal-300 bg-white rounded-lg focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
                                            >
                                              {fieldTypes.map((type) => (
                                                <option key={type.value} value={type.value}>
                                                  {type.label}
                                                </option>
                                              ))}
                                            </select>
                                          </div>
                                        </div>
                                        
                                        {/* Field Value Input */}
                                        <div>
                                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Value {fieldDef.required && <span className="text-red-500">*</span>}
                                          </label>
                                          
                                          {fieldDef.type === 'text' && (
                                            <input
                                              type="text"
                                              value={typeof fieldValue === 'string' ? fieldValue : ''}
                                              onChange={(e) => updateFieldValue(index, fieldIndex, e.target.value)}
                                              disabled={hasDuplicateName}
                                              className={`w-full px-2 py-1.5 text-sm border border-teal-300 bg-white rounded-lg focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 ${
                                                hasDuplicateName ? 'bg-slate-100 cursor-not-allowed opacity-60' : ''
                                              }`}
                                              placeholder={hasDuplicateName ? 'Fix duplicate field name first' : ''}
                                            />
                                          )}

                                          {fieldDef.type === 'email' && (
                                            <input
                                              type="email"
                                              value={typeof fieldValue === 'string' ? fieldValue : ''}
                                              onChange={(e) => updateFieldValue(index, fieldIndex, e.target.value)}
                                              disabled={hasDuplicateName}
                                              className={`w-full px-2 py-1.5 text-sm border border-teal-300 bg-white rounded-lg focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 ${
                                                hasDuplicateName ? 'bg-slate-100 cursor-not-allowed opacity-60' : ''
                                              }`}
                                              placeholder={hasDuplicateName ? 'Fix duplicate field name first' : 'name@example.com'}
                                            />
                                          )}

                                          {fieldDef.type === 'phone' && (
                                            <input
                                              type="tel"
                                              value={typeof fieldValue === 'string' ? fieldValue : ''}
                                              onChange={(e) => updateFieldValue(index, fieldIndex, e.target.value)}
                                              disabled={hasDuplicateName}
                                              className={`w-full px-2 py-1.5 text-sm border border-teal-300 bg-white rounded-lg focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 ${
                                                hasDuplicateName ? 'bg-slate-100 cursor-not-allowed opacity-60' : ''
                                              }`}
                                              placeholder={hasDuplicateName ? 'Fix duplicate field name first' : '+1 555 123 4567'}
                                            />
                                          )}
                                          
                                          {fieldDef.type === 'richtext' && (
                                            <div className={`w-full ${hasDuplicateName ? 'opacity-60 pointer-events-none' : ''}`}>
                                              <RichTextEditor
                                                value={typeof fieldValue === 'string' ? fieldValue : ''}
                                                onChange={(value) => updateFieldValue(index, fieldIndex, value)}
                                                placeholder={hasDuplicateName ? 'Fix duplicate field name first' : 'Enter rich text content...'}
                                              />
                                            </div>
                                          )}
                                          
                                          {fieldDef.type === 'link' && (
                                            <div className="space-y-2">
                                            <input
                                              type="text"
                                                value={typeof fieldValue === 'object' && fieldValue !== null && 'url' in fieldValue 
                                                  ? String((fieldValue as { url?: string }).url || '') 
                                                  : typeof fieldValue === 'string' ? fieldValue : ''}
                                                onChange={(e) => {
                                                  const currentValue = fieldValue;
                                                  // If it's already an object, update url; otherwise create new object
                                                  if (typeof currentValue === 'object' && currentValue !== null && 'url' in currentValue) {
                                                    updateFieldValue(index, fieldIndex, { ...(currentValue as { url?: string; text?: string }), url: e.target.value });
                                                  } else {
                                                    // Convert string to object format
                                                    updateFieldValue(index, fieldIndex, { url: e.target.value, text: '' });
                                                  }
                                                }}
                                                disabled={hasDuplicateName}
                                                className={`w-full px-2 py-1.5 text-sm border border-teal-300 bg-white rounded-lg focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 ${
                                                  hasDuplicateName ? 'bg-slate-100 cursor-not-allowed opacity-60' : ''
                                                }`}
                                                placeholder={hasDuplicateName ? 'Fix duplicate field name first' : '/about or https://example.com'}
                                              />
                                              <input
                                                type="text"
                                                value={typeof fieldValue === 'object' && fieldValue !== null && 'text' in fieldValue 
                                                  ? String((fieldValue as { text?: string }).text || '') 
                                                  : ''}
                                                onChange={(e) => {
                                                  const currentValue = fieldValue;
                                                  // If it's already an object, update text; otherwise create new object
                                                  if (typeof currentValue === 'object' && currentValue !== null && 'text' in currentValue) {
                                                    updateFieldValue(index, fieldIndex, { ...(currentValue as { url?: string; text?: string }), text: e.target.value });
                                                  } else {
                                                    // Convert string to object format
                                                    updateFieldValue(index, fieldIndex, { url: typeof currentValue === 'string' ? currentValue : '', text: e.target.value });
                                                  }
                                                }}
                                                disabled={hasDuplicateName}
                                                className={`w-full px-2 py-1.5 text-sm border border-teal-300 bg-white rounded-lg focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 ${
                                                  hasDuplicateName ? 'bg-slate-100 cursor-not-allowed opacity-60' : ''
                                                }`}
                                                placeholder={hasDuplicateName ? 'Fix duplicate field name first' : 'Link text (optional)'}
                                              />
                                            </div>
                                          )}
                                          
                                          {fieldDef.type === 'number' && (
                                            <input
                                              type="number"
                                              value={typeof fieldValue === 'string' || typeof fieldValue === 'number' ? String(fieldValue) : ''}
                                              onChange={(e) => updateFieldValue(index, fieldIndex, e.target.value)}
                                              disabled={hasDuplicateName}
                                              className={`w-full px-2 py-1.5 text-sm border border-teal-300 bg-white rounded-lg focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 ${
                                                hasDuplicateName ? 'bg-slate-100 cursor-not-allowed opacity-60' : ''
                                              }`}
                                              placeholder={hasDuplicateName ? 'Fix duplicate field name first' : ''}
                                            />
                                          )}

                                          {fieldDef.type === 'geopoint' && (
                                            <div className={`grid grid-cols-2 gap-2 ${hasDuplicateName ? 'opacity-60 pointer-events-none' : ''}`}>
                                              {(() => {
                                                const lat =
                                                  fieldValue && typeof fieldValue === 'object' && 'lat' in fieldValue
                                                    ? String((fieldValue as { lat?: number | string }).lat ?? '')
                                                    : '';
                                                const lng =
                                                  fieldValue && typeof fieldValue === 'object' && 'lng' in fieldValue
                                                    ? String((fieldValue as { lng?: number | string }).lng ?? '')
                                                    : '';
                                                return (
                                                  <>
                                                    <div>
                                                      <label className="block text-xs font-medium text-slate-600 mb-1">
                                                        Latitude
                                                      </label>
                                                      <input
                                                        type="number"
                                                        step="any"
                                                        value={lat}
                                                        onChange={(e) => {
                                                          const newLat = e.target.value;
                                                          const current =
                                                            fieldValue && typeof fieldValue === 'object'
                                                              ? (fieldValue as { lat?: string; lng?: string })
                                                              : {};
                                                          updateFieldValue(index, fieldIndex, {
                                                            lat: newLat,
                                                            lng: 'lng' in current ? current.lng : '',
                                                          });
                                                        }}
                                                        disabled={hasDuplicateName}
                                                        className={`w-full px-2 py-1.5 text-sm border border-teal-300 bg-white rounded-lg focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 ${
                                                          hasDuplicateName ? 'bg-slate-100 cursor-not-allowed' : ''
                                                        }`}
                                                        placeholder="e.g. 37.7749"
                                                      />
                                                    </div>
                                                    <div>
                                                      <label className="block text-xs font-medium text-slate-600 mb-1">
                                                        Longitude
                                                      </label>
                                                      <input
                                                        type="number"
                                                        step="any"
                                                        value={lng}
                                                        onChange={(e) => {
                                                          const newLng = e.target.value;
                                                          const current =
                                                            fieldValue && typeof fieldValue === 'object'
                                                              ? (fieldValue as { lat?: string; lng?: string })
                                                              : {};
                                                          updateFieldValue(index, fieldIndex, {
                                                            lat: 'lat' in current ? current.lat : '',
                                                            lng: newLng,
                                                          });
                                                        }}
                                                        disabled={hasDuplicateName}
                                                        className={`w-full px-2 py-1.5 text-sm border border-teal-300 bg-white rounded-lg focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 ${
                                                          hasDuplicateName ? 'bg-slate-100 cursor-not-allowed' : ''
                                                        }`}
                                                        placeholder="e.g. -122.4194"
                                                      />
                                                    </div>
                                                  </>
                                                );
                                              })()}
                                            </div>
                                          )}
                                          
                                          {fieldDef.type === 'boolean' && (
                                            <div className={`flex items-center gap-2 ${hasDuplicateName ? 'opacity-60 pointer-events-none' : ''}`}>
                                              <input
                                                type="checkbox"
                                                checked={typeof fieldValue === 'boolean' ? fieldValue : fieldValue === 'true' || fieldValue === true}
                                                onChange={(e) => updateFieldValue(index, fieldIndex, e.target.checked)}
                                                disabled={hasDuplicateName}
                                                className="w-4 h-4 text-teal-600 border-teal-300 rounded focus:ring-teal-500"
                                              />
                                              <label className="text-sm text-slate-700">
                                                {fieldDef.name || 'Enabled'}
                                              </label>
                                            </div>
                                          )}
                                          
                                          {fieldDef.type === 'image' && (
                                            <div className={`space-y-2 ${hasDuplicateName ? 'opacity-60 pointer-events-none' : ''}`}>
                                              <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                  const file = e.target.files?.[0];
                                                  if (file) {
                                                    const currentValue = fieldValue;
                                                    const currentAlt = typeof currentValue === 'object' && currentValue !== null && 'alt' in currentValue
                                                      ? (currentValue as { alt?: string }).alt || ''
                                                      : '';
                                                    handleFileUpload(index, fieldIndex, file, currentAlt);
                                                  }
                                                }}
                                                className={`w-full px-2 py-1.5 text-sm border border-teal-300 bg-white rounded-lg focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 ${
                                                  hasDuplicateName ? 'bg-slate-100 cursor-not-allowed' : ''
                                                }`}
                                                disabled={isUploading || hasDuplicateName}
                                              />
                                              {(() => {
                                                const imageUrl = typeof fieldValue === 'object' && fieldValue !== null && 'url' in fieldValue
                                                  ? (fieldValue as { url?: string }).url
                                                  : typeof fieldValue === 'string' ? fieldValue : null;
                                                const imageAlt = typeof fieldValue === 'object' && fieldValue !== null && 'alt' in fieldValue
                                                  ? (fieldValue as { alt?: string }).alt || ''
                                                  : '';
                                                return imageUrl ? (
                                                  <>
                                                    <div className="relative w-full h-32 border border-slate-300 rounded-lg overflow-hidden bg-slate-100">
                                                      <Image
                                                        src={imageUrl}
                                                        alt={imageAlt || fieldDef.name}
                                                        fill
                                                        className="object-contain"
                                                        unoptimized
                                                      />
                                                    </div>
                                                    <input
                                                      type="text"
                                                      value={imageAlt}
                                                      onChange={(e) => {
                                                        const currentValue = fieldValue;
                                                        const currentUrl = typeof currentValue === 'object' && currentValue !== null && 'url' in currentValue
                                                          ? (currentValue as { url?: string }).url || ''
                                                          : typeof currentValue === 'string' ? currentValue : '';
                                                        updateFieldValue(index, fieldIndex, { url: currentUrl, alt: e.target.value });
                                                      }}
                                                      disabled={hasDuplicateName}
                                                      className={`w-full px-2 py-1.5 text-sm border border-teal-300 bg-white rounded-lg focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 ${
                                                        hasDuplicateName ? 'bg-slate-100 cursor-not-allowed opacity-60' : ''
                                                      }`}
                                                      placeholder="Alt text (optional)"
                                                    />
                                                  </>
                                                ) : null;
                                              })()}
                                              {isUploading && (
                                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                                  <Loader2 className="w-3 h-3 animate-spin" />
                                                  <span>Uploading...</span>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                          
                                          {fieldDef.type === 'pdf' && (
                                            <div className={`space-y-2 ${hasDuplicateName ? 'opacity-60 pointer-events-none' : ''}`}>
                                              <input
                                                type="file"
                                                accept=".pdf"
                                                onChange={(e) => {
                                                  const file = e.target.files?.[0];
                                                  if (file) handleFileUpload(index, fieldIndex, file);
                                                }}
                                                className={`w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all ${
                                                  hasDuplicateName ? 'bg-slate-100 cursor-not-allowed' : ''
                                                }`}
                                                disabled={isUploading || hasDuplicateName}
                                              />
                                              {typeof fieldValue === 'string' && fieldValue && (
                                                <a
                                                  href={fieldValue}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-xs text-purple-600 hover:underline"
                                                >
                                                  View PDF: {fieldValue.split('/').pop()}
                                                </a>
                                              )}
                                              {isUploading && (
                                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                                  <Loader2 className="w-3 h-3 animate-spin" />
                                                  <span>Uploading...</span>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                          
                                          {fieldDef.type === 'video' && (
                                            <div className={`space-y-2 ${hasDuplicateName ? 'opacity-60 pointer-events-none' : ''}`}>
                                              <input
                                                type="file"
                                                accept="video/*"
                                                onChange={(e) => {
                                                  const file = e.target.files?.[0];
                                                  if (file) handleFileUpload(index, fieldIndex, file);
                                                }}
                                                className={`w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all ${
                                                  hasDuplicateName ? 'bg-slate-100 cursor-not-allowed' : ''
                                                }`}
                                                disabled={isUploading || hasDuplicateName}
                                              />
                                              {typeof fieldValue === 'string' && fieldValue && (
                                                <video
                                                  src={fieldValue}
                                                  controls
                                                  className="w-full max-h-32 rounded-lg"
                                                />
                                              )}
                                              {isUploading && (
                                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                                  <Loader2 className="w-3 h-3 animate-spin" />
                                                  <span>Uploading...</span>
                                                </div>
                                              )}
                                            </div>
                                          )}

                                          {fieldDef.type === 'repeatable' && (
                                            <div className={`space-y-4 ${hasDuplicateName ? 'opacity-60 pointer-events-none' : ''}`}>
                                              {hasDuplicateName && (
                                                <div className="p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                                                  ⚠️ Fix duplicate field name to enable repeatable field configuration
                                                </div>
                                              )}
                                              {/* Configure Repeatable Group Fields */}
                                              <div className="border border-sky-300/60 rounded-lg p-3 bg-sky-50">
                                                <div className="flex items-center justify-between mb-3">
                                                  <label className="block text-xs font-semibold text-sky-800">
                                                    Configure Group Fields
                                                  </label>
                                                  <Button
                                                    type="button"
                                                    onClick={() => {
                                                      const currentFields = fieldDef.repeatableFields || [];
                                                      const newField: RepeatableFieldConfig = {
                                                        name: `field_${currentFields.length + 1}`,
                                                        type: 'text',
                                                        required: false,
                                                      };
                                                      // Use fieldIndex instead of fieldDef.name to uniquely identify the field
                                                      updateFieldDefinition(index, fieldIndex, {
                                                        repeatableFields: [...currentFields, newField],
                                                      });
                                                    }}
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 text-xs border-sky-300 text-sky-700 bg-white"
                                                  >
                                                    <Plus className="w-3 h-3 mr-1" />
                                                    Add Field to Group
                                                  </Button>
                                                </div>
                                                
                                                {fieldDef.repeatableFields && fieldDef.repeatableFields.length > 0 ? (
                                                  <div className="space-y-2">
                                                    {fieldDef.repeatableFields.map((rf, rfIndex) => (
                                                      <div key={rfIndex} className="bg-sky-100 rounded p-2 border border-sky-300/80">
                                                        <div className="grid grid-cols-3 gap-2 mb-2">
                                                          <div>
                                                            {(() => {
                                                              // For nested fields, always allow editing nested field names
                                                              // (since users might add new nested fields to existing repeatable groups)
                                                              const isOldNestedField = false; // Always allow editing nested field names
                                                              
                                                              return (
                                                                <input
                                                                  type="text"
                                                                  value={rf.name}
                                                                  onChange={(e) => {
                                                                    if (!isOldNestedField) {
                                                                      const updated = [...(fieldDef.repeatableFields || [])];
                                                                      updated[rfIndex] = { ...updated[rfIndex], name: e.target.value };
                                                                      // Use fieldIndex instead of fieldDef.name to uniquely identify the field
                                                                      updateFieldDefinition(index, fieldIndex, { repeatableFields: updated });
                                                                    }
                                                                  }}
                                                                  disabled={isOldNestedField}
                                                                  readOnly={isOldNestedField}
                                                                  className={`w-full px-2 py-1 text-xs border rounded ${
                                                                    isOldNestedField
                                                                      ? 'border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed' 
                                                                      : 'border-sky-300 bg-white focus:ring-1 focus:ring-sky-500/30 focus:border-sky-400'
                                                                  }`}
                                                                  placeholder={isOldNestedField ? "Field name (locked)" : "Field name"}
                                                                />
                                                              );
                                                            })()}
                                                          </div>
                                                          <div>
                                                            <select
                                                              value={rf.type}
                                                              onChange={(e) => {
                                                                const updated = [...(fieldDef.repeatableFields || [])];
                                                                const newType = e.target.value as RepeatableFieldConfig['type'];
                                                                // Initialize repeatableFields if type is repeatable
                                                                if (newType === 'repeatable' && !updated[rfIndex].repeatableFields) {
                                                                  updated[rfIndex] = { ...updated[rfIndex], type: newType, repeatableFields: [] };
                                                                } else {
                                                                  updated[rfIndex] = { ...updated[rfIndex], type: newType };
                                                                }
                                                                // Use fieldIndex instead of fieldDef.name to uniquely identify the field
                                                                updateFieldDefinition(index, fieldIndex, { repeatableFields: updated });
                                                              }}
                                                              className="w-full px-2 py-1 text-xs border border-sky-300 bg-white rounded focus:ring-1 focus:ring-sky-500/30 focus:border-sky-400"
                                                            >
                                                              <option value="text">Text</option>
                                                              <option value="richtext">Rich Text</option>
                                                              <option value="email">Email</option>
                                                              <option value="phone">Phone</option>
                                                              <option value="number">Number</option>
                                                              <option value="boolean">Boolean</option>
                                                              <option value="geopoint">Geo Point</option>
                                                              <option value="link">Link</option>
                                                              <option value="image">Image</option>
                                                              <option value="pdf">PDF</option>
                                                              <option value="video">Video</option>
                                                              <option value="repeatable">Repeatable Group</option>
                                                            </select>
                                                          </div>
                                                          <div className="flex items-center gap-2">
                                                            <label className="flex items-center gap-1 text-xs text-slate-600">
                                                              <input
                                                                type="checkbox"
                                                                checked={rf.required || false}
                                                                onChange={(e) => {
                                                                  const updated = [...(fieldDef.repeatableFields || [])];
                                                                  updated[rfIndex] = { ...updated[rfIndex], required: e.target.checked };
                                                                  // Use fieldIndex instead of fieldDef.name to uniquely identify the field
                                                                updateFieldDefinition(index, fieldIndex, { repeatableFields: updated });
                                                                }}
                                                                className="w-3 h-3"
                                                              />
                                                              Required
                                                            </label>
                                                            <Button
                                                              type="button"
                                                              onClick={() => {
                                                                const updated = (fieldDef.repeatableFields || []).filter((_, i) => i !== rfIndex);
                                                                // Use fieldIndex instead of fieldDef.name to uniquely identify the field
                                                                updateFieldDefinition(index, fieldIndex, { repeatableFields: updated });
                                                              }}
                                                              variant="ghost"
                                                              size="sm"
                                                              className="h-6 w-6 p-0 text-red-600"
                                                            >
                                                              <Trash2 className="w-3 h-3" />
                                                            </Button>
                                                          </div>
                                                        </div>
                                                        
                                                        {/* Nested Repeatable Fields Configuration */}
                                                        {rf.type === 'repeatable' && (
                                                        <div className="ml-4 mt-2 p-3 bg-purple-50 border border-purple-300/60 rounded-lg">
                                                          <div className="flex items-center justify-between mb-2">
                                                            <label className="text-xs font-semibold text-purple-800">
                                                              Nested Group Fields
                                                            </label>
                                                            <Button
                                                              type="button"
                                                              onClick={() => {
                                                                const updated = [...(fieldDef.repeatableFields || [])];
                                                                const currentFields = updated[rfIndex].repeatableFields || [];
                                                                const newField: RepeatableFieldConfig = {
                                                                  name: '',
                                                                  type: 'text',
                                                                  required: false,
                                                                };
                                                                updated[rfIndex] = { ...updated[rfIndex], repeatableFields: [...currentFields, newField] };
                                                                updateFieldDefinition(index, fieldIndex, { repeatableFields: updated });
                                                              }}
                                                              variant="outline"
                                                              size="sm"
                                                              className="h-6 text-xs border-purple-300 text-purple-700 bg-white"
                                                            >
                                                              <Plus className="w-3 h-3 mr-1" />
                                                              Add Field
                                                            </Button>
                                                          </div>
                                                          {rf.repeatableFields && rf.repeatableFields.length > 0 ? (
                                                            <div className="space-y-2">
                                                              {rf.repeatableFields.map((nestedRf, nestedRfIndex) => (
                                                                <div key={nestedRfIndex} className="flex items-center gap-2 p-2 bg-purple-100 border border-purple-300/80 rounded">
                                                                  <input
                                                                    type="text"
                                                                    value={nestedRf.name}
                                                                    onChange={(e) => {
                                                                      // Always allow editing nested field names (level 2)
                                                                      // Users can add new nested fields to existing repeatable groups
                                                                      const updated = [...(fieldDef.repeatableFields || [])];
                                                                      const nestedFields = [...(updated[rfIndex].repeatableFields || [])];
                                                                      nestedFields[nestedRfIndex] = { ...nestedFields[nestedRfIndex], name: e.target.value };
                                                                      updated[rfIndex] = { ...updated[rfIndex], repeatableFields: nestedFields };
                                                                      updateFieldDefinition(index, fieldIndex, { repeatableFields: updated });
                                                                    }}
                                                                    className="flex-1 px-2 py-1 text-xs border border-purple-300 bg-white rounded focus:ring-1 focus:ring-purple-500/30 focus:border-purple-400"
                                                                    placeholder="Field name"
                                                                  />
                                                                  <select
                                                                    value={nestedRf.type}
                                                                    onChange={(e) => {
                                                                      const updated = [...(fieldDef.repeatableFields || [])];
                                                                      const nestedFields = [...(updated[rfIndex].repeatableFields || [])];
                                                                      nestedFields[nestedRfIndex] = { ...nestedFields[nestedRfIndex], type: e.target.value as RepeatableFieldConfig['type'] };
                                                                      updated[rfIndex] = { ...updated[rfIndex], repeatableFields: nestedFields };
                                                                      updateFieldDefinition(index, fieldIndex, { repeatableFields: updated });
                                                                    }}
                                                                    className="w-32 px-2 py-1 text-xs border border-purple-300 bg-white rounded focus:ring-1 focus:ring-purple-500/30 focus:border-purple-400"
                                                                  >
                                                                    <option value="text">Text</option>
                                                                    <option value="richtext">Rich Text</option>
                                                                    <option value="email">Email</option>
                                                                    <option value="phone">Phone</option>
                                                                    <option value="number">Number</option>
                                                                    <option value="boolean">Boolean</option>
                                                                    <option value="geopoint">Geo Point</option>
                                                                    <option value="link">Link</option>
                                                                    <option value="image">Image</option>
                                                                    <option value="pdf">PDF</option>
                                                                    <option value="video">Video</option>
                                                                  </select>
                                                                  <Button
                                                                    type="button"
                                                                    onClick={() => {
                                                                      const updated = [...(fieldDef.repeatableFields || [])];
                                                                      const nestedFields = (updated[rfIndex].repeatableFields || []).filter((_, i) => i !== nestedRfIndex);
                                                                      updated[rfIndex] = { ...updated[rfIndex], repeatableFields: nestedFields };
                                                                      updateFieldDefinition(index, fieldIndex, { repeatableFields: updated });
                                                                    }}
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-6 w-6 p-0 text-red-600"
                                                                  >
                                                                    <Trash2 className="w-3 h-3" />
                                                                  </Button>
                                                                </div>
                                                              ))}
                                                            </div>
                                                          ) : (
                                                            <p className="text-xs text-slate-500 text-center py-2">
                                                              No nested fields configured. Add fields to define the structure.
                                                            </p>
                                                          )}
                                                        </div>
                                                      )}
                                                      </div>
                                                    ))}
                                                  </div>
                                                ) : (
                                                  <p className="text-xs text-slate-500 text-center py-2">
                                                    No fields configured. Add fields to define the structure of each repeatable item.
                                                  </p>
                                                )}
                                              </div>

                                              {/* Repeatable Items */}
                                              <div className="flex items-center justify-between">
                                                <label className="block text-xs font-medium text-slate-600">
                                                  Items
                                                </label>
                                                <Button
                                                  type="button"
                                                  onClick={() => {
                                                    const currentValue = Array.isArray(fieldValue) ? fieldValue : [];
                                                    const configuredFields = fieldDef.repeatableFields || [];
                                                    const newItem: RepeatableItem = {};
                                                    // Initialize values for configured fields
                                                    configuredFields.forEach((rf) => {
                                                      newItem[rf.name] = '';
                                                    });
                                                    updateFieldValue(index, fieldIndex, [...currentValue, newItem]);
                                                  }}
                                                  variant="outline"
                                                  size="sm"
                                                  className="h-7 text-xs"
                                                  disabled={!fieldDef.repeatableFields || fieldDef.repeatableFields.length === 0}
                                                >
                                                  <Plus className="w-3 h-3 mr-1" />
                                                  Add Item
                                                </Button>
                                              </div>

                                              {Array.isArray(fieldValue) && fieldValue.length > 0 ? (
                                                <div className="space-y-3">
                                                  {(fieldValue as RepeatableItem[]).map((item, itemIndex) => {
                                                    const configuredFields = fieldDef.repeatableFields || [];
                                                    
                                                    return (
                                                      <div key={itemIndex} className="border border-sky-200 rounded-lg p-3 bg-sky-50/50">
                                                        <div className="flex items-center justify-between mb-3">
                                                          <span className="text-xs font-medium text-sky-800">
                                                            Item {itemIndex + 1}
                                                          </span>
                                                          <Button
                                                            type="button"
                                                            onClick={() => {
                                                              const currentValue = fieldValue as RepeatableItem[];
                                                              updateFieldValue(index, fieldIndex, currentValue.filter((_, i) => i !== itemIndex));
                                                            }}
                                                            variant="ghost"
                                                            size="sm"
                                                                    className="h-6 w-6 p-0 text-red-600"
                                                          >
                                                            <Trash2 className="w-3 h-3" />
                                                          </Button>
                                                        </div>
                                                        <div className="space-y-3">
                                                          {configuredFields.length > 0 ? (
                                                            configuredFields.map((rf) => {
                                                              const itemFieldValue = (item[rf.name] as string) || '';
                                                              const uploadKey = `${index}-${fieldDef.name}-${itemIndex}-${rf.name}`;
                                                              const isUploading = uploadingFields[uploadKey] === 'uploading';
                                                              
                                                              return (
                                                                <div key={rf.name}>
                                                                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                                    {rf.name || 'Unnamed Field'} {rf.required && <span className="text-red-500">*</span>}
                                                                  </label>
                                                                  
                                                                  {rf.type === 'text' && (
                                                                    <input
                                                                      type="text"
                                                                      value={typeof itemFieldValue === 'string' ? itemFieldValue : ''}
                                                                      onChange={(e) => {
                                                                        const currentValue = fieldValue as RepeatableItem[];
                                                                        const updated = [...currentValue];
                                                                        updated[itemIndex] = { ...updated[itemIndex], [rf.name]: e.target.value };
                                                                        updateFieldValue(index, fieldIndex, updated);
                                                                      }}
                                                                      className="w-full px-2 py-1.5 text-sm border border-sky-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-400"
                                                                      required={rf.required}
                                                                    />
                                                                  )}

                                                                  {rf.type === 'email' && (
                                                                    <input
                                                                      type="email"
                                                                      value={typeof itemFieldValue === 'string' ? itemFieldValue : ''}
                                                                      onChange={(e) => {
                                                                        const currentValue = fieldValue as RepeatableItem[];
                                                                        const updated = [...currentValue];
                                                                        updated[itemIndex] = { ...updated[itemIndex], [rf.name]: e.target.value };
                                                                        updateFieldValue(index, fieldIndex, updated);
                                                                      }}
                                                                      className="w-full px-2 py-1.5 text-sm border border-sky-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-400"
                                                                      required={rf.required}
                                                                      placeholder="name@example.com"
                                                                    />
                                                                  )}

                                                                  {rf.type === 'phone' && (
                                                                    <input
                                                                      type="tel"
                                                                      value={typeof itemFieldValue === 'string' ? itemFieldValue : ''}
                                                                      onChange={(e) => {
                                                                        const currentValue = fieldValue as RepeatableItem[];
                                                                        const updated = [...currentValue];
                                                                        updated[itemIndex] = { ...updated[itemIndex], [rf.name]: e.target.value };
                                                                        updateFieldValue(index, fieldIndex, updated);
                                                                      }}
                                                                      className="w-full px-2 py-1.5 text-sm border border-sky-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-400"
                                                                      required={rf.required}
                                                                      placeholder="+1 555 123 4567"
                                                                    />
                                                                  )}
                                                                  
                                                                  {rf.type === 'richtext' && (
                                                                    <RichTextEditor
                                                                      value={typeof itemFieldValue === 'string' ? itemFieldValue : ''}
                                                                      onChange={(value) => {
                                                                        const currentValue = fieldValue as RepeatableItem[];
                                                                        const updated = [...currentValue];
                                                                        updated[itemIndex] = { ...updated[itemIndex], [rf.name]: value };
                                                                        updateFieldValue(index, fieldIndex, updated);
                                                                      }}
                                                                      placeholder={`Enter ${rf.name || 'content'}...`}
                                                                    />
                                                                  )}
                                                                  
                                                                  {rf.type === 'number' && (
                                                                    <input
                                                                      type="number"
                                                                      value={typeof itemFieldValue === 'string' || typeof itemFieldValue === 'number' ? String(itemFieldValue) : ''}
                                                                      onChange={(e) => {
                                                                        const currentValue = fieldValue as RepeatableItem[];
                                                                        const updated = [...currentValue];
                                                                        updated[itemIndex] = { ...updated[itemIndex], [rf.name]: e.target.value };
                                                                        updateFieldValue(index, fieldIndex, updated);
                                                                      }}
                                                                      className="w-full px-2 py-1.5 text-sm border border-sky-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-400"
                                                                      required={rf.required}
                                                                    />
                                                                  )}
                                                                  
                                                                  {rf.type === 'geopoint' && (
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                      {(() => {
                                                                        const lat =
                                                                          itemFieldValue && typeof itemFieldValue === 'object' && 'lat' in itemFieldValue
                                                                            ? String((itemFieldValue as { lat?: number | string }).lat ?? '')
                                                                            : '';
                                                                        const lng =
                                                                          itemFieldValue && typeof itemFieldValue === 'object' && 'lng' in itemFieldValue
                                                                            ? String((itemFieldValue as { lng?: number | string }).lng ?? '')
                                                                            : '';
                                                                        return (
                                                                          <>
                                                                            <div>
                                                                              <label className="block text-xs font-medium text-slate-600 mb-1">
                                                                                Latitude
                                                                              </label>
                                                                              <input
                                                                                type="number"
                                                                                step="any"
                                                                                value={lat}
                                                                                onChange={(e) => {
                                                                                  const newLat = e.target.value;
                                                                                  const currentValue = fieldValue as RepeatableItem[];
                                                                                  const updated = [...currentValue];
                                                                                  const currentItemValue = updated[itemIndex][rf.name];
                                                                                  const currentLng =
                                                                                    currentItemValue &&
                                                                                    typeof currentItemValue === 'object' &&
                                                                                    'lng' in currentItemValue
                                                                                      ? (currentItemValue as { lng?: string }).lng || ''
                                                                                      : '';
                                                                                  updated[itemIndex] = { ...updated[itemIndex], [rf.name]: { lat: newLat, lng: currentLng } };
                                                                                  updateFieldValue(index, fieldIndex, updated);
                                                                                }}
                                                                                className="w-full px-2 py-1.5 text-sm border border-sky-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-400"
                                                                                placeholder="Lat"
                                                                                required={rf.required}
                                                                              />
                                                                            </div>
                                                                            <div>
                                                                              <label className="block text-xs font-medium text-slate-600 mb-1">
                                                                                Longitude
                                                                              </label>
                                                                              <input
                                                                                type="number"
                                                                                step="any"
                                                                                value={lng}
                                                                                onChange={(e) => {
                                                                                  const newLng = e.target.value;
                                                                                  const currentValue = fieldValue as RepeatableItem[];
                                                                                  const updated = [...currentValue];
                                                                                  const currentItemValue = updated[itemIndex][rf.name];
                                                                                  const currentLat =
                                                                                    currentItemValue &&
                                                                                    typeof currentItemValue === 'object' &&
                                                                                    'lat' in currentItemValue
                                                                                      ? (currentItemValue as { lat?: string }).lat || ''
                                                                                      : '';
                                                                                  updated[itemIndex] = { ...updated[itemIndex], [rf.name]: { lat: currentLat, lng: newLng } };
                                                                                  updateFieldValue(index, fieldIndex, updated);
                                                                                }}
                                                                                className="w-full px-2 py-1.5 text-sm border border-sky-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-400"
                                                                                placeholder="Lng"
                                                                                required={rf.required}
                                                                              />
                                                                            </div>
                                                                          </>
                                                                        );
                                                                      })()}
                                                                    </div>
                                                                  )}
                                                                  
                                                                  {rf.type === 'boolean' && (
                                                                    <div className="flex items-center gap-2">
                                                                      <input
                                                                        type="checkbox"
                                                                        checked={(() => {
                                                                          if (typeof itemFieldValue === 'boolean') return itemFieldValue;
                                                                          if (typeof itemFieldValue === 'string') return itemFieldValue === 'true';
                                                                          return false;
                                                                        })()}
                                                                        onChange={(e) => {
                                                                          const currentValue = fieldValue as RepeatableItem[];
                                                                          const updated = [...currentValue];
                                                                          updated[itemIndex] = { ...updated[itemIndex], [rf.name]: e.target.checked };
                                                                          updateFieldValue(index, fieldIndex, updated);
                                                                        }}
                                                                        className="w-4 h-4 text-sky-600 border-sky-300 rounded focus:ring-sky-500"
                                                                      />
                                                                      <label className="text-sm text-slate-700">
                                                                        {rf.name || 'Enabled'}
                                                                      </label>
                                                                    </div>
                                                                  )}
                                                                  
                                                                  {rf.type === 'link' && (
                                                                    <div className="space-y-2">
                                                                    <input
                                                                      type="text"
                                                                        value={typeof itemFieldValue === 'object' && itemFieldValue !== null && 'url' in itemFieldValue 
                                                                          ? String((itemFieldValue as { url?: string }).url || '') 
                                                                          : typeof itemFieldValue === 'string' ? itemFieldValue : ''}
                                                                      onChange={(e) => {
                                                                        const currentValue = fieldValue as RepeatableItem[];
                                                                        const updated = [...currentValue];
                                                                          const currentItemValue = updated[itemIndex][rf.name];
                                                                          // If it's already an object, update url; otherwise create new object
                                                                          if (typeof currentItemValue === 'object' && currentItemValue !== null && 'url' in currentItemValue) {
                                                                            updated[itemIndex] = { ...updated[itemIndex], [rf.name]: { ...(currentItemValue as { url?: string; text?: string }), url: e.target.value } };
                                                                          } else {
                                                                            // Convert string to object format
                                                                            updated[itemIndex] = { ...updated[itemIndex], [rf.name]: { url: e.target.value, text: '' } };
                                                                          }
                                                                          updateFieldValue(index, fieldIndex, updated);
                                                                      }}
                                                                      className="w-full px-2 py-1.5 text-sm border border-sky-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-400"
                                                                      placeholder="/about or https://example.com"
                                                                      required={rf.required}
                                                                    />
                                                                      <input
                                                                        type="text"
                                                                        value={typeof itemFieldValue === 'object' && itemFieldValue !== null && 'text' in itemFieldValue 
                                                                          ? String((itemFieldValue as { text?: string }).text || '') 
                                                                          : ''}
                                                                        onChange={(e) => {
                                                                          const currentValue = fieldValue as RepeatableItem[];
                                                                          const updated = [...currentValue];
                                                                          const currentItemValue = updated[itemIndex][rf.name];
                                                                          // If it's already an object, update text; otherwise create new object
                                                                          if (typeof currentItemValue === 'object' && currentItemValue !== null && 'text' in currentItemValue) {
                                                                            updated[itemIndex] = { ...updated[itemIndex], [rf.name]: { ...(currentItemValue as { url?: string; text?: string }), text: e.target.value } };
                                                                          } else {
                                                                            // Convert string to object format
                                                                            updated[itemIndex] = { ...updated[itemIndex], [rf.name]: { url: typeof currentItemValue === 'string' ? currentItemValue : '', text: e.target.value } };
                                                                          }
                                                                          updateFieldValue(index, fieldIndex, updated);
                                                                        }}
                                                                        className="w-full px-2 py-1.5 text-sm border border-sky-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-400"
                                                                        placeholder="Link text (optional)"
                                                                      />
                                                                    </div>
                                                                  )}
                                                                  
                                                                  {rf.type === 'image' && (
                                                                    <div className="space-y-2">
                                                                      <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        onChange={(e) => {
                                                                          const file = e.target.files?.[0];
                                                                          if (file) {
                                                                            const currentItemValue = itemFieldValue;
                                                                            const currentAlt = typeof currentItemValue === 'object' && currentItemValue !== null && 'alt' in currentItemValue
                                                                              ? (currentItemValue as { alt?: string }).alt || ''
                                                                              : '';
                                                                            setUploadingFields((prev) => ({ ...prev, [uploadKey]: 'uploading' }));
                                                                            const formData = new FormData();
                                                                            formData.append('file', file);
                                                                            fetch('/api/upload-image', {
                                                                              method: 'POST',
                                                                              body: formData,
                                                                              credentials: 'include',
                                                                            })
                                                                              .then((res) => res.json())
                                                                              .then((data) => {
                                                                                if (data.url) {
                                                                                  const currentValue = fieldValue as RepeatableItem[];
                                                                                  const updated = [...currentValue];
                                                                                  updated[itemIndex] = { ...updated[itemIndex], [rf.name]: { url: data.url, alt: currentAlt } };
                                                                                  updateFieldValue(index, fieldIndex, updated);
                                                                                }
                                                                                setUploadingFields((prev) => {
                                                                                  const newState = { ...prev };
                                                                                  delete newState[uploadKey];
                                                                                  return newState;
                                                                                });
                                                                              });
                                                                          }
                                                                        }}
                                                                        className="w-full px-2 py-1.5 text-sm border border-sky-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-400"
                                                                        disabled={isUploading}
                                                                      />
                                                                      {(() => {
                                                                        const imageUrl = typeof itemFieldValue === 'object' && itemFieldValue !== null && 'url' in itemFieldValue
                                                                          ? (itemFieldValue as { url?: string }).url
                                                                          : typeof itemFieldValue === 'string' ? itemFieldValue : null;
                                                                        const imageAlt = typeof itemFieldValue === 'object' && itemFieldValue !== null && 'alt' in itemFieldValue
                                                                          ? (itemFieldValue as { alt?: string }).alt || ''
                                                                          : '';
                                                                        return imageUrl ? (
                                                                          <>
                                                                            <div className="relative w-full h-32 border border-sky-300 rounded-lg overflow-hidden bg-sky-100">
                                                                              <Image
                                                                                src={imageUrl}
                                                                                alt={imageAlt || rf.name || 'Image'}
                                                                                fill
                                                                                className="object-contain"
                                                                                unoptimized
                                                                              />
                                                                            </div>
                                                                            <input
                                                                              type="text"
                                                                              value={imageAlt}
                                                                              onChange={(e) => {
                                                                                const currentValue = fieldValue as RepeatableItem[];
                                                                                const updated = [...currentValue];
                                                                                const currentItemValue = updated[itemIndex][rf.name];
                                                                                const currentUrl = typeof currentItemValue === 'object' && currentItemValue !== null && 'url' in currentItemValue
                                                                                  ? (currentItemValue as { url?: string }).url || ''
                                                                                  : typeof currentItemValue === 'string' ? currentItemValue : '';
                                                                                updated[itemIndex] = { ...updated[itemIndex], [rf.name]: { url: currentUrl, alt: e.target.value } };
                                                                                updateFieldValue(index, fieldIndex, updated);
                                                                              }}
                                                                              className="w-full px-2 py-1.5 text-sm border border-sky-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-400"
                                                                              placeholder="Alt text (optional)"
                                                                            />
                                                                          </>
                                                                        ) : null;
                                                                      })()}
                                                                      {isUploading && (
                                                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                                                          <Loader2 className="w-3 h-3 animate-spin" />
                                                                          <span>Uploading...</span>
                                                                        </div>
                                                                      )}
                                                                    </div>
                                                                  )}
                                                                  
                                                                  {rf.type === 'pdf' && (
                                                                    <div className="space-y-2">
                                                                      <input
                                                                        type="file"
                                                                        accept=".pdf"
                                                                        onChange={(e) => {
                                                                          const file = e.target.files?.[0];
                                                                          if (file) {
                                                                            setUploadingFields((prev) => ({ ...prev, [uploadKey]: 'uploading' }));
                                                                            const formData = new FormData();
                                                                            formData.append('file', file);
                                                                            fetch('/api/upload-image', {
                                                                              method: 'POST',
                                                                              body: formData,
                                                                              credentials: 'include',
                                                                            })
                                                                              .then((res) => res.json())
                                                                              .then((data) => {
                                                                                if (data.url) {
                                                                                  const currentValue = fieldValue as RepeatableItem[];
                                                                                  const updated = [...currentValue];
                                                                                  updated[itemIndex] = { ...updated[itemIndex], [rf.name]: data.url };
                                                                                  updateFieldValue(index, fieldIndex, updated);
                                                                                }
                                                                                setUploadingFields((prev) => {
                                                                                  const newState = { ...prev };
                                                                                  delete newState[uploadKey];
                                                                                  return newState;
                                                                                });
                                                                              });
                                                                          }
                                                                        }}
                                                                        className="w-full px-2 py-1.5 text-sm border border-sky-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-400"
                                                                        disabled={isUploading}
                                                                      />
                                                                      {itemFieldValue && typeof itemFieldValue === 'string' && (
                                                                        <a
                                                                          href={itemFieldValue}
                                                                          target="_blank"
                                                                          rel="noopener noreferrer"
                                                                          className="text-xs text-sky-600 hover:underline"
                                                                        >
                                                                          View PDF: {itemFieldValue.split('/').pop()}
                                                                        </a>
                                                                      )}
                                                                      {isUploading && (
                                                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                                                          <Loader2 className="w-3 h-3 animate-spin" />
                                                                          <span>Uploading...</span>
                                                                        </div>
                                                                      )}
                                                                    </div>
                                                                  )}
                                                                  
                                                                  {rf.type === 'video' && (
                                                                    <div className="space-y-2">
                                                                      <input
                                                                        type="file"
                                                                        accept="video/*"
                                                                        onChange={(e) => {
                                                                          const file = e.target.files?.[0];
                                                                          if (file) {
                                                                            setUploadingFields((prev) => ({ ...prev, [uploadKey]: 'uploading' }));
                                                                            const formData = new FormData();
                                                                            formData.append('file', file);
                                                                            fetch('/api/upload-image', {
                                                                              method: 'POST',
                                                                              body: formData,
                                                                              credentials: 'include',
                                                                            })
                                                                              .then((res) => res.json())
                                                                              .then((data) => {
                                                                                if (data.url) {
                                                                                  const currentValue = fieldValue as RepeatableItem[];
                                                                                  const updated = [...currentValue];
                                                                                  updated[itemIndex] = { ...updated[itemIndex], [rf.name]: data.url };
                                                                                  updateFieldValue(index, fieldIndex, updated);
                                                                                }
                                                                                setUploadingFields((prev) => {
                                                                                  const newState = { ...prev };
                                                                                  delete newState[uploadKey];
                                                                                  return newState;
                                                                                });
                                                                              });
                                                                          }
                                                                        }}
                                                                        className="w-full px-2 py-1.5 text-sm border border-sky-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-400"
                                                                        disabled={isUploading}
                                                                      />
                                                                      {itemFieldValue && typeof itemFieldValue === 'string' && (
                                                                        <video
                                                                          src={itemFieldValue}
                                                                          controls
                                                                          className="w-full max-h-32 rounded-lg"
                                                                        />
                                                                      )}
                                                                      {isUploading && (
                                                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                                                          <Loader2 className="w-3 h-3 animate-spin" />
                                                                          <span>Uploading...</span>
                                                                        </div>
                                                                      )}
                                                                    </div>
                                                                  )}
                                                                  
                                                                  {rf.type === 'repeatable' && (
                                                                    <div className="space-y-2">
                                                                      <div className="text-xs font-medium text-slate-600 mb-2">
                                                                        {rf.name || 'Nested Group'}
                                                                      </div>
                                                                      {rf.repeatableFields && rf.repeatableFields.length > 0 ? (
                                                                        <div className="space-y-3 pl-4 border-l-2 border-purple-300">
                                                                          {Array.isArray(itemFieldValue) && itemFieldValue.length > 0 ? (
                                                                            itemFieldValue.map((nestedItem: RepeatableItem, nestedItemIndex: number) => (
                                                                              <div key={nestedItemIndex || `nested-${nestedItemIndex}`} className="p-3 bg-purple-50/50 border border-purple-200 rounded-lg">
                                                                                <div className="flex items-center justify-between mb-2">
                                                                                  <span className="text-xs font-medium text-purple-700">
                                                                                    Item {nestedItemIndex + 1}
                                                                                  </span>
                                                                                  <Button
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                      const currentValue = fieldValue as RepeatableItem[];
                                                                                      const updated = [...currentValue];
                                                                                      const nestedItems = Array.isArray(updated[itemIndex][rf.name]) 
                                                                                        ? [...(updated[itemIndex][rf.name] as RepeatableItem[])] 
                                                                                        : [];
                                                                                      nestedItems.splice(nestedItemIndex, 1);
                                                                                      updated[itemIndex] = { ...updated[itemIndex], [rf.name]: nestedItems };
                                                                                      updateFieldValue(index, fieldIndex, updated);
                                                                                    }}
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    className="h-6 text-xs text-red-600"
                                                                                  >
                                                                                    <Trash2 className="w-3 h-3" />
                                                                                  </Button>
                                                                                </div>
                                                                                <div className="space-y-2">
                                                                                  {rf.repeatableFields && rf.repeatableFields.map((nestedRf) => {
                                                                                    const nestedFieldValue = nestedItem[nestedRf.name];
                                                                                    const nestedFieldValueString = typeof nestedFieldValue === 'string' ? nestedFieldValue : null;
                                                                                    return (
                                                                                      <div key={nestedRf.name} className="space-y-1">
                                                                                        <label className="block text-xs font-medium text-slate-600">
                                                                                          {nestedRf.name}
                                                                                          {nestedRf.required && <span className="text-red-500 ml-1">*</span>}
                                                                                        </label>
                                                                                        {nestedRf.type === 'text' && (
                                                                                          <input
                                                                                            type="text"
                                                                                            value={typeof nestedFieldValue === 'string' ? nestedFieldValue : ''}
                                                                                            onChange={(e) => {
                                                                                              const currentValue = fieldValue as RepeatableItem[];
                                                                                              const updated = [...currentValue];
                                                                                              const nestedItems = Array.isArray(updated[itemIndex][rf.name]) 
                                                                                                ? [...(updated[itemIndex][rf.name] as RepeatableItem[])] 
                                                                                                : [];
                                                                                              nestedItems[nestedItemIndex] = { ...nestedItems[nestedItemIndex], [nestedRf.name]: e.target.value };
                                                                                              updated[itemIndex] = { ...updated[itemIndex], [rf.name]: nestedItems };
                                                                                              updateFieldValue(index, fieldIndex, updated);
                                                                                            }}
                                                                                            className="w-full px-2 py-1.5 text-sm border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-400"
                                                                                            required={nestedRf.required}
                                                                                          />
                                                                                        )}

                                                                                        {nestedRf.type === 'email' && (
                                                                                          <input
                                                                                            type="email"
                                                                                            value={typeof nestedFieldValue === 'string' ? nestedFieldValue : ''}
                                                                                            onChange={(e) => {
                                                                                              const currentValue = fieldValue as RepeatableItem[];
                                                                                              const updated = [...currentValue];
                                                                                              const nestedItems = Array.isArray(updated[itemIndex][rf.name]) 
                                                                                                ? [...(updated[itemIndex][rf.name] as RepeatableItem[])] 
                                                                                                : [];
                                                                                              nestedItems[nestedItemIndex] = { ...nestedItems[nestedItemIndex], [nestedRf.name]: e.target.value };
                                                                                              updated[itemIndex] = { ...updated[itemIndex], [rf.name]: nestedItems };
                                                                                              updateFieldValue(index, fieldIndex, updated);
                                                                                            }}
                                                                                            className="w-full px-2 py-1.5 text-sm border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-400"
                                                                                            required={nestedRf.required}
                                                                                            placeholder="name@example.com"
                                                                                          />
                                                                                        )}

                                                                                        {nestedRf.type === 'phone' && (
                                                                                          <input
                                                                                            type="tel"
                                                                                            value={typeof nestedFieldValue === 'string' ? nestedFieldValue : ''}
                                                                                            onChange={(e) => {
                                                                                              const currentValue = fieldValue as RepeatableItem[];
                                                                                              const updated = [...currentValue];
                                                                                              const nestedItems = Array.isArray(updated[itemIndex][rf.name]) 
                                                                                                ? [...(updated[itemIndex][rf.name] as RepeatableItem[])] 
                                                                                                : [];
                                                                                              nestedItems[nestedItemIndex] = { ...nestedItems[nestedItemIndex], [nestedRf.name]: e.target.value };
                                                                                              updated[itemIndex] = { ...updated[itemIndex], [rf.name]: nestedItems };
                                                                                              updateFieldValue(index, fieldIndex, updated);
                                                                                            }}
                                                                                            className="w-full px-2 py-1.5 text-sm border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-400"
                                                                                            required={nestedRf.required}
                                                                                            placeholder="+1 555 123 4567"
                                                                                          />
                                                                                        )}
                                                                                        {nestedRf.type === 'richtext' && (
                                                                                          <RichTextEditor
                                                                                            value={typeof nestedFieldValue === 'string' ? nestedFieldValue : ''}
                                                                                            onChange={(value) => {
                                                                                              const currentValue = fieldValue as RepeatableItem[];
                                                                                              const updated = [...currentValue];
                                                                                              const nestedItems = Array.isArray(updated[itemIndex][rf.name]) 
                                                                                                ? [...(updated[itemIndex][rf.name] as RepeatableItem[])] 
                                                                                                : [];
                                                                                              nestedItems[nestedItemIndex] = { ...nestedItems[nestedItemIndex], [nestedRf.name]: value };
                                                                                              updated[itemIndex] = { ...updated[itemIndex], [rf.name]: nestedItems };
                                                                                              updateFieldValue(index, fieldIndex, updated);
                                                                                            }}
                                                                                            placeholder={`Enter ${nestedRf.name || 'content'}...`}
                                                                                          />
                                                                                        )}
                                                                                        {nestedRf.type === 'number' && (
                                                                                          <input
                                                                                            type="number"
                                                                                            value={typeof nestedFieldValue === 'string' || typeof nestedFieldValue === 'number' ? String(nestedFieldValue) : ''}
                                                                                            onChange={(e) => {
                                                                                              const currentValue = fieldValue as RepeatableItem[];
                                                                                              const updated = [...currentValue];
                                                                                              const nestedItems = Array.isArray(updated[itemIndex][rf.name]) 
                                                                                                ? [...(updated[itemIndex][rf.name] as RepeatableItem[])] 
                                                                                                : [];
                                                                                              nestedItems[nestedItemIndex] = { ...nestedItems[nestedItemIndex], [nestedRf.name]: e.target.value };
                                                                                              updated[itemIndex] = { ...updated[itemIndex], [rf.name]: nestedItems };
                                                                                              updateFieldValue(index, fieldIndex, updated);
                                                                                            }}
                                                                                            className="w-full px-2 py-1.5 text-sm border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-400"
                                                                                            required={nestedRf.required}
                                                                                          />
                                                                                        )}
                                                                                        {nestedRf.type === 'boolean' && (
                                                                                          <div className="flex items-center gap-2">
                                                                                            <input
                                                                                              type="checkbox"
                                                                                              checked={(() => {
                                                                                                if (typeof nestedFieldValue === 'boolean') return nestedFieldValue;
                                                                                                if (typeof nestedFieldValue === 'string') return nestedFieldValue === 'true';
                                                                                                return false;
                                                                                              })()}
                                                                                              onChange={(e) => {
                                                                                                const currentValue = fieldValue as RepeatableItem[];
                                                                                                const updated = [...currentValue];
                                                                                                const nestedItems = Array.isArray(updated[itemIndex][rf.name]) 
                                                                                                  ? [...(updated[itemIndex][rf.name] as RepeatableItem[])] 
                                                                                                  : [];
                                                                                                nestedItems[nestedItemIndex] = { ...nestedItems[nestedItemIndex], [nestedRf.name]: e.target.checked };
                                                                                                updated[itemIndex] = { ...updated[itemIndex], [rf.name]: nestedItems };
                                                                                                updateFieldValue(index, fieldIndex, updated);
                                                                                              }}
                                                                                              className="w-4 h-4 text-purple-600 border-purple-300 rounded focus:ring-purple-500"
                                                                                            />
                                                                                            <label className="text-sm text-slate-700">
                                                                                              {nestedRf.name || 'Enabled'}
                                                                                            </label>
                                                                                          </div>
                                                                                        )}
                                                                                        {nestedRf.type === 'link' && (
                                                                                          <div className="space-y-2">
                                                                                            <input
                                                                                              type="text"
                                                                                              value={typeof nestedFieldValue === 'object' && nestedFieldValue !== null && 'url' in nestedFieldValue 
                                                                                                ? String((nestedFieldValue as { url?: string }).url || '') 
                                                                                                : typeof nestedFieldValue === 'string' ? nestedFieldValue : ''}
                                                                                              onChange={(e) => {
                                                                                                const currentValue = fieldValue as RepeatableItem[];
                                                                                                const updated = [...currentValue];
                                                                                                const nestedItems = Array.isArray(updated[itemIndex][rf.name]) 
                                                                                                  ? [...(updated[itemIndex][rf.name] as RepeatableItem[])] 
                                                                                                  : [];
                                                                                                const currentNestedItem = nestedItems[nestedItemIndex] || {};
                                                                                                const currentLinkValue = typeof currentNestedItem[nestedRf.name] === 'object' && currentNestedItem[nestedRf.name] !== null && 'url' in (currentNestedItem[nestedRf.name] as object)
                                                                                                  ? (currentNestedItem[nestedRf.name] as { url?: string; text?: string })
                                                                                                  : { url: typeof currentNestedItem[nestedRf.name] === 'string' ? currentNestedItem[nestedRf.name] as string : '', text: '' };
                                                                                                nestedItems[nestedItemIndex] = { ...currentNestedItem, [nestedRf.name]: { ...currentLinkValue, url: e.target.value } };
                                                                                                updated[itemIndex] = { ...updated[itemIndex], [rf.name]: nestedItems };
                                                                                                updateFieldValue(index, fieldIndex, updated);
                                                                                              }}
                                                                                              className="w-full px-2 py-1.5 text-sm border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-400"
                                                                                              placeholder="/about or https://example.com"
                                                                                            />
                                                                                            <input
                                                                                              type="text"
                                                                                              value={typeof nestedFieldValue === 'object' && nestedFieldValue !== null && 'text' in nestedFieldValue 
                                                                                                ? String((nestedFieldValue as { text?: string }).text || '') 
                                                                                                : ''}
                                                                                              onChange={(e) => {
                                                                                                const currentValue = fieldValue as RepeatableItem[];
                                                                                                const updated = [...currentValue];
                                                                                                const nestedItems = Array.isArray(updated[itemIndex][rf.name]) 
                                                                                                  ? [...(updated[itemIndex][rf.name] as RepeatableItem[])] 
                                                                                                  : [];
                                                                                                const currentNestedItem = nestedItems[nestedItemIndex] || {};
                                                                                                const currentLinkValue = typeof currentNestedItem[nestedRf.name] === 'object' && currentNestedItem[nestedRf.name] !== null && 'url' in (currentNestedItem[nestedRf.name] as object)
                                                                                                  ? (currentNestedItem[nestedRf.name] as { url?: string; text?: string })
                                                                                                  : { url: typeof currentNestedItem[nestedRf.name] === 'string' ? currentNestedItem[nestedRf.name] as string : '', text: '' };
                                                                                                nestedItems[nestedItemIndex] = { ...currentNestedItem, [nestedRf.name]: { ...currentLinkValue, text: e.target.value } };
                                                                                                updated[itemIndex] = { ...updated[itemIndex], [rf.name]: nestedItems };
                                                                                                updateFieldValue(index, fieldIndex, updated);
                                                                                              }}
                                                                                              className="w-full px-2 py-1.5 text-sm border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-400"
                                                                                              placeholder="Link text (optional)"
                                                                                            />
                                                                                          </div>
                                                                                        )}
                                                                                        {nestedRf.type === 'image' && (
                                                                                          <div className="space-y-2">
                                                                                            <input
                                                                                              type="file"
                                                                                              accept="image/*"
                                                                                              onChange={(e) => {
                                                                                                const file = e.target.files?.[0];
                                                                                                if (file) {
                                                                                                  const uploadKey = `${index}-${fieldIndex}-${itemIndex}-${nestedItemIndex}-${nestedRf.name}`;
                                                                                                  const currentNestedItemValue = nestedFieldValue;
                                                                                                  const currentAlt = typeof currentNestedItemValue === 'object' && currentNestedItemValue !== null && 'alt' in currentNestedItemValue
                                                                                                    ? (currentNestedItemValue as { alt?: string }).alt || ''
                                                                                                    : '';
                                                                                                  setUploadingFields((prev) => ({ ...prev, [uploadKey]: 'uploading' }));
                                                                                                  const formData = new FormData();
                                                                                                  formData.append('file', file);
                                                                                                  fetch('/api/upload-image', {
                                                                                                    method: 'POST',
                                                                                                    body: formData,
                                                                                                    credentials: 'include',
                                                                                                  })
                                                                                                    .then((res) => res.json())
                                                                                                    .then((data) => {
                                                                                                      if (data.url) {
                                                                                                        const currentValue = fieldValue as RepeatableItem[];
                                                                                                        const updated = [...currentValue];
                                                                                                        const nestedItems = Array.isArray(updated[itemIndex][rf.name]) 
                                                                                                          ? [...(updated[itemIndex][rf.name] as RepeatableItem[])] 
                                                                                                          : [];
                                                                                                        nestedItems[nestedItemIndex] = { ...(nestedItems[nestedItemIndex] || {}), [nestedRf.name]: { url: data.url, alt: currentAlt } };
                                                                                                        updated[itemIndex] = { ...updated[itemIndex], [rf.name]: nestedItems };
                                                                                                        updateFieldValue(index, fieldIndex, updated);
                                                                                                      }
                                                                                                      setUploadingFields((prev) => {
                                                                                                        const newState = { ...prev };
                                                                                                        delete newState[uploadKey];
                                                                                                        return newState;
                                                                                                      });
                                                                                                    });
                                                                                                }
                                                                                              }}
                                                                                              className="w-full px-2 py-1.5 text-sm border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-400"
                                                                                              disabled={uploadingFields[`${index}-${fieldIndex}-${itemIndex}-${nestedItemIndex}-${nestedRf.name}`] === 'uploading'}
                                                                                            />
                                                                                            {(() => {
                                                                                              const imageUrl = typeof nestedFieldValue === 'object' && nestedFieldValue !== null && 'url' in nestedFieldValue
                                                                                                ? (nestedFieldValue as { url?: string }).url
                                                                                                : typeof nestedFieldValue === 'string' ? nestedFieldValue : null;
                                                                                              const imageAlt = typeof nestedFieldValue === 'object' && nestedFieldValue !== null && 'alt' in nestedFieldValue
                                                                                                ? (nestedFieldValue as { alt?: string }).alt || ''
                                                                                                : '';
                                                                                              return imageUrl ? (
                                                                                                <>
                                                                                                  <div className="relative w-full h-32 border border-purple-300 rounded-lg overflow-hidden bg-purple-100">
                                                                                                    <Image
                                                                                                      src={imageUrl}
                                                                                                      alt={imageAlt || nestedRf.name || 'Image'}
                                                                                                      fill
                                                                                                      className="object-contain"
                                                                                                      unoptimized
                                                                                                    />
                                                                                                  </div>
                                                                                                  <input
                                                                                                    type="text"
                                                                                                    value={imageAlt}
                                                                                                    onChange={(e) => {
                                                                                                      const currentValue = fieldValue as RepeatableItem[];
                                                                                                      const updated = [...currentValue];
                                                                                                      const nestedItems = Array.isArray(updated[itemIndex][rf.name]) 
                                                                                                        ? [...(updated[itemIndex][rf.name] as RepeatableItem[])] 
                                                                                                        : [];
                                                                                                      const currentNestedItem = nestedItems[nestedItemIndex] || {};
                                                                                                      const currentImageValue = currentNestedItem[nestedRf.name];
                                                                                                      const currentUrl = typeof currentImageValue === 'object' && currentImageValue !== null && 'url' in currentImageValue
                                                                                                        ? (currentImageValue as { url?: string }).url || ''
                                                                                                        : typeof currentImageValue === 'string' ? currentImageValue : '';
                                                                                                      nestedItems[nestedItemIndex] = { ...currentNestedItem, [nestedRf.name]: { url: currentUrl, alt: e.target.value } };
                                                                                                      updated[itemIndex] = { ...updated[itemIndex], [rf.name]: nestedItems };
                                                                                                      updateFieldValue(index, fieldIndex, updated);
                                                                                                    }}
                                                                                                    className="w-full px-2 py-1.5 text-sm border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-400"
                                                                                                    placeholder="Alt text (optional)"
                                                                                                  />
                                                                                                </>
                                                                                              ) : null;
                                                                                            })()}
                                                                                          </div>
                                                                                        )}
                                                                                        {nestedRf.type === 'pdf' && (
                                                                                          <div className="space-y-2">
                                                                                            <input
                                                                                              type="file"
                                                                                              accept=".pdf"
                                                                                              onChange={(e) => {
                                                                                                const file = e.target.files?.[0];
                                                                                                if (file) {
                                                                                                  const uploadKey = `${index}-${fieldIndex}-${itemIndex}-${nestedItemIndex}-${nestedRf.name}`;
                                                                                                  setUploadingFields((prev) => ({ ...prev, [uploadKey]: 'uploading' }));
                                                                                                  const formData = new FormData();
                                                                                                  formData.append('file', file);
                                                                                                  fetch('/api/upload-image', {
                                                                                                    method: 'POST',
                                                                                                    body: formData,
                                                                                                    credentials: 'include',
                                                                                                  })
                                                                                                    .then((res) => res.json())
                                                                                                    .then((data) => {
                                                                                                      if (data.url) {
                                                                                                        const currentValue = fieldValue as RepeatableItem[];
                                                                                                        const updated = [...currentValue];
                                                                                                        const nestedItems = Array.isArray(updated[itemIndex][rf.name]) 
                                                                                                          ? [...(updated[itemIndex][rf.name] as RepeatableItem[])] 
                                                                                                          : [];
                                                                                                        nestedItems[nestedItemIndex] = { ...(nestedItems[nestedItemIndex] || {}), [nestedRf.name]: data.url };
                                                                                                        updated[itemIndex] = { ...updated[itemIndex], [rf.name]: nestedItems };
                                                                                                        updateFieldValue(index, fieldIndex, updated);
                                                                                                      }
                                                                                                      setUploadingFields((prev) => {
                                                                                                        const newState = { ...prev };
                                                                                                        delete newState[uploadKey];
                                                                                                        return newState;
                                                                                                      });
                                                                                                    });
                                                                                                }
                                                                                              }}
                                                                                              className="w-full px-2 py-1.5 text-sm border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-400"
                                                                                              disabled={uploadingFields[`${index}-${fieldIndex}-${itemIndex}-${nestedItemIndex}-${nestedRf.name}`] === 'uploading'}
                                                                                            />
                                                                                            {nestedFieldValueString && (
                                                                                              <a
                                                                                                href={nestedFieldValueString}
                                                                                                target="_blank"
                                                                                                rel="noopener noreferrer"
                                                                                                className="text-xs text-purple-600 underline"
                                                                                              >
                                                                                                View PDF: {nestedFieldValueString.split('/').pop() || nestedFieldValueString}
                                                                                              </a>
                                                                                            )}
                                                                                          </div>
                                                                                        )}
                                                                                        {nestedRf.type === 'video' && (
                                                                                          <div className="space-y-2">
                                                                                            <input
                                                                                              type="file"
                                                                                              accept="video/*"
                                                                                              onChange={(e) => {
                                                                                                const file = e.target.files?.[0];
                                                                                                if (file) {
                                                                                                  const uploadKey = `${index}-${fieldIndex}-${itemIndex}-${nestedItemIndex}-${nestedRf.name}`;
                                                                                                  setUploadingFields((prev) => ({ ...prev, [uploadKey]: 'uploading' }));
                                                                                                  const formData = new FormData();
                                                                                                  formData.append('file', file);
                                                                                                  fetch('/api/upload-image', {
                                                                                                    method: 'POST',
                                                                                                    body: formData,
                                                                                                    credentials: 'include',
                                                                                                  })
                                                                                                    .then((res) => res.json())
                                                                                                    .then((data) => {
                                                                                                      if (data.url) {
                                                                                                        const currentValue = fieldValue as RepeatableItem[];
                                                                                                        const updated = [...currentValue];
                                                                                                        const nestedItems = Array.isArray(updated[itemIndex][rf.name]) 
                                                                                                          ? [...(updated[itemIndex][rf.name] as RepeatableItem[])] 
                                                                                                          : [];
                                                                                                        nestedItems[nestedItemIndex] = { ...(nestedItems[nestedItemIndex] || {}), [nestedRf.name]: data.url };
                                                                                                        updated[itemIndex] = { ...updated[itemIndex], [rf.name]: nestedItems };
                                                                                                        updateFieldValue(index, fieldIndex, updated);
                                                                                                      }
                                                                                                      setUploadingFields((prev) => {
                                                                                                        const newState = { ...prev };
                                                                                                        delete newState[uploadKey];
                                                                                                        return newState;
                                                                                                      });
                                                                                                    });
                                                                                                }
                                                                                              }}
                                                                                              className="w-full px-2 py-1.5 text-sm border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-400"
                                                                                              disabled={uploadingFields[`${index}-${fieldIndex}-${itemIndex}-${nestedItemIndex}-${nestedRf.name}`] === 'uploading'}
                                                                                            />
                                                                                            {typeof nestedFieldValue === 'string' && nestedFieldValue && (
                                                                                              <video
                                                                                                src={nestedFieldValue}
                                                                                                controls
                                                                                                className="w-full max-h-32 rounded-lg"
                                                                                              />
                                                                                            )}
                                                                                          </div>
                                                                                        )}
                                                                                      </div>
                                                                                    );
                                                                                  })}
                                                                                </div>
                                                                              </div>
                                                                            ))
                                                                          ) : (
                                                                            <p className="text-xs text-slate-500 text-center py-2">
                                                                              No nested items added yet.
                                                                            </p>
                                                                          )}
                                                                          <Button
                                                                            type="button"
                                                                            onClick={() => {
                                                                              const currentValue = fieldValue as RepeatableItem[];
                                                                              const updated = [...currentValue];
                                                                              const nestedItems = Array.isArray(updated[itemIndex][rf.name]) 
                                                                                ? [...(updated[itemIndex][rf.name] as RepeatableItem[])] 
                                                                                : [];
                                                                              const newNestedItem: RepeatableItem = {
                                                                                id: `nested-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                                                                              };
                                                                              if (rf.repeatableFields) {
                                                                                rf.repeatableFields.forEach((nestedRf) => {
                                                                                  newNestedItem[nestedRf.name] = '';
                                                                                });
                                                                              }
                                                                              nestedItems.push(newNestedItem);
                                                                              updated[itemIndex] = { ...updated[itemIndex], [rf.name]: nestedItems };
                                                                              updateFieldValue(index, fieldIndex, updated);
                                                                            }}
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="h-7 text-xs"
                                                                          >
                                                                            <Plus className="w-3 h-3 mr-1" />
                                                                            Add Nested Item
                                                                          </Button>
                                                                        </div>
                                                                      ) : (
                                                                        <p className="text-xs text-slate-500 text-center py-2">
                                                                          Configure nested group fields above to add items.
                                                                        </p>
                                                                      )}
                                                                    </div>
                                                                  )}
                                                                </div>
                                                              );
                                                            })
                                                          ) : (
                                                            <p className="text-xs text-slate-500 text-center py-2">
                                                              Configure group fields above to add fields to items.
                                                            </p>
                                                          )}
                                                        </div>
                                                      </div>
                                                    );
                                                  })}
                                                </div>
                                              ) : (
                                                <div className="text-center py-4 text-slate-500 border border-slate-200 rounded-lg bg-slate-50">
                                                  <p className="text-xs mb-2">
                                                    {fieldDef.repeatableFields && fieldDef.repeatableFields.length > 0
                                                      ? 'No items added yet.'
                                                      : 'Configure group fields above, then add items.'}
                                                  </p>
                                                  {fieldDef.repeatableFields && fieldDef.repeatableFields.length > 0 && (
                                                    <Button
                                                      type="button"
                                                      onClick={() => {
                                                        const configuredFields = fieldDef.repeatableFields || [];
                                                        const newItem: RepeatableItem = {
                                                          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                                                        };
                                                        configuredFields.forEach((rf) => {
                                                          newItem[rf.name] = '';
                                                        });
                                                        updateFieldValue(index, fieldIndex, [newItem]);
                                                      }}
                                                      variant="outline"
                                                      size="sm"
                                                      className="h-7 text-xs"
                                                    >
                                                      <Plus className="w-3 h-3 mr-1" />
                                                      Add Your First Item
                                                    </Button>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                        
                                        <div>
                                          <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                              type="checkbox"
                                              checked={fieldDef.required || false}
                                              onChange={(e) => updateFieldDefinition(index, fieldIndex, { required: e.target.checked })}
                                              className="w-3.5 h-3.5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                            />
                                            <span className="text-xs text-slate-600">Required</span>
                                          </label>
                                        </div>
                                      </div>
                                      
                                      <Button
                                        type="button"
                                        onClick={() => removeFieldFromSection(index, fieldIndex)}
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 shrink-0"
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
                            </div>
                          )}
                          
                          <div className="mt-4 flex justify-end">
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
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 border border-slate-200 rounded-lg bg-slate-50">
                <p className="mb-4">No sections added yet.</p>
                <div className="flex gap-2 justify-center">
                  <Button
                    type="button"
                    onClick={() => {
                      const newSection: Section = {
                        component_type: 'custom',
                        title: 'Section 1',
                        content: {},
                        fieldDefinitions: [],
                        order_index: 0,
                      };
                      setPage({
                        ...page,
                        sections: [newSection],
                      });
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Quick Add Section
                  </Button>
                </div>
              </div>
            )}
            
            {page.sections && page.sections.length > 0 && (
              <div className="mt-4 flex justify-end">
                <Button
                  type="button"
                  onClick={() => {
                    const sectionId = `section-${Date.now()}`;
                    const newSection: Section = {
                      id: sectionId,
                      component_type: 'custom',
                      title: `Section ${page.sections.length + 1}`,
                      content: {},
                      fieldDefinitions: [],
                      order_index: page.sections.length,
                      is_visible: true,
                    };
                    setPage({
                      ...page,
                      sections: [...page.sections, newSection],
                    });
                    setExpandedSections((prev) => new Set(prev).add(sectionId));
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Section
                </Button>
              </div>
            )}
            </div>
          </div>

          {/* Right Side - Page Details Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 sticky top-6 h-fit">
              {/* Publish Box */}
              <div className="border-b border-slate-200 pb-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Publish</h3>
                <div className="space-y-4">
                  <Button
                    type="submit"
                    disabled={saving}
                    className={`w-full ${
                      saveSuccess
                        ? 'bg-green-600'
                        : 'bg-purple-600'
                    }`}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : saveSuccess ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Updated Successfully!
                      </>
                    ) : (
                      isNew ? 'Publish' : 'Update'
                    )}
                  </Button>
                  <Link href="/admin/pages" className="block">
                    <Button variant="outline" className="w-full">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Page Attributes */}
              <div className="border-b border-slate-200 pb-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Page Attributes</h3>
                <div className="space-y-4">
                  {/* Website Selection */}
                  {isNew ? (
                    <div>
                      <label htmlFor="website_id" className="block text-sm font-semibold text-slate-700 mb-2">
                        Website
                      </label>
                      <input
                        id="website_id"
                        type="text"
                        value={websites[0]?.title || 'Loading...'}
                        disabled
                        className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
                      />
                      <p className="text-sm text-slate-500 mt-1.5">
                        Auto-selected by institution
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="website_id" className="block text-sm font-semibold text-slate-700 mb-2">
                        Website
                      </label>
                      <input
                        id="website_id"
                        type="text"
                        value={websites.find(w => w.id === page.website_id)?.title || 'Loading...'}
                        disabled
                        className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
                      />
                      <p className="text-sm text-slate-500 mt-1.5">
                        Website cannot be changed
                      </p>
                    </div>
                  )}

                  {/* Order Index */}
                  <div>
                    <label htmlFor="order_index" className="block text-sm font-semibold text-slate-700 mb-2">
                      Order Index
                    </label>
                    <input
                      id="order_index"
                      type="number"
                      value={page.order_index}
                      onChange={(e) => setPage({ ...page, order_index: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Page Settings */}
              <div className="border-b border-slate-200 pb-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Page Settings</h3>
                <div className="space-y-4">
                  {/* Publish Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={page.is_published}
                      onChange={(e) => setPage({ ...page, is_published: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      Published
                    </span>
                  </label>

                  {/* Create Page File Toggle - Only show for new pages */}
                  {isNew && (
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={createPageFile}
                        onChange={(e) => setCreatePageFile(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 mt-0.5"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-slate-700 block">
                          Create page file
                        </span>
                        <span className="text-xs text-slate-500 mt-1 block">
                          Create app/{page.slug || 'slug'}/page.tsx
                        </span>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* SEO Settings */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-4">SEO Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="meta_title" className="block text-sm font-semibold text-slate-700 mb-2">
                      Meta Title
                    </label>
                    <input
                      id="meta_title"
                      type="text"
                      value={page.meta_title || ''}
                      onChange={(e) => setPage({ ...page, meta_title: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all"
                      placeholder="SEO title"
                    />
                  </div>

                  <div>
                    <label htmlFor="meta_description" className="block text-sm font-semibold text-slate-700 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      id="meta_description"
                      value={page.meta_description || ''}
                      onChange={(e) => setPage({ ...page, meta_description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all resize-none"
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

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Save, Loader2, GripVertical, ChevronDown, ChevronRight, Upload, X } from 'lucide-react';
import { getWebsiteNavigation, updateWebsiteNavigation } from '@/app/admin/actions/websites';
import Image from 'next/image';

interface NavItem {
  id: string;
  label: string;
  url: string;
  logo?: string;
  order_index?: number;
  children?: NavItem[];
}

interface FooterColumn {
  id: string;
  title: string;
  items: NavItem[];
  order_index?: number;
}

interface LogoOption {
  id: string;
  label: string;
  url: string;
  type?: string; // e.g., 'default', 'dark', 'light', 'mobile', 'desktop'
}

interface CTASection {
  enabled: boolean;
  text: string;
  url: string;
  style?: 'primary' | 'secondary' | 'outline';
}

interface NavigationData {
  logos?: LogoOption[];
  logo?: string; // Keep for backward compatibility
  cta?: CTASection;
  nav: {
    items: NavItem[];
  };
  footer: {
    columns: FooterColumn[];
  };
}

function ImageUpload({
  value,
  onChange,
  label,
  compact = false,
}: {
  value: string;
  onChange: (url: string) => void;
  label: string;
  compact?: boolean;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (value) {
      setPreview(value);
    }
  }, [value]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
      
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase
    setUploading(true);
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
        onChange(data.url);
        setPreview(data.url);
      } else {
        alert(data.error || 'Upload failed');
        setPreview(null);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
      setPreview(null);
    } finally {
      setUploading(false);
      // Reset file input
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
  };

  if (compact) {
    return (
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {label}
        </label>
        <div className="space-y-2">
          {preview ? (
            <div className="relative">
              <div className="w-full h-20 border border-slate-300 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 320px"
                  className="object-contain"
                  onError={() => {
                    setPreview(null);
                  }}
                />
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-3 hover:border-purple-400 transition-colors">
              <label className="flex flex-col items-center justify-center cursor-pointer">
                <Upload className="w-5 h-5 text-slate-400 mb-1.5" />
                <span className="text-sm text-slate-600 mb-1 font-medium">
                  {uploading ? 'Uploading...' : 'Upload'}
                </span>
                <span className="text-xs text-slate-500">
                  PNG, JPG, GIF, WebP, SVG
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          )}
          {uploading && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Uploading...</span>
            </div>
          )}
          {preview && (
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white transition-all"
              placeholder="Image URL"
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label}
      </label>
      <div className="space-y-3">
        {preview ? (
          <div className="relative">
            <div className="w-full h-32 border border-slate-300 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
              <Image
                src={preview}
                alt="Preview"
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 512px"
                className="object-contain"
                onError={() => {
                  setPreview(null);
                }}
              /> 
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 hover:border-purple-400 transition-colors">
            <label className="flex flex-col items-center justify-center cursor-pointer">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-sm text-slate-600 mb-1 font-medium">
                {uploading ? 'Uploading...' : 'Click to upload image'}
              </span>
              <span className="text-xs text-slate-500">
                PNG, JPG, GIF, WebP, SVG
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        )}
        {uploading && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Uploading...</span>
          </div>
        )}
        {preview && (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white transition-all"
            placeholder="Image URL"
          />
        )}
      </div>
    </div>
  );
}

function NavItemEditor({
  item,
  level = 0,
  onUpdate,
  onDelete,
  onAddChild,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging,
}: {
  item: NavItem;
  level: number;
  onUpdate: (id: string, field: keyof NavItem, value: string | number | NavItem[]) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onDragStart: (e: React.DragEvent, itemId: string, parentId?: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetId: string, parentId?: string) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const hasChildren = item.children && item.children.length > 0;

  return (
    <div className={`${level > 0 ? 'ml-8 mt-3' : ''}`}>
      <div
        className={`flex items-start gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition ${
          level > 0 ? 'bg-slate-50' : ''
        } ${isDragging ? 'opacity-50' : ''}`}
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, item.id)}
      >
        <div className="flex items-center gap-2">
          <div
            draggable
            onDragStart={(e) => onDragStart(e, item.id)}
            onDragEnd={onDragEnd}
            className="cursor-move"
          >
            <GripVertical className="w-5 h-5 text-slate-400 shrink-0" />
          </div>
          {hasChildren && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-slate-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-slate-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-600" />
              )}
            </button>
          )}
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Label *
            </label>
            <input
              type="text"
              value={item.label}
              onChange={(e) => onUpdate(item.id, 'label', e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white transition-all"
              placeholder="Menu Label"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              URL
            </label>
            <input
              type="text"
              value={item.url}
              onChange={(e) => onUpdate(item.id, 'url', e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white transition-all"
              placeholder="/about or https://example.com"
            />
          </div>
          <div>
            <ImageUpload
              value={item.logo || ''}
              onChange={(url) => onUpdate(item.id, 'logo', url)}
              label="Logo (optional)"
              compact={true}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={() => onAddChild(item.id)}
            variant="outline"
            size="sm"
            title="Add sub-item"
          >
            <Plus className="w-4 h-4 mr-1" />
            <span className="hidden md:inline">Sub-item</span>
          </Button>
          <Button
            onClick={() => onDelete(item.id)}
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-2 space-y-2">
          {item.children!.map((child) => (
            <NavItemEditor
              key={child.id}
              item={child}
              level={level + 1}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onDragStart={(e, itemId) => onDragStart(e, itemId, item.id)}
              onDragOver={onDragOver}
              onDrop={(e, targetId) => onDrop(e, targetId, item.id)}
              onDragEnd={onDragEnd}
              isDragging={isDragging}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function NavigationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlWebsiteId = searchParams.get('website_id');
  
  // Redirect to base route if no website_id is provided
  useEffect(() => {
    if (!urlWebsiteId) {
      router.push('/');
    }
  }, [urlWebsiteId, router]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [websiteId, setWebsiteId] = useState<string | null>(urlWebsiteId || null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [draggedParentId, setDraggedParentId] = useState<string | undefined>(undefined);
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
  const [draggedFooterItemId, setDraggedFooterItemId] = useState<string | null>(null);
  const [draggedFooterColumnId, setDraggedFooterColumnId] = useState<string | null>(null);
  const [navigation, setNavigation] = useState<NavigationData>({
    logos: [],
    logo: '', // Keep for backward compatibility
    cta: {
      enabled: false,
      text: '',
      url: '',
      style: 'primary',
    },
    nav: { items: [] },
    footer: { columns: [] },
  });

  const generateId = () => {
    return `item-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  };

  useEffect(() => {
    // Don't fetch if no website_id
    if (!urlWebsiteId) {
      return;
    }
    
    const fetchNavigation = async () => {
      // Use website_id from URL
      const { data, error } = await getWebsiteNavigation(urlWebsiteId);
      if (error) {
        // If error fetching navigation, check if it's because website doesn't exist
        if (error.includes('not found') || error.includes('Website not found')) {
          setNotFound(true);
        } else {
          setMessage({ type: 'error', text: error });
        }
        setLoading(false);
        return;
      } else if (data) {
        // Set websiteId from URL param
        if (urlWebsiteId) {
          setWebsiteId(urlWebsiteId);
        }
        
        const navData = (data.navigation as { 
          logo?: string; 
          logos?: LogoOption[];
          cta?: CTASection;
          nav?: { items?: unknown[] }; 
          footer?: { columns?: unknown[]; items?: unknown[] } 
        }) || { 
          logo: '', 
          logos: [],
          cta: { enabled: false, text: '', url: '', style: 'primary' },
          nav: { items: [] }, 
          footer: { columns: [] } 
        };
        
        let footerColumns: FooterColumn[] = [];
        if (navData.footer?.columns && Array.isArray(navData.footer.columns)) {
          footerColumns = (navData.footer.columns as FooterColumn[]).map((col) => ({
            ...col,
            items: Array.isArray(col.items)
              ? (col.items as NavItem[]).map((item) => ({
                  ...item,
                  children: Array.isArray(item.children) ? item.children : [],
                }))
              : [],
          }));
        } else if (navData.footer?.items && Array.isArray(navData.footer.items)) {
          footerColumns = [
            {
              id: generateId(),
              title: 'Column 1',
              items: (navData.footer.items as NavItem[]).map((item) => ({
                ...item,
                children: Array.isArray(item.children) ? item.children : [],
              })),
              order_index: 0,
            },
          ];
        }
        
        // Handle logos - support both old single logo and new multiple logos
        let logos: LogoOption[] = [];
        if (navData.logos && Array.isArray(navData.logos)) {
          logos = navData.logos as LogoOption[];
        } else if (navData.logo) {
          // Migrate old single logo to new structure
          logos = [{
            id: generateId(),
            label: 'Main Logo',
            url: navData.logo,
            type: 'default',
          }];
        }
        
        setNavigation({
          logo: navData.logo || '', // Keep for backward compatibility
          logos: logos,
          cta: navData.cta || { enabled: false, text: '', url: '', style: 'primary' },
          nav: {
            items: Array.isArray(navData.nav?.items)
              ? (navData.nav.items as NavItem[]).map((item) => ({
                  ...item,
                  children: Array.isArray(item.children) ? item.children : [],
                }))
              : [],
          },
          footer: {
            columns: footerColumns,
          },
        });
      }
      setLoading(false);
    };

    fetchNavigation();
  }, [urlWebsiteId]);

  const updateItemInTree = (
    items: NavItem[],
    id: string,
    field: keyof NavItem,
    value: string | number | NavItem[]
  ): NavItem[] => {
    return items.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      if (item.children && item.children.length > 0) {
        return {
          ...item,
          children: updateItemInTree(item.children, id, field, value),
        };
      }
      return item;
    });
  };

  const deleteItemFromTree = (items: NavItem[], id: string): NavItem[] => {
    return items
      .filter((item) => item.id !== id)
      .map((item) => {
        if (item.children && item.children.length > 0) {
          return {
            ...item,
            children: deleteItemFromTree(item.children, id),
          };
        }
        return item;
      });
  };

  const addChildToItem = (items: NavItem[], parentId: string): NavItem[] => {
    return items.map((item) => {
      if (item.id === parentId) {
        const newChild: NavItem = {
          id: generateId(),
          label: 'New Sub-item',
          url: '#',
          order_index: item.children ? item.children.length : 0,
        };
        return {
          ...item,
          children: [...(item.children || []), newChild],
        };
      }
      if (item.children && item.children.length > 0) {
        return {
          ...item,
          children: addChildToItem(item.children, parentId),
        };
      }
      return item;
    });
  };

  const addNavItem = () => {
    const newItem: NavItem = {
      id: generateId(),
      label: 'New Item',
      url: '/',
      order_index: navigation.nav.items.length,
      children: [],
    };
    setNavigation({
      ...navigation,
      nav: {
        items: [...navigation.nav.items, newItem],
      },
    });
  };

  const addFooterColumn = () => {
    const newColumn: FooterColumn = {
      id: generateId(),
      title: `Column ${navigation.footer.columns.length + 1}`,
      items: [],
      order_index: navigation.footer.columns.length,
    };
    setNavigation({
      ...navigation,
      footer: {
        columns: [...navigation.footer.columns, newColumn],
      },
    });
  };

  const updateFooterColumn = (columnId: string, field: keyof FooterColumn, value: string | number) => {
    setNavigation({
      ...navigation,
      footer: {
        columns: navigation.footer.columns.map((col) =>
          col.id === columnId ? { ...col, [field]: value } : col
        ),
      },
    });
  };

  const deleteFooterColumn = (columnId: string) => {
    setNavigation({
      ...navigation,
      footer: {
        columns: navigation.footer.columns.filter((col) => col.id !== columnId),
      },
    });
  };

  const addFooterItem = (columnId: string) => {
    const column = navigation.footer.columns.find((col) => col.id === columnId);
    if (!column) return;

    const newItem: NavItem = {
      id: generateId(),
      label: 'New Item',
      url: '/',
      order_index: column.items.length,
      children: [],
    };

    setNavigation({
      ...navigation,
      footer: {
        columns: navigation.footer.columns.map((col) =>
          col.id === columnId
            ? { ...col, items: [...col.items, newItem] }
            : col
        ),
      },
    });
  };

  const updateFooterItem = (columnId: string, itemId: string, field: keyof NavItem, value: string | number | NavItem[]) => {
    setNavigation({
      ...navigation,
      footer: {
        columns: navigation.footer.columns.map((col) =>
          col.id === columnId
            ? {
                ...col,
                items: updateItemInTree(col.items, itemId, field, value),
              }
            : col
        ),
      },
    });
  };

  const deleteFooterItem = (columnId: string, itemId: string) => {
    setNavigation({
      ...navigation,
      footer: {
        columns: navigation.footer.columns.map((col) =>
          col.id === columnId
            ? {
                ...col,
                items: deleteItemFromTree(col.items, itemId),
              }
            : col
        ),
      },
    });
  };

  const addFooterChild = (columnId: string, parentId: string) => {
    setNavigation({
      ...navigation,
      footer: {
        columns: navigation.footer.columns.map((col) =>
          col.id === columnId
            ? {
                ...col,
                items: addChildToItem(col.items, parentId),
              }
            : col
        ),
      },
    });
  };

  const updateNavItem = (id: string, field: keyof NavItem, value: string | number | NavItem[]) => {
    setNavigation({
      ...navigation,
      nav: {
        items: updateItemInTree(navigation.nav.items, id, field, value),
      },
    });
  };

  const deleteNavItem = (id: string) => {
    setNavigation({
      ...navigation,
      nav: {
        items: deleteItemFromTree(navigation.nav.items, id),
      },
    });
  };

  const addNavChild = (parentId: string) => {
    setNavigation({
      ...navigation,
      nav: {
        items: addChildToItem(navigation.nav.items, parentId),
      },
    });
  };

  // Drag and drop handlers for navigation items
  const handleNavDragStart = (e: React.DragEvent, itemId: string, parentId?: string) => {
    setDraggedItemId(itemId);
    setDraggedParentId(parentId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', itemId);
  };

  const handleNavDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleNavDrop = (e: React.DragEvent, targetId: string, targetParentId?: string) => {
    e.preventDefault();
    
    if (!draggedItemId || draggedItemId === targetId) {
      setDraggedItemId(null);
      setDraggedParentId(undefined);
      return;
    }

    // Reorder items
    const reorderItems = (items: NavItem[]): NavItem[] => {
      const draggedIndex = items.findIndex(item => item.id === draggedItemId);
      const targetIndex = items.findIndex(item => item.id === targetId);

      if (draggedIndex === -1 || targetIndex === -1) {
        // If not found at this level, check children
        return items.map(item => {
          if (item.children && item.children.length > 0) {
            return {
              ...item,
              children: reorderItems(item.children),
            };
          }
          return item;
        });
      }

      // Move item
      const newItems = [...items];
      const [draggedItem] = newItems.splice(draggedIndex, 1);
      newItems.splice(targetIndex, 0, draggedItem);

      // Update order_index for all items
      return newItems.map((item, index) => ({
        ...item,
        order_index: index,
        children: item.children ? reorderItems(item.children) : undefined,
      }));
    };

    // Handle nested items (children)
    const reorderItemsInTree = (items: NavItem[]): NavItem[] => {
      return items.map(item => {
        // If this item has the target as a child, reorder within it
        if (item.id === targetParentId && item.children) {
          const draggedIndex = item.children.findIndex(child => child.id === draggedItemId);
          const targetIndex = item.children.findIndex(child => child.id === targetId);

          if (draggedIndex !== -1 && targetIndex !== -1) {
            const newChildren = [...item.children];
            const [draggedChild] = newChildren.splice(draggedIndex, 1);
            newChildren.splice(targetIndex, 0, draggedChild);

            return {
              ...item,
              children: newChildren.map((child, index) => ({
                ...child,
                order_index: index,
              })),
            };
          }
        }

        // If this item is the parent of the dragged item, remove it from children
        if (item.id === draggedParentId && item.children) {
          return {
            ...item,
            children: item.children
              .filter(child => child.id !== draggedItemId)
              .map((child, index) => ({
                ...child,
                order_index: index,
              })),
          };
        }

        // If this item is the target parent, add dragged item to its children
        if (item.id === targetParentId && draggedParentId !== targetParentId && item.children) {
          const targetIndex = item.children.findIndex(child => child.id === targetId);
          const draggedItem = findItemInTree(navigation.nav.items, draggedItemId);
          
          if (draggedItem && targetIndex !== -1) {
            const newChildren = [...item.children];
            newChildren.splice(targetIndex, 0, { ...draggedItem, order_index: targetIndex });
            
            return {
              ...item,
              children: newChildren.map((child, index) => ({
                ...child,
                order_index: index,
              })),
            };
          }
        }

        // Recursively process children
        if (item.children && item.children.length > 0) {
          return {
            ...item,
            children: reorderItemsInTree(item.children),
          };
        }

        return item;
      });
    };

    const findItemInTree = (items: NavItem[], id: string): NavItem | null => {
      for (const item of items) {
        if (item.id === id) return item;
        if (item.children) {
          const found = findItemInTree(item.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    // If both items are at the same level (same parent or both top-level)
    if (draggedParentId === targetParentId) {
      setNavigation({
        ...navigation,
        nav: {
          items: targetParentId 
            ? reorderItemsInTree(navigation.nav.items)
            : reorderItems(navigation.nav.items),
        },
      });
    } else {
      // Items are at different levels, need more complex reordering
      setNavigation({
        ...navigation,
        nav: {
          items: reorderItemsInTree(navigation.nav.items),
        },
      });
    }

    setDraggedItemId(null);
    setDraggedParentId(undefined);
  };

  const handleNavDragEnd = () => {
    setDraggedItemId(null);
    setDraggedParentId(undefined);
  };

  // Drag and drop handlers for footer columns
  const handleFooterColumnDragStart = (e: React.DragEvent, columnId: string) => {
    setDraggedColumnId(columnId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', columnId);
  };

  const handleFooterColumnDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleFooterColumnDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    
    if (!draggedColumnId || draggedColumnId === targetColumnId) {
      setDraggedColumnId(null);
      return;
    }

    const draggedIndex = navigation.footer.columns.findIndex(col => col.id === draggedColumnId);
    const targetIndex = navigation.footer.columns.findIndex(col => col.id === targetColumnId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedColumnId(null);
      return;
    }

    // Reorder columns
    const newColumns = [...navigation.footer.columns];
    const [draggedColumn] = newColumns.splice(draggedIndex, 1);
    newColumns.splice(targetIndex, 0, draggedColumn);

    // Update order_index for all columns
    const reorderedColumns = newColumns.map((col, index) => ({
      ...col,
      order_index: index,
    }));

    setNavigation({
      ...navigation,
      footer: {
        columns: reorderedColumns,
      },
    });

    setDraggedColumnId(null);
  };

  const handleFooterColumnDragEnd = () => {
    setDraggedColumnId(null);
  };

  // Drag and drop handlers for footer items within columns
  const handleFooterItemDragStart = (e: React.DragEvent, itemId: string, columnId: string, parentId?: string) => {
    setDraggedFooterItemId(itemId);
    setDraggedFooterColumnId(columnId);
    setDraggedParentId(parentId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', itemId);
  };

  const handleFooterItemDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleFooterItemDrop = (e: React.DragEvent, targetItemId: string, targetColumnId: string) => {
    e.preventDefault();
    
    if (!draggedFooterItemId || !draggedFooterColumnId || draggedFooterItemId === targetItemId) {
      setDraggedFooterItemId(null);
      setDraggedFooterColumnId(null);
      setDraggedParentId(undefined);
      return;
    }

    // Only allow reordering within the same column
    if (draggedFooterColumnId !== targetColumnId) {
      setDraggedFooterItemId(null);
      setDraggedFooterColumnId(null);
      setDraggedParentId(undefined);
      return;
    }

    const column = navigation.footer.columns.find(col => col.id === targetColumnId);
    if (!column) {
      setDraggedFooterItemId(null);
      setDraggedFooterColumnId(null);
      setDraggedParentId(undefined);
      return;
    }

    // Reorder items within the column
    const reorderFooterItems = (items: NavItem[]): NavItem[] => {
      const draggedIndex = items.findIndex(item => item.id === draggedFooterItemId);
      const targetIndex = items.findIndex(item => item.id === targetItemId);

      if (draggedIndex === -1 || targetIndex === -1) {
        // If not found at this level, check children
        return items.map(item => {
          if (item.children && item.children.length > 0) {
            return {
              ...item,
              children: reorderFooterItems(item.children),
            };
          }
          return item;
        });
      }

      // Move item
      const newItems = [...items];
      const [draggedItem] = newItems.splice(draggedIndex, 1);
      newItems.splice(targetIndex, 0, draggedItem);

      // Update order_index for all items
      return newItems.map((item, index) => ({
        ...item,
        order_index: index,
        children: item.children ? reorderFooterItems(item.children) : undefined,
      }));
    };

    const reorderedItems = reorderFooterItems(column.items);

    setNavigation({
      ...navigation,
      footer: {
        columns: navigation.footer.columns.map(col =>
          col.id === targetColumnId
            ? { ...col, items: reorderedItems }
            : col
        ),
      },
    });

    setDraggedFooterItemId(null);
    setDraggedFooterColumnId(null);
    setDraggedParentId(undefined);
  };

  const handleFooterItemDragEnd = () => {
    setDraggedFooterItemId(null);
    setDraggedFooterColumnId(null);
    setDraggedParentId(undefined);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    // Use websiteId from state (which comes from URL or response)
    const { error } = await updateWebsiteNavigation(navigation, websiteId || undefined);

    if (error) {
      setMessage({ type: 'error', text: `Failed to save: ${error}` });
    } else {
      setMessage({ type: 'success', text: 'Navigation updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-20 h-20 text-slate-400 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Website Not Found</h1>
          <p className="text-lg text-slate-600 mb-8">
            The website you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white text-base font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Select a Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Navigation</h1>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-purple-600 hover:bg-purple-700 text-base font-medium px-5 py-2.5 shadow-sm hover:shadow transition-all duration-200"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {websiteId && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
                Website ID
              </label>
              <div className="bg-white border border-slate-300 rounded px-3 py-2 font-mono text-sm text-slate-900 break-all">
                {websiteId}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">
                API Route
              </label>
              <div className="bg-white border border-slate-300 rounded px-3 py-2">
                <code className="text-xs text-slate-700 font-mono break-all">
                  GET /api/navigation{websiteId ? `?website_id=${websiteId}` : ''}
                </code>
              </div>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-8">
        {/* Multiple Logo Options */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Navigation Logos</h2>
              <p className="text-sm text-slate-600 mt-1">Add multiple logo options for different contexts</p>
            </div>
            <Button
              onClick={() => {
                const newLogo: LogoOption = {
                  id: generateId(),
                  label: `Logo ${(navigation.logos || []).length + 1}`,
                  url: '',
                  type: 'default',
                };
                setNavigation({
                  ...navigation,
                  logos: [...(navigation.logos || []), newLogo],
                });
              }}
              variant="outline"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Logo
            </Button>
          </div>
          
          {navigation.logos && navigation.logos.length > 0 ? (
            <div className="space-y-4">
              {navigation.logos.map((logo, index) => (
                <div key={logo.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Logo Label
                        </label>
                        <input
                          type="text"
                          value={logo.label}
                          onChange={(e) => {
                            const updated = [...(navigation.logos || [])];
                            updated[index] = { ...updated[index], label: e.target.value };
                            setNavigation({ ...navigation, logos: updated });
                          }}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="e.g., Main Logo, Dark Mode, Mobile"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Logo Type
                        </label>
                        <select
                          value={logo.type || 'default'}
                          onChange={(e) => {
                            const updated = [...(navigation.logos || [])];
                            updated[index] = { ...updated[index], type: e.target.value };
                            setNavigation({ ...navigation, logos: updated });
                          }}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="default">Default</option>
                          <option value="dark">Dark Mode</option>
                          <option value="light">Light Mode</option>
                          <option value="mobile">Mobile</option>
                          <option value="desktop">Desktop</option>
                          <option value="sticky">Sticky Header</option>
                        </select>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        const updated = (navigation.logos || []).filter((_, i) => i !== index);
                        setNavigation({ ...navigation, logos: updated });
                      }}
                      variant="ghost"
                      size="sm"
                      className="ml-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="max-w-md">
                    <ImageUpload
                      value={logo.url}
                      onChange={(url) => {
                        const updated = [...(navigation.logos || [])];
                        updated[index] = { ...updated[index], url };
                        setNavigation({ ...navigation, logos: updated });
                      }}
                      label={`${logo.label} Image`}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
              <p className="text-slate-500 mb-4">No logos added yet.</p>
              <Button
                onClick={() => {
                  const newLogo: LogoOption = {
                    id: generateId(),
                    label: 'Main Logo',
                    url: '',
                    type: 'default',
                  };
                  setNavigation({
                    ...navigation,
                    logos: [newLogo],
                  });
                }}
                variant="outline"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Logo
              </Button>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Call To Action (CTA)</h2>
              <p className="text-sm text-slate-600 mt-1">Configure a CTA button for the navigation bar</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={navigation.cta?.enabled || false}
                onChange={(e) =>
                  setNavigation({
                    ...navigation,
                    cta: {
                      ...(navigation.cta || { text: '', url: '', style: 'primary' }),
                      enabled: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-slate-700">Enable CTA</span>
            </label>
          </div>

          {navigation.cta?.enabled && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={navigation.cta?.text || ''}
                    onChange={(e) =>
                      setNavigation({
                        ...navigation,
                        cta: {
                          ...(navigation.cta || { enabled: true, url: '', style: 'primary' }),
                          text: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all"
                    placeholder="e.g., Get Started, Contact Us"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    CTA Button URL
                  </label>
                  <input
                    type="url"
                    value={navigation.cta?.url || ''}
                    onChange={(e) =>
                      setNavigation({
                        ...navigation,
                        cta: {
                          ...(navigation.cta || { enabled: true, text: '', style: 'primary' }),
                          url: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all"
                    placeholder="https://example.com/contact"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Button Style
                </label>
                <select
                  value={navigation.cta?.style || 'primary'}
                  onChange={(e) =>
                    setNavigation({
                      ...navigation,
                      cta: {
                        ...(navigation.cta || { enabled: true, text: '', url: '' }),
                        style: e.target.value as 'primary' | 'secondary' | 'outline',
                      },
                    })
                  }
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all"
                >
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                  <option value="outline">Outline</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Navigation Menu</h2>
            <Button onClick={addNavItem} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>

          {websiteId && (
            <div className="mb-4 p-2 bg-slate-50 border border-slate-200 rounded text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 font-medium">Website ID:</span>
                  <code className="ml-2 font-mono text-slate-700 break-all">
                    {websiteId}
                  </code>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">API Route:</span>
                  <code className="ml-2 font-mono text-slate-700 break-all">
                    /api/navigation/{websiteId}/nav
                  </code>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {navigation.nav?.items && navigation.nav.items.length > 0 ? (
              navigation.nav.items.map((item) => (
                <NavItemEditor
                  key={item.id}
                  item={item}
                  level={0}
                  onUpdate={updateNavItem}
                  onDelete={deleteNavItem}
                  onAddChild={addNavChild}
                  onDragStart={(e, itemId) => handleNavDragStart(e, itemId)}
                  onDragOver={handleNavDragOver}
                  onDrop={(e, targetId) => handleNavDrop(e, targetId)}
                  onDragEnd={handleNavDragEnd}
                  isDragging={draggedItemId === item.id}
                />
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 border border-slate-200 rounded-lg bg-slate-50">
                <p className="mb-4">No navigation items yet.</p>
                <Button onClick={addNavItem} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Item
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Footer Columns</h2>
            <Button onClick={addFooterColumn} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Column
            </Button>
          </div>

          {websiteId && (
            <div className="mb-4 p-2 bg-slate-50 border border-slate-200 rounded text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 font-medium">Website ID:</span>
                  <code className="ml-2 font-mono text-slate-700 break-all">
                    {websiteId}
                  </code>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">API Route:</span>
                  <code className="ml-2 font-mono text-slate-700 break-all">
                    /api/navigation/{websiteId}/footer
                  </code>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {navigation.footer?.columns && navigation.footer.columns.length > 0 ? (
              navigation.footer.columns.map((column) => (
                <div
                  key={column.id}
                  className={`border border-slate-200 rounded-lg p-4 bg-slate-50 transition ${
                    draggedColumnId === column.id ? 'opacity-50' : ''
                  }`}
                  onDragOver={handleFooterColumnDragOver}
                  onDrop={(e) => handleFooterColumnDrop(e, column.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 flex-1">
                      <div
                        draggable
                        onDragStart={(e) => handleFooterColumnDragStart(e, column.id)}
                        onDragEnd={handleFooterColumnDragEnd}
                        className="cursor-move"
                      >
                        <GripVertical className="w-5 h-5 text-slate-400 shrink-0" />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={column.title}
                          onChange={(e) =>
                            updateFooterColumn(column.id, 'title', e.target.value)
                          }
                          className="text-lg font-semibold text-slate-900 bg-transparent border-b-2 border-transparent hover:border-slate-300 focus:border-purple-500 focus:outline-none px-1 py-1.5 transition-colors"
                          placeholder="Column Title"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => addFooterItem(column.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Item
                      </Button>
                      <Button
                        onClick={() => deleteFooterColumn(column.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {column.items && column.items.length > 0 ? (
                      column.items.map((item) => (
                        <NavItemEditor
                          key={item.id}
                          item={item}
                          level={0}
                          onUpdate={(id, field, value) =>
                            updateFooterItem(column.id, id, field, value)
                          }
                          onDelete={(id) => deleteFooterItem(column.id, id)}
                          onAddChild={(parentId) =>
                            addFooterChild(column.id, parentId)
                          }
                          onDragStart={(e, itemId) => handleFooterItemDragStart(e, itemId, column.id)}
                          onDragOver={handleFooterItemDragOver}
                          onDrop={(e, targetId) => handleFooterItemDrop(e, targetId, column.id)}
                          onDragEnd={handleFooterItemDragEnd}
                          isDragging={draggedFooterItemId === item.id}
                        />
                      ))
                    ) : (
                      <div className="text-center py-4 text-slate-500 border border-slate-200 rounded-lg bg-white">
                        <p className="mb-2 text-sm">No items in this column.</p>
                        <Button
                          onClick={() => addFooterItem(column.id)}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Item
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 border border-slate-200 rounded-lg bg-slate-50">
                <p className="mb-4">No footer columns yet.</p>
                <Button onClick={addFooterColumn} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Column
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

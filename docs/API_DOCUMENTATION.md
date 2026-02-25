# API Documentation

This document describes the API endpoints for fetching data from the database.

## Pages API

### Base URL
All page endpoints are prefixed with `/api/pages`

## Endpoints

### 1. Get All Pages
**GET** `/api/pages`

Fetches all pages with optional filtering.

#### Query Parameters
- `published` (boolean, optional): Filter by published status
  - `true`: Only published pages
  - `false`: Only draft pages
  - Omitted: All pages
- `website_id` (string, optional): Filter by specific website ID

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "page-id",
      "website_id": "website-id",
      "slug": "page-slug",
      "title": "Page Title",
      "is_published": true,
      "meta_title": "Meta Title",
      "meta_description": "Meta Description",
      "order_index": 0,
      "sections": [...]
    }
  ],
  "count": 10,
  "query": "SELECT * FROM pages WHERE website_id IN (...) ORDER BY order_index ASC;"
}
```

#### Examples
```javascript
// Get all pages
const response = await fetch('/api/pages');
const data = await response.json();

// Get only published pages
const response = await fetch('/api/pages?published=true');
const data = await response.json();

// Get pages for a specific website
const response = await fetch('/api/pages?website_id=website-123');
const data = await response.json();
```

---

### 2. Get Page by ID
**GET** `/api/pages/[id]`

Fetches a single page by its unique ID.

#### Path Parameters
- `id` (string, required): The page ID

#### Response
```json
{
  "success": true,
  "data": {
    "id": "page-id",
    "website_id": "website-id",
    "slug": "page-slug",
    "title": "Page Title",
    "is_published": true,
    "meta_title": "Meta Title",
    "meta_description": "Meta Description",
    "order_index": 0,
    "sections": [...]
  },
  "query": "SELECT * FROM pages WHERE id = 'page-id' AND website_id = 'website-id' LIMIT 1;"
}
```

#### Error Responses
- `400`: Page ID is required
- `404`: Page not found
- `500`: Internal server error

#### Example
```javascript
const response = await fetch('/api/pages/abc123-def456');
const data = await response.json();

if (data.success) {
  console.log(data.data);
  console.log('SQL Query:', data.query);
}
```

---

### 3. Get Section by ID
**GET** `/api/pages/[id]/sections/[sectionId]`

Fetches a specific section from a page by section ID.

#### Path Parameters
- `id` (string, required): The page ID
- `sectionId` (string, required): The section ID

#### Response
```json
{
  "success": true,
  "data": {
    "pageId": "page-id",
    "websiteId": "website-id",
    "section": {
      "id": "section-id",
      "component_type": "hero",
      "title": "Hero Section",
      "content": {
        "fields": [...]
      },
      "order_index": 0,
      "is_visible": true
    }
  }
}
```

#### Error Responses
- `400`: Page ID or Section ID is required
- `404`: Page not found or Section not found
- `500`: Internal server error

#### Example
```javascript
const pageId = 'abc123';
const sectionId = 'section-456';
const response = await fetch(`/api/pages/${pageId}/sections/${sectionId}`);
const data = await response.json();

if (data.success) {
  console.log(data.data.section);
}
```

---

### 2. Get Navigation Menu (Nav Only)
**GET** `/api/navigation/[websiteId]/nav`

Fetches only the navigation menu items for a specific website.

#### Path Parameters
- `websiteId` (string, required): The website ID

#### Response
```json
{
  "success": true,
  "data": {
    "websiteId": "website-id",
    "nav": {
      "items": [
        {
          "id": "item-id",
          "label": "Home",
          "url": "/",
          "order_index": 0,
          "children": []
        }
      ]
    }
  },
  "query": "SELECT id, navigation->'nav' as nav FROM websites WHERE id = 'website-id' LIMIT 1;"
}
```

#### Error Responses
- `400`: Website ID is required
- `404`: Website not found
- `500`: Internal server error

#### Example
```javascript
const websiteId = 'abc123';
const response = await fetch(`/api/navigation/${websiteId}/nav`);
const data = await response.json();

if (data.success) {
  console.log(data.data.nav);
  console.log('SQL Query:', data.query);
}
```

---

### 3. Get Footer Columns (Footer Only)
**GET** `/api/navigation/[websiteId]/footer`

Fetches only the footer columns for a specific website.

#### Path Parameters
- `websiteId` (string, required): The website ID

#### Response
```json
{
  "success": true,
  "data": {
    "websiteId": "website-id",
    "footer": {
      "columns": [
        {
          "id": "column-id",
          "title": "Column Title",
          "items": [
            {
              "id": "item-id",
              "label": "Item Label",
              "url": "/",
              "order_index": 0
            }
          ],
          "order_index": 0
        }
      ]
    }
  },
  "query": "SELECT id, navigation->'footer' as footer FROM websites WHERE id = 'website-id' LIMIT 1;"
}
```

#### Error Responses
- `400`: Website ID is required
- `404`: Website not found
- `500`: Internal server error

#### Example
```javascript
const websiteId = 'abc123';
const response = await fetch(`/api/navigation/${websiteId}/footer`);
const data = await response.json();

if (data.success) {
  console.log(data.data.footer);
  console.log('SQL Query:', data.query);
}
```

---

## Usage in React Components

### Server Component Example
```typescript
// app/page.tsx
export default async function HomePage() {
  // You need the page ID to fetch via API
  const pageId = 'your-page-id-here';
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/pages/${pageId}`, {
    cache: 'no-store' // or 'force-cache' for static pages
  });
  
  const { data, query } = await response.json();
  
  return (
    <div>
      <h1>{data.title}</h1>
      {/* Render sections */}
    </div>
  );
}
```

### Client Component Example
```typescript
'use client';

import { useEffect, useState } from 'react';

export default function PageComponent({ pageId }: { pageId: string }) {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPage() {
      try {
        const response = await fetch(`/api/pages/${pageId}`);
        const result = await response.json();
        
        if (result.success) {
          setPage(result.data);
        }
      } catch (error) {
        console.error('Error fetching page:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPage();
  }, [pageId]);

  if (loading) return <div>Loading...</div>;
  if (!page) return <div>Page not found</div>;

  return (
    <div>
      <h1>{page.title}</h1>
      {/* Render page content */}
    </div>
  );
}
```

---

## SQL Query Information

All API responses include a `query` field that shows the SQL query used to fetch the data. This is useful for:
- Debugging
- Understanding how data is filtered
- Database optimization
- Documentation

The queries respect:
- Institution filtering (via `INSTITUTION_ID` environment variable)
- Website filtering (via `website_id` parameter)
- Published status filtering

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message here"
}
```

Common HTTP status codes:
- `400`: Bad Request (missing required parameters)
- `404`: Not Found (page doesn't exist)
- `500`: Internal Server Error (server-side error)

---

## Notes

1. **Page Access**: Use the page ID endpoint (`/api/pages/[id]`) to fetch pages. This works for both published and draft pages.

2. **Institution Filtering**: If `INSTITUTION_ID` is configured, pages are automatically filtered by the institution's websites.

3. **Caching**: Consider using Next.js caching strategies for better performance:
   - `cache: 'force-cache'` for static pages
   - `cache: 'no-store'` for dynamic content
   - `revalidate: 3600` for ISR (Incremental Static Regeneration)

4. **Security**: These endpoints are public. Add authentication if you need to restrict access.

---

## Navigation API

### Base URL
Navigation endpoint is at `/api/navigation`

### Get Navigation Data
**GET** `/api/navigation`

Fetches navigation data (menu and footer) for the website.

#### Query Parameters
- `website_id` (string, optional): Filter by specific website ID. If not provided, uses `INSTITUTION_ID` to find the website.

#### Response
```json
{
  "success": true,
  "data": {
    "websiteId": "website-id",
    "navigation": {
      "logo": "https://example.com/logo.png",
      "nav": {
        "items": [
          {
            "id": "item-id",
            "label": "Home",
            "url": "/",
            "order_index": 0,
            "children": []
          }
        ]
      },
      "footer": {
        "columns": [
          {
            "id": "column-id",
            "title": "Column Title",
            "items": [],
            "order_index": 0
          }
        ]
      }
    }
  },
  "query": "SELECT id, navigation FROM websites WHERE id = 'website-id' LIMIT 1;"
}
```

#### Error Responses
- `404`: Website not found
- `500`: Internal server error

#### Example
```javascript
// Get navigation (uses INSTITUTION_ID)
const response = await fetch('/api/navigation');
const data = await response.json();

// Get navigation for specific website
const response = await fetch('/api/navigation?website_id=website-123');
const data = await response.json();
```

#### Usage in React Components
```typescript
'use client';

import { useEffect, useState } from 'react';

export default function NavigationComponent() {
  const [navigation, setNavigation] = useState(null);

  useEffect(() => {
    async function fetchNavigation() {
      try {
        const response = await fetch('/api/navigation');
        const result = await response.json();
        
        if (result.success) {
          setNavigation(result.data.navigation);
        }
      } catch (error) {
        console.error('Error fetching navigation:', error);
      }
    }
    
    fetchNavigation();
  }, []);

  if (!navigation) return null;

  return (
    <nav>
      {navigation.nav.items.map(item => (
        <a key={item.id} href={item.url}>{item.label}</a>
      ))}
    </nav>
  );
}
```

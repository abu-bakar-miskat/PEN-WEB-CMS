# Admin Panel User Manual

## Getting Started

### Login
1. Go to `/admin/login`
2. Enter your email and password
3. Click "Sign In"

### Sign Out
Click "Sign Out" at the bottom of the sidebar.

---

## Dashboard

The dashboard shows:
- **App Pages**: Count of pages in your app folder
- **Database Pages**: Count of pages in the database

**Quick Actions:**
- Click "New Page" to create a page
- Click "Manage Navigation" to configure navigation

---

## Managing Pages

### View All Pages
1. Click **"Database Pages"** in the sidebar
2. See all pages with their status (Published/Draft)

### Create a New Page
1. Click **"Add New Page"** or **"New Page"** button
2. Fill in the page details (see Page Editor below)
3. Click **"Save Page"**

### Edit a Page
1. Go to **Database Pages**
2. Click the **Edit** icon (pencil) next to the page
3. Make changes and click **"Save Page"**

### Publish/Unpublish
- Click the **Eye** icon to toggle publish status
- Published pages are visible to visitors
- Draft pages are only visible in admin

### Delete a Page
Click the **Trash** icon next to the page (cannot be undone).

---

## Page Editor

### Page Information
At the top of the page editor, you'll see:
- **Page ID**: Unique identifier for the page
- **Website ID**: The website this page belongs to
- **API Routes**: 
  - `GET /api/pages/{pageId}` - Fetch this page's data

### Page Settings
Fill in these fields at the top:
- **Website**: Select the website
- **Page Title**: Title of the page
- **Slug**: URL path (e.g., `about-us` creates `/about-us`)
- **Meta Title**: SEO title
- **Meta Description**: SEO description
- **Order Index**: Lower numbers appear first
- **Published**: Toggle to publish/unpublish
- **Create Page File**: Option to generate a page file

### Sections

Pages are made up of **Sections**. Each section can have multiple **Fields**.

#### Section Information
Each section displays:
- **Section ID**: Unique identifier for the section
- **API Route**: `GET /api/pages/{pageId}/sections/{sectionId}` - Fetch this section's data

#### Add a Section
1. Scroll to "Sections"
2. Click **"Add Section"**
3. Select a Component Type
4. The section appears on your page

#### Manage Sections
- Click section header to expand/collapse
- Use eye icon to show/hide sections
- Drag by grip icon (⋮⋮) to reorder
- Click trash icon to delete

#### Add Fields to a Section
1. Expand the section
2. Click **"Add Field"**
3. Select field type:
   - **Plain Text**: Single-line text
   - **Text Area**: Multi-line text
   - **Rich Text**: Formatted text with toolbar
   - **Link**: URL (use `/about` for internal links or full URL)
   - **Number**: Numeric value
   - **Image**: Upload image (PNG, JPG, GIF, WebP, SVG)
   - **PDF**: Upload PDF file
   - **Video**: Video URL
   - **Repeatable Items**: Groups of fields that repeat

4. Fill in the field:
   - **Name**: Field label
   - **Value**: Content
   - **Required**: Mark if needed

#### Edit/Remove Fields
- Click field to edit
- Use formatting toolbar for rich text
- Click trash icon to remove

### Rich Text Editor
Use the toolbar for:
- **Bold**, **Italic**, **Underline**
- Text alignment (left, center, right, justify)
- Add links and images

### Image Upload
1. Click **"Upload"** or image area
2. Select image file
3. Preview appears automatically
4. Click **X** to remove

### Repeatable Items
Create lists of similar content (e.g., team members, features):
1. Add field with type **"Repeatable Items"**
2. Click **"Add Item"** for each entry
3. Configure fields for each item
4. Drag to reorder, trash to delete

### Save
Click **"Save Page"** at the top to save changes.

---

## Navigation Management

Click **"Navigation"** in the sidebar to manage menu and footer.

### Navigation Information
At the top of the navigation page, you'll see:
- **Website ID**: The website identifier
- **API Route**: `GET /api/navigation?website_id={websiteId}` - Fetch full navigation data

### Navigation Menu

#### Menu API Information
In the Navigation Menu section, you'll see:
- **Website ID**: The website identifier
- **API Route**: `GET /api/navigation/{websiteId}/nav` - Fetch only navigation menu items

#### Add Menu Item
1. Click **"Add Item"**
2. Enter:
   - **Label**: Menu text
   - **URL**: Link (use `/about` for internal or full URL)
   - **Logo**: Optional icon/image
3. Click **"Add"**

#### Create Submenu
1. Add a parent menu item
2. Click **"Add Child"** on the parent
3. Fill in child item details

#### Manage Menu Items
- Drag by grip icon (⋮⋮) to reorder
- Click item to expand and edit
- Click trash icon to delete

### Footer

#### Footer API Information
In the Footer Columns section, you'll see:
- **Website ID**: The website identifier
- **API Route**: `GET /api/navigation/{websiteId}/footer` - Fetch only footer columns

#### Add Footer Column
1. Click **"Add Column"**
2. Enter column title
3. Click **"Add"**

#### Add Links to Column
1. Expand a footer column
2. Click **"Add Item"**
3. Enter label and URL
4. Click **"Add"**

#### Manage Footer
- Drag links to reorder within column
- Drag columns to reorder
- Click item to edit
- Click trash icon to delete

### Logo Upload
1. Click **"Upload"** in Logo section
2. Select image file
3. Click **X** to remove

### Save Navigation
Click **"Save Navigation"** at the top. Changes appear immediately on your website.

---

## Common Issues

### Can't Log In
- Check email and password
- Contact administrator if needed

### Page Won't Save
- Check internet connection
- Fill all required fields
- Refresh and try again

### Image Won't Upload
- Check file size (under 5MB recommended)
- Use supported formats: PNG, JPG, GIF, WebP, SVG
- Check internet connection

### Navigation Not Updating
- Make sure you clicked "Save Navigation"
- Clear browser cache

### Page Not Visible After Publishing
- Check the slug is correct
- Verify page is assigned to correct website
- Clear website cache

---

## API Access

The admin panel displays API routes for easy access to your data:

### Pages API
- **All Pages**: `GET /api/pages` - Get all pages (with optional filters)
- **Page by ID**: `GET /api/pages/{pageId}` - Get a specific page
- **Section by ID**: `GET /api/pages/{pageId}/sections/{sectionId}` - Get a specific section

### Navigation API
- **Full Navigation**: `GET /api/navigation?website_id={websiteId}` - Get complete navigation data
- **Nav Only**: `GET /api/navigation/{websiteId}/nav` - Get only navigation menu items
- **Footer Only**: `GET /api/navigation/{websiteId}/footer` - Get only footer columns

All API routes are displayed in the admin panel for easy reference. Use these endpoints to fetch data programmatically in your applications.

---

## Tips

- Use relative paths like `/about` for internal links
- Save frequently while editing
- Preview pages before publishing
- Keep navigation simple (5-7 main items)
- Optimize images before uploading
- Use API routes to fetch data in your frontend applications
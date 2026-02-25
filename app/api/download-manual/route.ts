import { readFile } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const manualPath = join(process.cwd(), 'docs', 'ADMIN_PANEL_USER_MANUAL.md');
    const content = await readFile(manualPath, 'utf-8');
    
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': 'attachment; filename="ADMIN_PANEL_USER_MANUAL.md"',
      },
    });
  } catch (error) {
    console.error('Error reading manual:', error);
    return NextResponse.json(
      { error: 'Manual not found' },
      { status: 404 }
    );
  }
}

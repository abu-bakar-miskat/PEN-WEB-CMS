'use client';

import { useState } from 'react';
import { FileText, CheckCircle2, XCircle, Folder, Layout, ExternalLink, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface AppPage {
  route: string;
  name: string;
  hasPageFile: boolean;
  isFolder: boolean;
}

interface DbPage {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  order_index: number;
}

interface PagesTabsProps {
  appPages: AppPage[];
  dbPages: DbPage[];
}

export default function PagesTabs({ appPages, dbPages }: PagesTabsProps) {
  const [activeTab, setActiveTab] = useState<'pages' | 'database'>('pages');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 rounded-t-xl">
        <div className="flex">
          <button
            onClick={() => setActiveTab('pages')}
            className={`px-6 py-4 font-medium text-base transition-all duration-200 relative ${
              activeTab === 'pages'
                ? 'text-purple-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-2">
              <Layout className="w-4 h-4" />
              App Pages
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                activeTab === 'pages'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {appPages.length}
              </span>
            </span>
            {activeTab === 'pages' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`px-6 py-4 font-medium text-base transition-all duration-200 relative ${
              activeTab === 'database'
                ? 'text-purple-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Database Pages
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                activeTab === 'database'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {dbPages.length}
              </span>
            </span>
            {activeTab === 'database' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
            )}
          </button>
        </div>
      </div>
              
      <div className="p-6">
        {activeTab === 'pages' ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-1.5 tracking-tight">
                  App Folder Pages
                </h3>
                <p className="text-sm text-slate-600">Pages detected in your app directory</p>
              </div>
            </div>
            {appPages.length > 0 ? (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {appPages.map((page, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-lg transition"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`p-2 rounded-lg ${
                        page.hasPageFile ? 'bg-green-100 hover:bg-green-100' : 'bg-orange-100 hover:bg-orange-100'
                      }`}>
                        {page.hasPageFile ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-orange-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <p className="text-base font-semibold text-slate-900 truncate">{page.name}</p>
                          {!page.hasPageFile && (
                            <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-100 hover:bg-yellow-100 text-yellow-700 font-medium">
                              No page.tsx
                            </span>
                          )}
                          {page.isFolder && (
                            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 hover:bg-blue-100 text-blue-700 font-medium flex items-center gap-1">
                              <Folder className="w-3 h-3" />
                              Folder
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 font-mono truncate">
                          {page.route === '/' ? '/' : page.route}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={page.route === '/' ? '/' : page.route}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-400 rounded-lg transition"
                      title="View page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
                <Layout className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No pages found in app folder</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-1.5 tracking-tight">
                  Database Pages
                </h3>
                <p className="text-sm text-slate-600">Pages managed in your database</p>
              </div>
              <Link
                href="/admin/pages/new"
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow"
              >
                <Plus className="w-4 h-4" />
                New Page
              </Link>
            </div>
            {dbPages.length > 0 ? (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {dbPages.map((page) => (
                  <Link
                    key={page.id}
                    href={`/admin/pages/${page.id}`}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-lg transition group"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 rounded-lg bg-purple-100 hover:bg-purple-100">
                        <FileText className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <p className="text-base font-semibold text-slate-900 truncate transition-colors">
                            {page.title}
                          </p>
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                              page.is_published
                                ? 'bg-green-100 hover:bg-green-100 text-green-700'
                                : 'bg-slate-100 hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            {page.is_published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-sm text-slate-500 font-mono truncate">
                            /{page.slug}
                          </p>
                          <span className="text-sm text-slate-400">•</span>
                          <span className="text-sm text-slate-500">Order: {page.order_index}</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 transition-colors" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500 font-medium mb-4">No pages found in database</p>
                <Link
                  href="/admin/pages/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium shadow-sm hover:shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Create First Page
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

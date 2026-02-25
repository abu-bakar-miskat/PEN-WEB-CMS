'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, X, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deletePage } from '@/app/admin/actions/pages';

interface DeletePageButtonProps {
  pageId: string;
  pageTitle: string;
}

export default function DeletePageButton({ pageId, pageTitle }: DeletePageButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deletePage(pageId);
      if (result.error) {
        alert(result.error);
        setIsDeleting(false);
        return;
      }
      router.refresh();
      setShowModal(false);
    } catch (error) {
      console.error('Error deleting page:', error);
      alert('Failed to delete page. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowModal(true)}
      >
        <Trash2 className="w-4 h-4 text-red-500" />
      </Button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !isDeleting && setShowModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full mx-4 z-50">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    Delete Page
                  </h3>
                  <p className="text-sm text-slate-600">
                    Are you sure you want to delete this page? This action cannot be undone.
                  </p>
                </div>
                {!isDeleting && (
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Page Info */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-6">
                <p className="text-sm font-medium text-slate-900">{pageTitle}</p>
                <p className="text-xs text-slate-500 mt-1">ID: {pageId}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Page
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

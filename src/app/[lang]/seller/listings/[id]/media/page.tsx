// src/app/[lang]/seller/listings/[id]/media/page.tsx
'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { propertyService } from '@/services/property.service';
import { Property } from '@/types/property.types';

export default function MediaManagementPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const resolvedParams = use(params);
  const { lang, id } = resolvedParams;
  const router = useRouter();

  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchProperty = async () => {
    try {
      const data = await propertyService.getPropertyById(id);
      setProperty(data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load property');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    setIsUploading(true);
    setErrorMsg(null);
    try {
      await propertyService.uploadImages(id, formData);
      await fetchProperty(); // Refresh the list
    } catch (err: any) {
      setErrorMsg(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      // reset input
      e.target.value = '';
    }
  };

  const handleDelete = async (mediaId: string) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      await propertyService.deleteMedia(id, mediaId);
      await fetchProperty();
    } catch (err) {
      alert('Failed to delete image');
    }
  };

  if (isLoading) return <div className="p-10 text-center">Loading...</div>;
  if (!property) return <div className="p-10 text-center text-red-500">{errorMsg}</div>;

  const standardImages = property.media?.filter(m => !m.is_tour_scene) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Manage Photos</h1>
          <p className="text-sm text-neutral-500">{property.title_en}</p>
        </div>
        <Link href={`/${lang}/seller/dashboard`} className="text-sm text-blue-500 hover:underline">
          &larr; Back to Dashboard
        </Link>
      </div>

      {errorMsg && (
        <div className="p-4 mb-6 bg-red-100 text-red-700 rounded border border-red-200">
          {errorMsg}
        </div>
      )}

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Standard Images ({standardImages.length})</h2>
          <label className={`px-4 py-2 rounded-lg text-white font-bold text-sm cursor-pointer transition ${isUploading ? 'bg-neutral-500' : 'bg-red-600 hover:bg-red-500'}`}>
            {isUploading ? 'Uploading...' : 'Upload Photos'}
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {standardImages.length === 0 ? (
            <div className="col-span-full py-12 text-center text-neutral-500">
              No photos uploaded yet. These photos will appear in the home page gallery.
            </div>
          ) : (
            standardImages.map((media) => (
              <div key={media.id} className="relative group aspect-[4/3] rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800">
                <img src={media.file_url} alt="Property" className="w-full h-full object-cover" />
                <button
                  onClick={() => handleDelete(media.id)}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition"
                  title="Delete image"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// src/app/[lang]/seller/listings/[id]/page.tsx
'use client';

import React, { useState, useEffect, use, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { propertyService } from '@/services/property.service';
import { tourService } from '@/services/tour.service';
import { Property, PropertyCategory, TransactionType } from '@/types/property.types';
import { TourConfig, PannellumHotSpot } from '@/types/tour.types';
import { ETHIOPIAN_LOCATIONS } from '@/utils/location';
import { formatCurrency } from '@/utils/currency';
import { PannellumViewer } from '@/components/3d-tour/PannellumViewer';
import { HotspotOverlay } from '@/components/3d-tour/HotspotOverlay';
import { SceneSelectorToolbar } from '@/components/3d-tour/SceneSelectorToolbar';
import { DoorOpen, Info, Pencil, X, CheckCircle, Save, ChevronDown, ChevronUp } from 'lucide-react';

const CATEGORIES: { value: PropertyCategory; label: string }[] = [
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'HOUSE', label: 'House / Villa' },
  { value: 'LAND', label: 'Land Plot' },
  { value: 'COMMERCIAL', label: 'Commercial Space' },
  { value: 'OFFICE', label: 'Office' },
  { value: 'WAREHOUSE', label: 'Warehouse' },
  { value: 'VACATION', label: 'Vacation / Short-Stay' },
];

const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const base = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
};

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300',
  PENDING: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  PENDING_UPDATE: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  APPROVED: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400',
  SUSPENDED: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400',
};

type Mode = 'read' | 'edit';
type Section = 'details' | 'photos' | 'tour';

interface DraftModalState {
  open: boolean;
  existingDraft: Property | null;
}

export default function ListingManagerPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang: rawLang, id } = use(params);
  const lang = rawLang === 'am' ? 'am' : 'en';
  const router = useRouter();

  const [property, setProperty] = useState<Property | null>(null);
  const [workingId, setWorkingId] = useState<string>(id);
  const [mode, setMode] = useState<Mode>('read');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [globalMsg, setGlobalMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [openSections, setOpenSections] = useState<Record<Section, boolean>>({ details: true, photos: true, tour: true });
  const [draftModal, setDraftModal] = useState<DraftModalState>({ open: false, existingDraft: null });
  const [draftModalLoading, setDraftModalLoading] = useState(false);

  const [form, setForm] = useState({
    title_en: '', title_am: '', description_en: '', description_am: '',
    price_etb: '', transaction_mode: 'SALE' as TransactionType,
    category: 'APARTMENT' as PropertyCategory,
    region: 'Addis Ababa', sub_city: '', woreda: '', nearest_landmark: '',
    bedrooms: '1', bathrooms: '1', area_sqm: '',
  });

  const [isUploading, setIsUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [tourConfig, setTourConfig] = useState<TourConfig | null>(null);
  const [activeSceneId, setActiveSceneId] = useState('');
  const [isTourSaving, setIsTourSaving] = useState(false);
  const [tourMsg, setTourMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hotspotModal, setHotspotModal] = useState<{ isOpen: boolean; yaw: number; pitch: number }>({ isOpen: false, yaw: 0, pitch: 0 });
  const [replacingSceneId, setReplacingSceneId] = useState<string | null>(null);
  const tourFileInputRef = useRef<HTMLInputElement>(null);
  const [tourFullscreen, setTourFullscreen] = useState(false);

  const loadProperty = useCallback(async (propertyId: string, retries = 3): Promise<any> => {
    try {
      const data = await propertyService.getPropertyById(propertyId);
      setProperty(data);
      setWorkingId(propertyId);
      setLoadError(null);
      setForm({
        title_en: data.title_en || '', title_am: data.title_am || '',
        description_en: data.description_en || '', description_am: data.description_am || '',
        price_etb: String(data.price_etb || ''), transaction_mode: data.transaction_mode || 'SALE',
        category: data.category || 'APARTMENT', region: data.region || 'Addis Ababa',
        sub_city: data.sub_city || '', woreda: data.woreda || '',
        nearest_landmark: data.nearest_landmark || '',
        bedrooms: String(data.bedrooms || '1'), bathrooms: String(data.bathrooms || '1'),
        area_sqm: String(data.area_sqm || ''),
      });
      return data;
    } catch (err: any) {
      const is404 = err?.response?.status === 404 || err?.status === 404;
      if (!is404 && retries > 0) {
        // Non-404 error (e.g. timeout / cold-start) — wait 2s then retry
        await new Promise(r => setTimeout(r, 2000));
        return loadProperty(propertyId, retries - 1);
      }
      throw err;
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    loadProperty(id)
      .catch((err: any) => {
        const is404 = err?.response?.status === 404 || err?.status === 404;
        setLoadError(is404 ? 'This property does not exist or has been deleted.' : 'Could not reach the server. Please check your connection and try again.');
      })
      .finally(() => setIsLoading(false));
  }, [id, loadProperty]);

  const loadTourConfig = useCallback(async (propertyId: string) => {
    try {
      const config = await tourService.getTourConfig(propertyId);
      if (config?.scenes && Object.keys(config.scenes).length > 0) {
        setTourConfig(config);
        setActiveSceneId(prev =>
          (!prev || !config.scenes[prev])
            ? (config.default?.firstScene ?? Object.keys(config.scenes)[0])
            : prev
        );
      } else {
        setTourConfig({ default: { firstScene: '', sceneFadeDuration: 1000 }, scenes: {} });
        setActiveSceneId('');
      }
    } catch {
      setTourConfig({ default: { firstScene: '', sceneFadeDuration: 1000 }, scenes: {} });
      setActiveSceneId('');
    }
  }, []);

  useEffect(() => { if (workingId) loadTourConfig(workingId); }, [workingId, loadTourConfig]);

  const enterEditMode = useCallback(async () => {
    if (!property) return;
    if (['DRAFT', 'PENDING_UPDATE'].includes(property.status)) {
      setMode('edit');
      return;
    }
    if (property.status === 'APPROVED') {
      setDraftModalLoading(true);
      try {
        const existingDraft = await propertyService.getExistingDraft(id);
        if (existingDraft) {
          setDraftModal({ open: true, existingDraft });
        } else {
          const draft = await propertyService.createDraftClone(id);
          await loadProperty(draft.id);
          await loadTourConfig(draft.id);
          setMode('edit');
        }
      } catch {
        setGlobalMsg({ type: 'error', text: 'Failed to prepare draft. Please try again.' });
      } finally {
        setDraftModalLoading(false);
      }
    }
  }, [property, id, loadProperty, loadTourConfig]);

  const handleContinueEditing = useCallback(async () => {
    try {
      const draft = draftModal.existingDraft!;
      setDraftModal({ open: false, existingDraft: null });
      await loadProperty(draft.id);
      await loadTourConfig(draft.id);
      setMode('edit');
    } catch (err: any) {
      console.error(err);
      setGlobalMsg({ type: 'error', text: 'Error loading draft: ' + err.message });
    }
  }, [draftModal.existingDraft, loadProperty, loadTourConfig]);

  const handleDiscardAndFresh = useCallback(async () => {
    const draft = draftModal.existingDraft!;
    setDraftModal({ open: false, existingDraft: null });
    setDraftModalLoading(true);
    try {
      try {
        await propertyService.deleteDraft(draft.id);
      } catch (err: any) {
        // If the draft was already deleted (e.g. approved by admin), ignore the 404
        if (err?.response?.status !== 404 && err?.status !== 404 && !err?.message?.includes('404')) {
          throw err;
        }
      }
      const newDraft = await propertyService.createDraftClone(id);
      await loadProperty(newDraft.id);
      await loadTourConfig(newDraft.id);
      setMode('edit');
    } catch {
      setGlobalMsg({ type: 'error', text: 'Failed to reset draft. Please try again.' });
    } finally {
      setDraftModalLoading(false);
    }
  }, [draftModal.existingDraft, id, loadProperty, loadTourConfig]);

  const handleCancelEdit = useCallback(() => {
    if (!window.confirm('Discard unsaved text changes? Photos and tour changes are already saved to your draft.')) return;
    if (property) {
      setForm({
        title_en: property.title_en || '', title_am: property.title_am || '',
        description_en: property.description_en || '', description_am: property.description_am || '',
        price_etb: String(property.price_etb || ''), transaction_mode: property.transaction_mode || 'SALE',
        category: property.category || 'APARTMENT', region: property.region || 'Addis Ababa',
        sub_city: property.sub_city || '', woreda: property.woreda || '',
        nearest_landmark: property.nearest_landmark || '',
        bedrooms: String(property.bedrooms || '1'), bathrooms: String(property.bathrooms || '1'),
        area_sqm: String(property.area_sqm || ''),
      });
    }
    setMode('read');
  }, [property]);

  const buildPayload = useCallback(() => ({
    title_en: form.title_en.trim(), title_am: form.title_am.trim() || undefined,
    description_en: form.description_en.trim(), description_am: form.description_am.trim() || undefined,
    price_etb: Number(form.price_etb), transaction_mode: form.transaction_mode,
    category: form.category, region: form.region, sub_city: form.sub_city,
    woreda: form.woreda, nearest_landmark: form.nearest_landmark.trim() || undefined,
    bedrooms: Number(form.bedrooms), bathrooms: Number(form.bathrooms), area_sqm: Number(form.area_sqm),
  }), [form]);

  const handleSaveDraft = useCallback(async () => {
    if (!form.title_en.trim()) { setGlobalMsg({ type: 'error', text: 'English title is required.' }); return; }
    setIsSaving(true); setGlobalMsg(null);
    try {
      const updated = await propertyService.updateProperty(workingId, buildPayload());
      setProperty(updated);
      setGlobalMsg({ type: 'success', text: 'Draft saved successfully.' });
    } catch (err: any) {
      setGlobalMsg({ type: 'error', text: err.message || 'Failed to save draft.' });
    } finally { setIsSaving(false); }
  }, [form, workingId, buildPayload]);

  const handleSubmitForReview = useCallback(async () => {
    if (!form.title_en.trim()) { setGlobalMsg({ type: 'error', text: 'English title is required.' }); return; }
    if (!form.price_etb || Number(form.price_etb) <= 0) { setGlobalMsg({ type: 'error', text: 'A valid price is required.' }); return; }
    if (!form.area_sqm || Number(form.area_sqm) <= 0) { setGlobalMsg({ type: 'error', text: 'Property area (m²) is required.' }); return; }
    if (!window.confirm('Save your changes and submit for admin review?')) return;
    setIsSaving(true); setGlobalMsg(null);
    try {
      await propertyService.updateProperty(workingId, buildPayload());
      await propertyService.submitForReview(workingId);
      setGlobalMsg({ type: 'success', text: 'Submitted for review! Redirecting…' });
      setTimeout(() => router.push(`/${lang}/seller/dashboard`), 1500);
    } catch (err: any) {
      setGlobalMsg({ type: 'error', text: err.message || 'Failed to submit.' });
    } finally { setIsSaving(false); }
  }, [form, workingId, buildPayload, router, lang]);

  const handlePhotoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) formData.append('images', files[i]);
    setIsUploading(true); setGlobalMsg(null);
    try {
      await propertyService.uploadImages(workingId, formData);
      const updated = await propertyService.getPropertyById(workingId);
      setProperty(updated);
      setGlobalMsg({ type: 'success', text: 'Photos uploaded successfully.' });
    } catch (err: any) {
      setGlobalMsg({ type: 'error', text: err.message || 'Photo upload failed.' });
    } finally { setIsUploading(false); e.target.value = ''; }
  }, [workingId]);

  const handleDeletePhoto = useCallback(async (mediaId: string) => {
    if (!window.confirm('Delete this photo?')) return;
    try {
      await propertyService.deleteMedia(workingId, mediaId);
      const updated = await propertyService.getPropertyById(workingId);
      setProperty(updated);
    } catch { setGlobalMsg({ type: 'error', text: 'Failed to delete photo.' }); }
  }, [workingId]);

  const handleAddHotspotClick = useCallback((yaw: number, pitch: number) => {
    setHotspotModal({ isOpen: true, yaw, pitch });
  }, []);

  const handleSceneSelect = useCallback((sceneId: string) => {
    if (!tourConfig || sceneId === activeSceneId) return;
    setActiveSceneId(sceneId);
    setTourConfig(prev => prev ? { ...prev, default: { ...prev.default, firstScene: sceneId } } : prev);
  }, [tourConfig, activeSceneId]);

  const handleDeleteHotspot = useCallback(async (hotspotId: string) => {
    if (!window.confirm('Delete this hotspot?')) return;
    setIsTourSaving(true);
    try {
      await tourService.deleteHotspot(hotspotId);
      setTourConfig(prev => {
        if (!prev || !prev.scenes[activeSceneId]) return prev;
        const u = { ...prev, scenes: { ...prev.scenes } };
        u.scenes[activeSceneId] = { ...prev.scenes[activeSceneId], hotSpots: prev.scenes[activeSceneId].hotSpots.filter((h: any) => h.id !== hotspotId) };
        return u;
      });
      setTourMsg({ type: 'success', text: 'Hotspot deleted.' });
    } catch { setTourMsg({ type: 'error', text: 'Failed to delete hotspot.' }); }
    finally { setIsTourSaving(false); }
  }, [activeSceneId]);

  const handleDeleteScene = useCallback(async (sceneId: string) => {
    if (!window.confirm('Delete this scene? All hotspots inside will be lost.')) return;
    setIsTourSaving(true);
    try {
      const scene = tourConfig?.scenes[sceneId];
      if (scene?.hotSpots?.length) {
        await Promise.all(scene.hotSpots.map((hs: any) => hs.id ? tourService.deleteHotspot(hs.id).catch(() => {}) : Promise.resolve()));
      }
      await tourService.deleteScene(workingId, sceneId);
      setTourMsg({ type: 'success', text: 'Scene deleted.' });
      await loadTourConfig(workingId);
    } catch { setTourMsg({ type: 'error', text: 'Failed to delete scene.' }); }
    finally { setIsTourSaving(false); }
  }, [workingId, tourConfig, loadTourConfig]);

  const handleReplaceSceneClick = useCallback((sceneId: string) => {
    if (!window.confirm('This will delete the current 360° photo and all its hotspots. Proceed?')) return;
    setReplacingSceneId(sceneId);
    tourFileInputRef.current?.click();
  }, []);

  const handleTourFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sceneName = prompt(
      replacingSceneId ? 'Enter the new room name:' : 'Enter room name (e.g. Living Room):',
      tourConfig?.scenes[replacingSceneId ?? '']?.title ?? 'Room'
    );
    if (sceneName === null) {
      if (tourFileInputRef.current) tourFileInputRef.current.value = '';
      setReplacingSceneId(null);
      return;
    }
    setIsTourSaving(true); setTourMsg(null);
    try {
      const fd = new FormData(); fd.append('file', file);
      await tourService.uploadPanorama(workingId, fd, sceneName.trim() || 'Room');
      if (replacingSceneId) {
        const scene = tourConfig?.scenes[replacingSceneId];
        if (scene?.hotSpots?.length) {
          await Promise.all(scene.hotSpots.map((hs: any) => hs.id ? tourService.deleteHotspot(hs.id).catch(() => {}) : Promise.resolve()));
        }
        await tourService.deleteScene(workingId, replacingSceneId);
        setTourMsg({ type: 'success', text: 'Scene replaced.' });
      } else {
        setTourMsg({ type: 'success', text: 'Scene uploaded.' });
      }
      await loadTourConfig(workingId);
    } catch { setTourMsg({ type: 'error', text: 'Failed to upload scene.' }); }
    finally {
      setIsTourSaving(false);
      if (tourFileInputRef.current) tourFileInputRef.current.value = '';
      setReplacingSceneId(null);
    }
  }, [workingId, replacingSceneId, tourConfig, loadTourConfig]);

  const handleRenameScene = useCallback(async (sceneId: string, newName: string) => {
    setIsTourSaving(true);
    try {
      await tourService.updateScene(workingId, sceneId, { scene_name: newName });
      setTourMsg({ type: 'success', text: 'Scene renamed.' });
      await loadTourConfig(workingId);
    } catch { setTourMsg({ type: 'error', text: 'Failed to rename scene.' }); }
    finally { setIsTourSaving(false); }
  }, [workingId, loadTourConfig]);

  const handleSaveHotspot = useCallback(async (data: { type: 'NAVIGATION' | 'INFO'; targetSceneId?: string; label?: string }) => {
    if (!tourConfig) return;
    setIsTourSaving(true);
    try {
      let yaw = hotspotModal.yaw % 360;
      if (yaw < 0) yaw += 360;
      const res: any = await tourService.addHotspot({
        scene_id: activeSceneId, type: data.type, yaw, pitch: hotspotModal.pitch,
        target_scene_id: data.targetSceneId, label: data.label,
      });
      const hs = {
        id: res.data?.id, pitch: hotspotModal.pitch, yaw,
        type: data.type === 'NAVIGATION' ? 'scene' : 'info',
        text: data.label ?? (data.type === 'NAVIGATION' ? 'Go to ' + (data.targetSceneId ?? '') : 'Info'),
        sceneId: data.targetSceneId, cssClass: data.type === 'NAVIGATION' ? 'tour-nav-hotspot' : 'tour-info-hotspot',
      } as PannellumHotSpot & { cssClass?: string };
      setTourConfig(prev => {
        if (!prev || !prev.scenes[activeSceneId]) return prev;
        const u = { ...prev, scenes: { ...prev.scenes } };
        u.scenes[activeSceneId] = { ...prev.scenes[activeSceneId], hotSpots: [...prev.scenes[activeSceneId].hotSpots, hs] };
        return u;
      });
      setTourMsg({ type: 'success', text: 'Hotspot saved.' });
    } catch { setTourMsg({ type: 'error', text: 'Failed to save hotspot.' }); }
    finally { setIsTourSaving(false); setHotspotModal({ isOpen: false, yaw: 0, pitch: 0 }); }
  }, [tourConfig, activeSceneId, hotspotModal]);

  const toggleSection = (s: Section) => setOpenSections(prev => ({ ...prev, [s]: !prev[s] }));

  const subCities: import('@/utils/location').SubCityOption[] = ETHIOPIAN_LOCATIONS[form.region]?.subCities || [];
  const standardPhotos = property?.media?.filter(m => !m.is_tour_scene) || [];
  const currentScene = tourConfig?.scenes[activeSceneId];
  const statusLabel = property?.status === 'PENDING_UPDATE' ? 'PENDING UPDATE' : property?.status;
  const isPending = property && ['PENDING', 'PENDING_UPDATE'].includes(property.status);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-neutral-500">Loading listing…</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="text-center max-w-sm px-4">
          <div className="text-4xl mb-3">{loadError?.includes('does not exist') ? '🗑️' : '📡'}</div>
          <p className="text-red-500 font-bold mb-1">
            {loadError?.includes('does not exist') ? 'Property Not Found' : 'Connection Problem'}
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">{loadError}</p>
          {!loadError?.includes('does not exist') && (
            <button
              onClick={() => { setIsLoading(true); loadProperty(id).catch((e: any) => setLoadError(e.message)).finally(() => setIsLoading(false)); }}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-lg transition"
            >
              🔄 Retry
            </button>
          )}
          <button onClick={() => router.push(`/${lang}/seller/dashboard`)} className="ml-3 px-5 py-2.5 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-sm font-semibold rounded-lg transition">
            ← Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Hidden inputs */}
      <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
      <input ref={tourFileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleTourFileSelect} />

      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-40 border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href={`/${lang}/seller/dashboard`} className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition shrink-0">
              ← Dashboard
            </Link>
            <span className="text-neutral-300 dark:text-neutral-600">/</span>
            <h1 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
              {mode === 'read'
                ? (lang === 'am' && property.title_am ? property.title_am : property.title_en)
                : (form.title_en || 'Editing Draft…')}
            </h1>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${STATUS_STYLES[property.status] || ''}`}>
              {statusLabel}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {mode === 'read' ? (
              <button
                onClick={isPending ? undefined : enterEditMode}
                disabled={draftModalLoading || !!isPending}
                title={isPending ? 'This listing is under admin review and cannot be edited right now.' : ''}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 dark:bg-white hover:bg-neutral-700 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {draftModalLoading
                  ? <span className="w-3 h-3 border-2 border-white dark:border-neutral-900 border-t-transparent rounded-full animate-spin" />
                  : <Pencil size={12} />}
                {isPending ? 'Under Review' : 'Edit'}
              </button>
            ) : (
              <>
                <button onClick={handleCancelEdit} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition">
                  <X size={12} /> Cancel
                </button>
                <button onClick={handleSaveDraft} disabled={isSaving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition disabled:opacity-50">
                  <Save size={12} /> Save Draft
                </button>
                <button onClick={handleSubmitForReview} disabled={isSaving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition disabled:opacity-50 shadow-lg shadow-red-600/20">
                  <CheckCircle size={12} /> Submit for Review
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Global message ── */}
      {globalMsg && (
        <div className={`border-b px-4 py-2.5 text-sm font-semibold text-center ${globalMsg.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'}`}>
          {globalMsg.type === 'success' ? '✅' : '❌'} {globalMsg.text}
          <button onClick={() => setGlobalMsg(null)} className="ml-3 text-xs opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* ── Edit mode banner ── */}
      {mode === 'edit' && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800/50 px-4 py-2 text-center text-xs text-amber-700 dark:text-amber-400 font-medium">
          ✏️ Editing a <strong>draft</strong>. Your live listing is untouched until an admin approves this update.
        </div>
      )}

      {/* ── Rejection banner ── */}
      {property.status === 'DRAFT' && property.rejection_info && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-sm space-y-2">
            <div className="flex items-center gap-2 font-bold text-red-700 dark:text-red-400">⚠️ Rejection Feedback — Action Required</div>
            <p className="text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-900 p-3 rounded-xl border border-red-100 dark:border-red-900/30 font-medium">
              "{property.rejection_info.reason}"
            </p>
            <p className="text-xs text-neutral-500">Reviewed by <strong>{property.rejection_info.rejected_by}</strong> · {new Date(property.rejection_info.rejected_at).toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">

        {/* ════ DETAILS ════ */}
        <SectionCard title="📋 Property Details" isOpen={openSections.details} onToggle={() => toggleSection('details')}>
          {mode === 'read' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              <ReadField label="Title (English)" value={property.title_en} />
              <ReadField label="Title (Amharic)" value={property.title_am} />
              <ReadField label="Price" value={`${formatCurrency(Number(property.price_etb), 'ETB', lang)} — ${property.transaction_mode}`} />
              <ReadField label="Category" value={property.category?.replace('_', ' ')} />
              <ReadField label="Region" value={property.region} />
              <ReadField label="Sub-City" value={property.sub_city} />
              <ReadField label="Woreda" value={property.woreda} />
              <ReadField label="Nearest Landmark" value={property.nearest_landmark} />
              <ReadField label="Bedrooms" value={String(property.bedrooms)} />
              <ReadField label="Bathrooms" value={String(property.bathrooms)} />
              <ReadField label="Area" value={`${property.area_sqm} m²`} />
              <div className="sm:col-span-2"><ReadField label="Description (English)" value={property.description_en} large /></div>
              <div className="sm:col-span-2"><ReadField label="Description (Amharic)" value={property.description_am} large /></div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <EditField label="Title (English) *" value={form.title_en} onChange={v => setForm(p => ({ ...p, title_en: v }))} />
                <EditField label="Title (Amharic)" value={form.title_am} onChange={v => setForm(p => ({ ...p, title_am: v }))} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <EditField label="Description (English)" value={form.description_en} onChange={v => setForm(p => ({ ...p, description_en: v }))} textarea />
                <EditField label="Description (Amharic)" value={form.description_am} onChange={v => setForm(p => ({ ...p, description_am: v }))} textarea />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <EditField label="Price (ETB) *" value={form.price_etb} onChange={v => setForm(p => ({ ...p, price_etb: v }))} type="number" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5">Transaction</label>
                  <div className="flex gap-2">
                    {(['SALE', 'RENT'] as TransactionType[]).map(t => (
                      <button key={t} onClick={() => setForm(p => ({ ...p, transaction_mode: t }))}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition ${form.transaction_mode === t ? 'bg-red-600 border-red-600 text-white' : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(c => (
                    <button key={c.value} onClick={() => setForm(p => ({ ...p, category: c.value }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${form.category === c.value ? 'bg-red-600 border-red-600 text-white' : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'}`}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5">Region</label>
                  <select value={form.region} onChange={e => setForm(p => ({ ...p, region: e.target.value, sub_city: '' }))}
                    className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                    {Object.keys(ETHIOPIAN_LOCATIONS).map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5">Sub-City / District</label>
                  {subCities.length > 0 ? (
                    <select value={form.sub_city} onChange={e => setForm(p => ({ ...p, sub_city: e.target.value }))}
                      className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                      <option value="">Select…</option>
                      {subCities.map((sc) => <option key={sc.en} value={sc.en}>{sc.en}</option>)}
                    </select>
                  ) : (
                    <EditField label="" value={form.sub_city} onChange={v => setForm(p => ({ ...p, sub_city: v }))} placeholder="e.g. Merkato" />
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <EditField label="Woreda" value={form.woreda} onChange={v => setForm(p => ({ ...p, woreda: v }))} />
                <EditField label="Nearest Landmark" value={form.nearest_landmark} onChange={v => setForm(p => ({ ...p, nearest_landmark: v }))} placeholder="e.g. Near Dembel Mall" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <EditField label="Bedrooms" value={form.bedrooms} onChange={v => setForm(p => ({ ...p, bedrooms: v }))} type="number" />
                <EditField label="Bathrooms" value={form.bathrooms} onChange={v => setForm(p => ({ ...p, bathrooms: v }))} type="number" />
                <EditField label="Area (m²) *" value={form.area_sqm} onChange={v => setForm(p => ({ ...p, area_sqm: v }))} type="number" />
              </div>
            </div>
          )}
        </SectionCard>

        {/* ════ PHOTOS ════ */}
        <SectionCard title={`🖼️ Photos (${standardPhotos.length})`} isOpen={openSections.photos} onToggle={() => toggleSection('photos')}>
          {standardPhotos.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl">
              <div className="text-4xl mb-3">📷</div>
              <p className="text-sm text-neutral-500 mb-4">No photos uploaded yet.</p>
              {mode === 'edit' && (
                <button onClick={() => photoInputRef.current?.click()} className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-red-600/20 transition">
                  Upload Photos
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {standardPhotos.map(m => (
                <div key={m.id} className="relative group aspect-square rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                  <img 
                    src={getImageUrl(m.file_url)} 
                    alt="" 
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80';
                    }}
                    className="w-full h-full object-cover" 
                  />
                  {mode === 'edit' && (
                    <button onClick={() => handleDeletePhoto(m.id)}
                      className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">🗑 Delete</span>
                    </button>
                  )}
                </div>
              ))}
              {mode === 'edit' && (
                <button onClick={() => photoInputRef.current?.click()} disabled={isUploading}
                  className="aspect-square rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 hover:border-red-400 dark:hover:border-red-600 flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-red-500 transition disabled:opacity-50">
                  {isUploading
                    ? <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    : <><span className="text-3xl leading-none">+</span><span className="text-xs font-semibold">Add Photos</span></>}
                </button>
              )}
            </div>
          )}
        </SectionCard>

        {/* ════ TOUR ════ */}
        <SectionCard
          title="🥽 3D Virtual Tour"
          isOpen={openSections.tour}
          onToggle={() => toggleSection('tour')}
          headerExtra={mode === 'edit' && tourConfig && Object.keys(tourConfig.scenes).length > 0 ? (
            <button onClick={() => { setReplacingSceneId(null); tourFileInputRef.current?.click(); }}
              className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition">
              + Add Scene
            </button>
          ) : undefined}
        >
          {tourMsg && (
            <div className={`mb-3 p-2.5 rounded-lg border text-xs font-semibold ${tourMsg.type === 'success' ? 'bg-emerald-950/50 border-emerald-800 text-emerald-400' : 'bg-red-950/50 border-red-800 text-red-400'}`}>
              {tourMsg.type === 'success' ? '✅' : '❌'} {tourMsg.text}
            </div>
          )}

          {!tourConfig ? (
            <div className="py-12 flex justify-center"><div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : Object.keys(tourConfig.scenes).length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl">
              <div className="text-4xl mb-3">🌐</div>
              <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1">No 3D Tour Yet</p>
              <p className="text-xs text-neutral-500 mb-4">Upload 360° panorama images to build a virtual tour.</p>
              {mode === 'edit' && (
                <button onClick={() => { setReplacingSceneId(null); tourFileInputRef.current?.click(); }}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-red-600/20 transition">
                  Upload First Scene
                </button>
              )}
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
              {mode === 'edit' && (
                <div className="px-3 py-2 bg-amber-950/30 border-b border-amber-800/40 text-xs text-amber-400 font-medium">
                  💡 Double-click the viewer to drop a hotspot pin. Click any pin to delete it.
                </div>
              )}
              <div className="relative">
                <PannellumViewer
                  tourConfig={tourConfig}
                  isEditMode={mode === 'edit'}
                  onAddHotspot={mode === 'edit' ? handleAddHotspotClick : undefined}
                  onSceneChange={setActiveSceneId}
                  onDeleteHotspot={mode === 'edit' ? handleDeleteHotspot : undefined}
                />
                <button onClick={() => setTourFullscreen(true)}
                  className="absolute bottom-3 right-3 z-20 bg-black/60 hover:bg-black/80 text-white text-xs px-2 py-1 rounded-lg transition backdrop-blur-sm">
                  ⛶ Fullscreen
                </button>
              </div>
              {/* Scene selector strip — lives OUTSIDE the viewer so overflow-hidden doesn't clip it */}
              {Object.keys(tourConfig.scenes).length > 1 || mode === 'edit' ? (
                <div className="px-3 py-2 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
                  <SceneSelectorToolbar
                    scenes={Object.entries(tourConfig.scenes).map(([sid, s]) => ({ id: sid, name: s.title ?? sid, thumbnailUrl: s.panorama }))}
                    activeSceneId={activeSceneId}
                    onSelectScene={handleSceneSelect}
                    isEditMode={mode === 'edit'}
                    onDeleteScene={handleDeleteScene}
                    onReplaceScene={handleReplaceSceneClick}
                    onRenameScene={handleRenameScene}
                  />
                </div>
              ) : null}
              {currentScene?.hotSpots && currentScene.hotSpots.length > 0 && (
                <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                  <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-2">
                    Hotspots in <span className="text-red-500">{currentScene.title ?? activeSceneId}</span>:
                  </p>
                  <div className="space-y-1.5">
                    {currentScene.hotSpots.map((hs: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-700 dark:text-neutral-300">
                        {hs.type === 'scene' ? <DoorOpen className="w-4 h-4 text-emerald-500 shrink-0" /> : <Info className="w-4 h-4 text-blue-500 shrink-0" />}
                        <span className="font-medium">{hs.text ?? 'Pin'}</span>
                        <span className="ml-auto font-mono text-neutral-500 shrink-0">P:{hs.pitch?.toFixed(1)}° Y:{hs.yaw?.toFixed(1)}°</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {isTourSaving && (
            <div className="fixed bottom-6 right-6 z-50 bg-white dark:bg-neutral-900 border border-red-600/40 px-4 py-3 rounded-xl flex items-center gap-3 shadow-2xl text-xs font-semibold text-red-600 dark:text-red-400">
              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              Saving tour changes…
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── Hotspot Modal ── */}
      {tourConfig && (
        <HotspotOverlay
          isOpen={hotspotModal.isOpen}
          yaw={hotspotModal.yaw}
          pitch={hotspotModal.pitch}
          availableScenes={Object.entries(tourConfig.scenes).filter(([sid]) => sid !== activeSceneId).map(([sid, s]) => ({ id: sid, name: s.title ?? sid }))}
          onSave={handleSaveHotspot}
          onCancel={() => setHotspotModal({ isOpen: false, yaw: 0, pitch: 0 })}
        />
      )}

      {/* ── Pending Draft Modal ── */}
      {draftModal.open && draftModal.existingDraft && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-5">
            <div>
              <h2 className="text-base font-extrabold text-neutral-900 dark:text-white mb-2">📋 Pending Update Exists</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                You already have a saved draft update for this property. What would you like to do?
              </p>
              <p className="text-xs text-neutral-500 mt-2">
                Last edited: <strong>{new Date(draftModal.existingDraft.updated_at).toLocaleString()}</strong>
              </p>
            </div>
            <div className="space-y-2">
              <button onClick={handleContinueEditing}
                className="w-full px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition shadow-lg shadow-red-600/20">
                ✏️ Continue Editing That Draft
              </button>
              <button onClick={handleDiscardAndFresh}
                className="w-full px-4 py-2.5 rounded-xl border border-red-300 dark:border-red-800/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-sm font-semibold transition">
                🗑️ Discard & Start Fresh
              </button>
              <button onClick={() => setDraftModal({ open: false, existingDraft: null })}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm font-semibold transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Fullscreen Tour ── */}
      {tourFullscreen && tourConfig && Object.keys(tourConfig.scenes).length > 0 && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-black/80 border-b border-white/10">
            <span className="text-white text-sm font-bold">🥽 3D Virtual Tour{mode === 'edit' ? ' — Edit Mode' : ''}</span>
            <button onClick={() => setTourFullscreen(false)}
              className="text-white/60 hover:text-white text-xs px-3 py-1 rounded-lg border border-white/20 hover:border-white/40 transition">
              ✕ Close
            </button>
          </div>
          <div className="flex-1 relative">
            <SceneSelectorToolbar
              scenes={Object.entries(tourConfig.scenes).map(([sid, s]) => ({ id: sid, name: s.title ?? sid, thumbnailUrl: s.panorama }))}
              activeSceneId={activeSceneId}
              onSelectScene={handleSceneSelect}
              isEditMode={mode === 'edit'}
              onDeleteScene={handleDeleteScene}
              onReplaceScene={handleReplaceSceneClick}
              onRenameScene={handleRenameScene}
            />
            <PannellumViewer
              tourConfig={tourConfig}
              isEditMode={mode === 'edit'}
              onAddHotspot={mode === 'edit' ? handleAddHotspotClick : undefined}
              onSceneChange={setActiveSceneId}
              onDeleteHotspot={mode === 'edit' ? handleDeleteHotspot : undefined}
            />
          </div>
        </div>
      )}

      {/* ── Draft preparation overlay ── */}
      {draftModalLoading && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl px-8 py-6 flex flex-col items-center gap-4 shadow-2xl">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Preparing draft…</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function SectionCard({ title, isOpen, onToggle, children, headerExtra }: {
  title: string; isOpen: boolean; onToggle: () => void;
  children: React.ReactNode; headerExtra?: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition cursor-pointer">
        <span onClick={onToggle} className="font-bold text-neutral-900 dark:text-white text-sm flex-1">{title}</span>
        <div className="flex items-center gap-2">
          {headerExtra && <span>{headerExtra}</span>}
          <span onClick={onToggle}>
            {isOpen ? <ChevronUp size={16} className="text-neutral-400" /> : <ChevronDown size={16} className="text-neutral-400" />}
          </span>
        </div>
      </div>
      {isOpen && <div className="px-5 pb-5 border-t border-neutral-100 dark:border-neutral-800 pt-4">{children}</div>}
    </div>
  );
}

function ReadField({ label, value, large }: { label: string; value?: string | null; large?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-0.5">{label}</p>
      <p className={`text-neutral-900 dark:text-white ${large ? 'text-sm leading-relaxed whitespace-pre-wrap' : 'text-sm font-medium'}`}>{value}</p>
    </div>
  );
}

function EditField({ label, value, onChange, type = 'text', textarea, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; textarea?: boolean; placeholder?: string;
}) {
  const cls = "w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition";
  return (
    <div>
      {label && <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5">{label}</label>}
      {textarea
        ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={4} placeholder={placeholder} className={cls} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />}
    </div>
  );
}

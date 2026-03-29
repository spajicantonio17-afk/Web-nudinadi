'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateBusinessProfile } from '@/services/businessService';
import { uploadProductImage } from '@/services/uploadService';
import { useToast } from '@/components/Toast';
import type { AuthUser } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import { BUSINESS_DAYS, BUSINESS_TYPES } from '@/lib/constants';

interface Props {
  user: AuthUser;
  onUpdate: () => void;
}

export default function BusinessProfileEditor({ user, onUpdate }: Props) {
  const { showToast } = useToast();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Form state
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [category, setCategory] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [hours, setHours] = useState<Record<string, string>>({});

  // Load existing data
  useEffect(() => {
    const supabase = getSupabase();
    supabase
      .from('profiles')
      .select('company_name, company_logo, banner_image, business_address, business_hours, business_category, website_url')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setCompanyName(data.company_name || '');
          setCompanyLogo(data.company_logo || '');
          setBannerImage(data.banner_image || '');
          setAddress(data.business_address || '');
          setWebsite(data.website_url || '');
          const loadedCat = data.business_category || '';
          setCategory(loadedCat);
          if (loadedCat) {
            const group = BUSINESS_TYPES.find(g => g.subcategories.includes(loadedCat as never));
            if (group) setSelectedGroup(group.id);
          }
          setHours(data.business_hours as Record<string, string> || {});
        }
      });
  }, [user.id]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const url = await uploadProductImage(user.id, file);
      setCompanyLogo(url);
    } catch {
      showToast('Greška pri uploadu loga', 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    try {
      const url = await uploadProductImage(user.id, file);
      setBannerImage(url);
    } catch {
      showToast('Greška pri uploadu bannera', 'error');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleHourChange = (day: string, value: string) => {
    setHours(prev => ({ ...prev, [day]: value }));
  };

  const toggleClosed = (day: string) => {
    setHours(prev => ({
      ...prev,
      [day]: prev[day] === 'Zatvoreno' ? '08:00-17:00' : 'Zatvoreno',
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let url = website.trim();
      if (url && !url.startsWith('http')) {
        url = 'https://' + url;
      }

      await updateBusinessProfile(user.id, {
        company_name: companyName.trim() || null,
        company_logo: companyLogo || null,
        banner_image: bannerImage || null,
        business_address: address.trim() || null,
        business_hours: Object.keys(hours).length > 0 ? hours : null,
        business_category: category || null,
        website_url: url || null,
      });
      showToast('Poslovni profil ažuriran!');
      onUpdate();
      router.refresh();
      router.push('/user/' + user.username);
    } catch {
      showToast('Greška pri snimanju', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[var(--c-card)] border border-purple-500/20 rounded-[14px] p-5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <i className="fa-solid fa-building text-purple-400 text-sm"></i>
        <h3 className="text-[13px] font-black text-[var(--c-text)] uppercase tracking-wide">Poslovni profil</h3>
      </div>

      {/* Company Name */}
      <div>
        <label className="text-[10px] font-bold text-[var(--c-text3)] uppercase tracking-wider block mb-1.5">Naziv firme</label>
        <input
          type="text"
          value={companyName}
          onChange={e => setCompanyName(e.target.value)}
          placeholder="Npr. Auto Salon Sarajevo"
          className="w-full bg-[var(--c-bg)] border border-[var(--c-border)] rounded-[8px] px-3 py-2.5 text-[12px] text-[var(--c-text)] placeholder-[var(--c-text-muted)] focus:outline-none focus:border-purple-500/50"
        />
      </div>

      {/* Logo */}
      <div>
        <label className="text-[10px] font-bold text-[var(--c-text3)] uppercase tracking-wider block mb-1.5">Logo</label>
        <div className="flex items-center gap-3">
          {companyLogo ? (
            <div className="w-14 h-14 rounded-[8px] border-2 border-[var(--c-border)] overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={companyLogo} alt="Logo" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-[8px] border-2 border-dashed border-[var(--c-border)] flex items-center justify-center shrink-0">
              <i className="fa-solid fa-building text-[var(--c-text-muted)] text-lg"></i>
            </div>
          )}
          <label className="flex items-center gap-1.5 px-3 py-2 bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[8px] text-[10px] font-bold text-[var(--c-text3)] cursor-pointer hover:border-purple-500/40 transition-colors">
            {uploadingLogo ? <i className="fa-solid fa-spinner animate-spin text-xs"></i> : <i className="fa-solid fa-upload text-xs"></i>}
            {uploadingLogo ? 'Upload...' : 'Promijeni logo'}
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Banner */}
      <div>
        <label className="text-[10px] font-bold text-[var(--c-text3)] uppercase tracking-wider block mb-1.5">Banner slika</label>
        {bannerImage ? (
          <div className="w-full h-24 rounded-[8px] border border-[var(--c-border)] overflow-hidden mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={bannerImage} alt="Banner" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full h-24 rounded-[8px] border-2 border-dashed border-[var(--c-border)] flex items-center justify-center mb-2">
            <i className="fa-solid fa-image text-[var(--c-text-muted)] text-2xl"></i>
          </div>
        )}
        <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-[var(--c-hover)] border border-[var(--c-border)] rounded-[8px] text-[10px] font-bold text-[var(--c-text3)] cursor-pointer hover:border-purple-500/40 transition-colors">
          {uploadingBanner ? <i className="fa-solid fa-spinner animate-spin text-xs"></i> : <i className="fa-solid fa-upload text-xs"></i>}
          {uploadingBanner ? 'Upload...' : 'Promijeni banner'}
          <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
        </label>
      </div>

      {/* Address */}
      <div>
        <label className="text-[10px] font-bold text-[var(--c-text3)] uppercase tracking-wider block mb-1.5">Adresa</label>
        <input
          type="text"
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="Npr. Maršala Tita 15, 71000 Sarajevo"
          className="w-full bg-[var(--c-bg)] border border-[var(--c-border)] rounded-[8px] px-3 py-2.5 text-[12px] text-[var(--c-text)] placeholder-[var(--c-text-muted)] focus:outline-none focus:border-purple-500/50"
        />
      </div>

      {/* Website */}
      <div>
        <label className="text-[10px] font-bold text-[var(--c-text3)] uppercase tracking-wider block mb-1.5">Web stranica</label>
        <input
          type="url"
          value={website}
          onChange={e => setWebsite(e.target.value)}
          placeholder="https://www.primjer.com"
          className="w-full bg-[var(--c-bg)] border border-[var(--c-border)] rounded-[8px] px-3 py-2.5 text-[12px] text-[var(--c-text)] placeholder-[var(--c-text-muted)] focus:outline-none focus:border-purple-500/50"
        />
      </div>

      {/* Category — Two-step selection */}
      <div>
        <label className="text-[10px] font-bold text-[var(--c-text3)] uppercase tracking-wider block mb-1.5">Kategorija djelatnosti</label>

        {/* Step 1: Main group */}
        <div className="grid grid-cols-2 gap-1.5">
          {BUSINESS_TYPES.map(group => (
            <button
              key={group.id}
              type="button"
              onClick={() => { setSelectedGroup(group.id); setCategory(''); }}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-[10px] border text-[11px] font-bold text-left transition-all ${
                selectedGroup === group.id
                  ? 'bg-purple-500/10 border-purple-500/50 text-purple-600'
                  : 'bg-[var(--c-bg)] border-[var(--c-border)] text-[var(--c-text3)] hover:border-purple-400/40'
              }`}
            >
              <i className={`fa-solid ${group.icon} text-[10px] shrink-0 ${selectedGroup === group.id ? 'text-purple-500' : 'text-[var(--c-text-muted)]'}`}></i>
              <span className="truncate leading-tight">{group.name}</span>
            </button>
          ))}
        </div>

        {/* Step 2: Subcategory pills */}
        {selectedGroup && (
          <div className="mt-3">
            <p className="text-[9px] font-bold text-[var(--c-text3)] uppercase tracking-wider mb-2">Odaberi vrstu djelatnosti:</p>
            <div className="flex flex-wrap gap-1.5">
              {BUSINESS_TYPES.find(g => g.id === selectedGroup)?.subcategories.map(sub => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setCategory(sub)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${
                    category === sub
                      ? 'bg-purple-500 border-purple-500 text-white shadow-sm shadow-purple-500/30'
                      : 'bg-[var(--c-bg)] border-[var(--c-border)] text-[var(--c-text3)] hover:border-purple-400/50'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Current selection display */}
        {category && (
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-600 font-semibold">
            <i className="fa-solid fa-check-circle text-[9px]"></i>
            Odabrano: <span className="font-black">{category}</span>
          </div>
        )}
      </div>

      {/* Business Hours */}
      <div>
        <label className="text-[10px] font-bold text-[var(--c-text3)] uppercase tracking-wider block mb-2">Radno vrijeme</label>
        <div className="space-y-1.5">
          {BUSINESS_DAYS.map(day => {
            const isClosed = hours[day.key] === 'Zatvoreno';
            return (
              <div key={day.key} className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[var(--c-text3)] w-20 shrink-0">{day.label}</span>
                <input
                  type="text"
                  value={isClosed ? '' : (hours[day.key] || '')}
                  onChange={e => handleHourChange(day.key, e.target.value)}
                  disabled={isClosed}
                  placeholder="08:00-17:00"
                  className="flex-1 bg-[var(--c-bg)] border border-[var(--c-border)] rounded-[6px] px-2 py-1.5 text-[11px] text-[var(--c-text)] placeholder-[var(--c-text-muted)] focus:outline-none focus:border-purple-500/50 disabled:opacity-40"
                />
                <button
                  onClick={() => toggleClosed(day.key)}
                  className={`px-2 py-1.5 rounded-[6px] text-[9px] font-bold border transition-colors ${
                    isClosed
                      ? 'bg-red-500/10 border-red-500/30 text-red-400'
                      : 'bg-[var(--c-hover)] border-[var(--c-border)] text-[var(--c-text3)] hover:border-red-500/30'
                  }`}
                >
                  Zatvoreno
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 bg-purple-500 text-white rounded-[8px] text-[11px] font-black uppercase tracking-wider hover:bg-purple-600 transition-colors disabled:opacity-50"
      >
        {saving ? (
          <><i className="fa-solid fa-spinner animate-spin mr-2"></i>Snimanje...</>
        ) : (
          <><i className="fa-solid fa-save mr-2"></i>Spremi poslovni profil</>
        )}
      </button>
    </div>
  );
}

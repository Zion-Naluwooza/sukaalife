'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  FileText,
  Video,
  Image as ImageIcon,
  Headphones,
  Search,
  Trash2,
  ExternalLink,
  Plus,
  Award,
  Globe,
  Loader2,
  CheckCircle2,
  X,
  AlertCircle
} from 'lucide-react';
import { api, EducationResourceItem } from '@/lib/api';

interface EducationCenterProps {
  userRole?: 'PATIENT' | 'SPECIALIST' | 'CAREGIVER' | string;
  currentUserId?: string;
}

const CATEGORIES = [
  'ALL',
  'Nutrition & Local Diet',
  'Insulin & Medication',
  'Foot Care & Hygiene',
  'Exercise & Fitness',
  'Pediatric Care',
  'Hypoglycemia & Emergencies',
  'General Education'
];

const CONTENT_TYPES = [
  { key: 'ALL', label: 'All Formats', icon: BookOpen },
  { key: 'ARTICLE', label: 'Clinical Guides', icon: FileText },
  { key: 'PDF', label: 'PDF Handouts', icon: FileText },
  { key: 'VIDEO', label: 'Video Lessons', icon: Video },
  { key: 'INFOGRAPHIC', label: 'Infographics', icon: ImageIcon },
  { key: 'AUDIO', label: 'Audio Advice', icon: Headphones }
];

const LANGUAGES = [
  'All Languages',
  'English',
  'Luganda',
  'Kiswahili',
  'Lusoga',
  'Lugbara',
  'Acholi',
  'Runyankole'
];

export default function EducationCenter({ userRole, currentUserId }: EducationCenterProps) {
  const [resources, setResources] = useState<EducationResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedLanguage, setSelectedLanguage] = useState('All Languages');

  // Specialist Publish Drawer / Modal State
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [pubTitle, setPubTitle] = useState('');
  const [pubDescription, setPubDescription] = useState('');
  const [pubContentType, setPubContentType] = useState<'ARTICLE' | 'PDF' | 'VIDEO' | 'INFOGRAPHIC' | 'AUDIO'>('ARTICLE');
  const [pubCategory, setPubCategory] = useState('Nutrition & Local Diet');
  const [pubLanguage, setPubLanguage] = useState('English');
  const [pubMediaUrl, setPubMediaUrl] = useState('');
  const [pubTags, setPubTags] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  const isSpecialist = userRole === 'SPECIALIST';

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedCategory !== 'ALL') params.category = selectedCategory;
      if (selectedType !== 'ALL') params.contentType = selectedType;
      if (selectedLanguage !== 'All Languages') params.language = selectedLanguage;

      const res = await api.getEducationResources(params);
      setResources(res.resources || []);
    } catch (err: any) {
      console.error('Failed to load education resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [selectedCategory, selectedType, selectedLanguage]);

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishError(null);

    if (!pubTitle.trim() || !pubDescription.trim()) {
      setPublishError('Please provide a resource title and description.');
      return;
    }

    try {
      setIsPublishing(true);
      await api.createEducationResource({
        title: pubTitle.trim(),
        description: pubDescription.trim(),
        contentType: pubContentType,
        category: pubCategory,
        targetLanguage: pubLanguage,
        mediaUrl: pubMediaUrl.trim() || undefined,
        tags: pubTags.trim() || undefined
      });

      setIsPublishModalOpen(false);
      setPubTitle('');
      setPubDescription('');
      setPubMediaUrl('');
      setPubTags('');
      await fetchResources();
    } catch (err: any) {
      setPublishError(err.message || 'Failed to publish resource.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDeleteResource = async (id: string) => {
    try {
      await api.deleteEducationResource(id);
      setResources((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      console.error('Failed to delete resource:', err);
    }
  };

  const filteredResources = resources.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      (r.tags && r.tags.toLowerCase().includes(q))
    );
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Video className="h-4 w-4 text-rose-600" />;
      case 'PDF':
        return <FileText className="h-4 w-4 text-red-600" />;
      case 'INFOGRAPHIC':
        return <ImageIcon className="h-4 w-4 text-emerald-600" />;
      case 'AUDIO':
        return <Headphones className="h-4 w-4 text-purple" />;
      default:
        return <FileText className="h-4 w-4 text-purple" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple via-purple/95 to-purple rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="h-3.5 w-3.5 text-secondary" /> Specialist Knowledge Base
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            Diabetes Education & Care Center
          </h2>
          <p className="text-white/85 text-xs sm:text-sm leading-relaxed">
            Access verified clinical guides, diet tips for Ugandan staples (Matooke, Millet, Posho), foot care guides, and insulin instructions in native languages.
          </p>
        </div>

        {isSpecialist && (
          <button
            type="button"
            onClick={() => setIsPublishModalOpen(true)}
            className="self-start md:self-auto px-5 py-3.5 rounded-2xl bg-white text-purple font-black text-xs flex items-center gap-2 shadow-lg hover:bg-zinc-100 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Publish Educational Resource
          </button>
        )}
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-purple/15 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search bar */}
          <div className="relative sm:col-span-1">
            <input
              type="text"
              placeholder="Search topics, food, medication..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-purple/20 bg-slate-50 dark:bg-zinc-800 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-purple"
            />
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-foreground/50" />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-purple/20 bg-slate-50 dark:bg-zinc-800 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-purple cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Language Filter */}
          <div>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-purple/20 bg-slate-50 dark:bg-zinc-800 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-purple cursor-pointer"
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Type Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {CONTENT_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.key;
            return (
              <button
                key={type.key}
                type="button"
                onClick={() => setSelectedType(type.key)}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-zinc-800 text-foreground/70 hover:bg-purple/10'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-foreground/60 gap-2">
          <Loader2 className="h-7 w-7 animate-spin text-purple" />
          <span className="text-xs font-bold">Loading educational library...</span>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="py-16 text-center text-foreground/60 bg-white dark:bg-zinc-900 rounded-3xl border border-purple/15 p-8">
          <BookOpen className="h-12 w-12 mx-auto text-purple/40 mb-3" />
          <h3 className="text-base font-bold text-foreground">No resources matched</h3>
          <p className="text-xs text-foreground/60 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords, category, or language filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map((res) => {
            const isAuthor = currentUserId && res.authorId === currentUserId;

            return (
              <div
                key={res.id}
                className="group bg-white dark:bg-zinc-900 rounded-3xl border border-purple/15 hover:border-purple/40 p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Card Top Metadata */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-[#DFD2F0] text-purple border border-purple/20">
                      {getTypeIcon(res.contentType)}
                      <span>{res.contentType}</span>
                    </span>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-foreground/80 flex items-center gap-1">
                      <Globe className="h-3 w-3 text-purple" />
                      {res.targetLanguage}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-foreground group-hover:text-purple transition-colors leading-snug line-clamp-2">
                    {res.title}
                  </h3>

                  <p className="text-xs text-foreground/75 mt-2 line-clamp-3 leading-relaxed">
                    {res.description}
                  </p>

                  {/* Category badge & Tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-bold text-purple bg-[#DFD2F0]/60 px-2 py-0.5 rounded-md">
                      #{res.category}
                    </span>
                    {res.tags &&
                      res.tags.split(',').map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] text-foreground/60 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md"
                        >
                          #{t.trim()}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Footer: Specialist Badge & Action */}
                <div className="pt-4 mt-4 border-t border-purple/10 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-foreground truncate flex items-center gap-1">
                      <Award className="h-3 w-3 text-purple shrink-0" />
                      <span>{res.author?.fullName || 'Endocrinology Panel'}</span>
                    </div>
                    {res.author?.specialistProfile?.hospitalAffiliation && (
                      <div className="text-[10px] text-foreground/60 truncate">
                        {res.author.specialistProfile.hospitalAffiliation}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {res.mediaUrl && (
                      <a
                        href={res.mediaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="h-8 px-3 rounded-xl bg-purple hover:bg-purple/90 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <span>View</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}

                    {isAuthor && (
                      <button
                        type="button"
                        onClick={() => handleDeleteResource(res.id)}
                        className="h-8 w-8 rounded-xl text-foreground/40 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                        title="Delete Resource"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Specialist Upload Modal */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-purple/20 overflow-hidden my-8">
            <div className="p-6 bg-purple text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BookOpen className="h-6 w-6" />
                <h3 className="text-lg font-black">Publish to Education Center</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(false)}
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handlePublishSubmit} className="p-6 space-y-4">
              {publishError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{publishError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Resource Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Managing Blood Sugar with Traditional Meals"
                  value={pubTitle}
                  onChange={(e) => setPubTitle(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-purple/20 bg-slate-50 dark:bg-zinc-800 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-purple"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Content Format *
                  </label>
                  <select
                    value={pubContentType}
                    onChange={(e: any) => setPubContentType(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-purple/20 bg-slate-50 dark:bg-zinc-800 text-xs font-bold text-foreground cursor-pointer"
                  >
                    <option value="ARTICLE">Clinical Article / Guide</option>
                    <option value="PDF">PDF Handout Document</option>
                    <option value="VIDEO">Video Recording / Lesson</option>
                    <option value="INFOGRAPHIC">Visual Infographic</option>
                    <option value="AUDIO">Audio Guidance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Target Language *
                  </label>
                  <select
                    value={pubLanguage}
                    onChange={(e) => setPubLanguage(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-purple/20 bg-slate-50 dark:bg-zinc-800 text-xs font-bold text-foreground cursor-pointer"
                  >
                    {LANGUAGES.filter((l) => l !== 'All Languages').map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Category *
                </label>
                <select
                  value={pubCategory}
                  onChange={(e) => setPubCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-purple/20 bg-slate-50 dark:bg-zinc-800 text-xs font-bold text-foreground cursor-pointer"
                >
                  {CATEGORIES.filter((c) => c !== 'ALL').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Description / Clinical Summary *
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide educational insights, dosage caution, or meal breakdown instructions..."
                  value={pubDescription}
                  onChange={(e) => setPubDescription(e.target.value)}
                  className="w-full p-3 rounded-xl border border-purple/20 bg-slate-50 dark:bg-zinc-800 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-purple resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Resource URL / Link (PDF / Video / Article Link)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/resources/diabetes-guide.pdf"
                  value={pubMediaUrl}
                  onChange={(e) => setPubMediaUrl(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-purple/20 bg-slate-50 dark:bg-zinc-800 text-xs text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. insulin, matooke, uganda diet, foot check"
                  value={pubTags}
                  onChange={(e) => setPubTags(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-purple/20 bg-slate-50 dark:bg-zinc-800 text-xs text-foreground"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="w-full h-11 rounded-xl bg-purple hover:bg-purple/90 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Publishing Resource...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Publish to Education Library</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

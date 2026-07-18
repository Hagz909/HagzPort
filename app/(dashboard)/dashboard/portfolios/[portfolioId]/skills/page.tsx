'use client';

import { useState, useEffect, use } from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { toast } from 'react-hot-toast';
import { Loader2, Save, X, Plus, Code, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SkillsPage({ params }: { params: Promise<{ portfolioId: string }> }) {
  const { portfolioId } = use(params);
  const router = useRouter();
  
  const [skills, setSkills] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await fetch(`/api/dashboard/portfolios`);
        if (res.ok) {
          const data = await res.json();
          const p = data.find((x: any) => x.id === portfolioId);
          if (p) {
            setSkills(p.skills || []);
          }
        }
      } catch (error) {
        toast.error('Gagal memuat data keahlian');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPortfolio();
  }, [portfolioId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const addSkill = () => {
    const val = inputValue.trim();
    if (!val) return;
    
    if (skills.includes(val)) {
      toast.error('Keahlian ini sudah ditambahkan');
      return;
    }

    setSkills([...skills, val]);
    setInputValue('');
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const onSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/dashboard/portfolios/${portfolioId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Gagal menyimpan data');
      }
      
      toast.success('Keahlian berhasil disimpan');
      router.push(`/dashboard/portfolios/${portfolioId}/projects`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-zinc-900 rounded-lg"></div>
        <div className="card p-6 h-64 bg-zinc-900 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Keahlian & Teknologi" 
        description="Tambahkan keahlian, bahasa pemrograman, atau tools yang Anda kuasai."
      />

      <div className="card p-6">
        <div className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Tambah Keahlian Baru
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="input-field flex-1"
                placeholder="Cth: React, UI/UX Design, Python (Tekan Enter)"
                disabled={isSaving}
              />
              <button 
                onClick={addSkill}
                disabled={isSaving || !inputValue.trim()}
                className="btn btn-secondary px-4 whitespace-nowrap"
              >
                <Plus size={16} className="mr-1" /> Tambah
              </button>
            </div>
            <p className="text-xs text-zinc-500 mt-2">Ketik nama keahlian lalu tekan Enter untuk menambahkan.</p>
          </div>

          <div className="border-t border-zinc-800 pt-6">
            <h3 className="text-sm font-medium text-zinc-300 mb-4 flex items-center">
              <Code size={16} className="mr-2 text-cyan-400" /> Daftar Keahlian ({skills.length})
            </h3>
            
            {skills.length === 0 ? (
              <div className="text-center py-8 bg-zinc-900/50 rounded-lg border border-dashed border-zinc-700">
                <p className="text-sm text-zinc-500">Belum ada keahlian yang ditambahkan.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 hover:border-cyan-500/50 rounded-lg group transition-colors"
                  >
                    <span className="text-sm text-zinc-200">{skill}</span>
                    <button
                      onClick={() => removeSkill(skill)}
                      disabled={isSaving}
                      className="text-zinc-500 hover:text-red-400 p-0.5 rounded-md hover:bg-red-500/10 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-8 flex justify-end">
            <button
              onClick={onSave}
              disabled={isSaving}
              className="btn btn-primary"
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSaving ? 'Menyimpan...' : 'Simpan & Lanjutkan'}
              {!isSaving && <ArrowRight className="ml-2 h-4 w-4" />}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

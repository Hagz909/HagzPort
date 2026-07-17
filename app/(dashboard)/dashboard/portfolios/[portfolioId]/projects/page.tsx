'use client';

import { useState, useEffect, use } from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { ImageUploader } from '@/components/ui/ImageUploader';
import { TechStackInput } from '@/components/ui/TechStackInput';
import { toast } from 'react-hot-toast';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loader2, Plus, Pencil, Trash2, X, Code, Star, GripVertical } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import Image from 'next/image';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Project {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  imagePublicId: string | null;
  techStack: string[];
  demoUrl: string | null;
  repoUrl: string | null;
  wokwiEmbedUrl: string | null;
  isFeatured: boolean;
  order: number;
}

const projectSchema = z.object({
  title: z.string().min(1, 'Judul proyek wajib diisi').max(100),
  description: z.string().max(1000).optional().or(z.literal('')),
  imageUrl: z.string().optional().or(z.literal('')),
  imagePublicId: z.string().optional().or(z.literal('')),
  techStack: z.array(z.string()),
  demoUrl: z.union([z.literal(''), z.string().url('URL tidak valid')]).optional(),
  repoUrl: z.union([z.literal(''), z.string().url('URL tidak valid')]).optional(),
  wokwiEmbedUrl: z.string().optional().or(z.literal('')),
  isFeatured: z.boolean(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

function SortableProjectCard({
  project,
  onEdit,
  onDelete,
  isDeleting,
}: {
  project: Project;
  onEdit: (p: Project) => void;
  onDelete: (id: string, publicId: string | null) => void;
  isDeleting: string | null;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`card overflow-hidden flex flex-col group border-zinc-800 hover:border-zinc-700 transition-colors ${isDragging ? 'ring-2 ring-cyan-500 shadow-xl' : ''}`}
    >
      <div className="relative aspect-video bg-zinc-800 border-b border-zinc-800">
        {project.imageUrl ? (
          <Image 
            src={project.imageUrl} 
            alt={project.title} 
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600">
            <Code size={32} className="mb-2" />
            <span className="text-sm">Tanpa Gambar</span>
          </div>
        )}
        
        {project.isFeatured && (
          <div className="absolute top-2 left-2 bg-yellow-500/90 text-yellow-50 text-xs px-2 py-1 rounded-md flex items-center font-medium shadow-sm">
            <Star size={12} className="mr-1 fill-current" /> Featured
          </div>
        )}

        <div className="absolute top-2 right-2 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          
          <button 
            {...attributes} 
            {...listeners}
            className="p-1.5 cursor-grab active:cursor-grabbing bg-black/60 backdrop-blur-md text-zinc-300 hover:text-white border border-white/10 rounded-md transition-colors mr-2"
            title="Drag untuk memindahkan"
          >
            <GripVertical size={14} />
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(project); }} 
            className="p-1.5 bg-black/60 backdrop-blur-md text-zinc-300 hover:text-cyan-400 border border-white/10 hover:border-cyan-500/50 rounded-md transition-colors"
            title="Edit"
          >
            <Pencil size={14} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(project.id, project.imagePublicId); }}
            disabled={isDeleting === project.id} 
            className="p-1.5 bg-black/60 backdrop-blur-md text-zinc-300 hover:text-red-400 border border-white/10 hover:border-red-500/50 rounded-md transition-colors disabled:opacity-50"
            title="Hapus"
          >
            {isDeleting === project.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          </button>
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <h4 className="text-lg font-semibold text-zinc-50 truncate mb-2">{project.title}</h4>
        
        {project.techStack && project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {project.techStack.slice(0, 4).map(tech => (
              <span key={tech} className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded border border-zinc-700">
                {tech}
              </span>
            ))}
            {project.techStack.length > 4 && (
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 text-zinc-500">
                +{project.techStack.length - 4}
              </span>
            )}
          </div>
        )}
        
        {project.description && (
          <p className="text-sm text-zinc-400 line-clamp-2 mt-auto">{project.description}</p>
        )}
      </div>
    </div>
  );
}


export default function ProjectsPage({ params }: { params: Promise<{ portfolioId: string }> }) {
  const { portfolioId } = use(params);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      description: '',
      imageUrl: '',
      imagePublicId: '',
      techStack: [],
      demoUrl: '',
      repoUrl: '',
      wokwiEmbedUrl: '',
      isFeatured: false,
    },
  });

  const imageUrl = watch('imageUrl');
  const imagePublicId = watch('imagePublicId');

  const fetchProjects = async () => {
    try {
      const res = await fetch(`/api/dashboard/portfolios/${portfolioId}/projects`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (error) {
      toast.error('Gagal memuat data proyek');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolioId]);

  const openModal = (proj?: Project) => {
    if (proj) {
      setEditingId(proj.id);
      reset({
        title: proj.title,
        description: proj.description || '',
        imageUrl: proj.imageUrl || '',
        imagePublicId: proj.imagePublicId || '',
        techStack: proj.techStack || [],
        demoUrl: proj.demoUrl || '',
        repoUrl: proj.repoUrl || '',
        wokwiEmbedUrl: proj.wokwiEmbedUrl || '',
        isFeatured: proj.isFeatured,
      });
    } else {
      setEditingId(null);
      reset({
        title: '',
        description: '',
        imageUrl: '',
        imagePublicId: '',
        techStack: [],
        demoUrl: '',
        repoUrl: '',
        wokwiEmbedUrl: '',
        isFeatured: false,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const onSubmit = async (data: ProjectFormValues) => {
    setIsSaving(true);
    try {
      const url = editingId 
        ? `/api/dashboard/portfolios/${portfolioId}/projects/${editingId}`
        : `/api/dashboard/portfolios/${portfolioId}/projects`;
      
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Gagal menyimpan data');
      
      toast.success(editingId ? 'Proyek diperbarui' : 'Proyek ditambahkan');
      fetchProjects();
      closeModal();
    } catch (error) {
      toast.error('Terjadi kesalahan saat menyimpan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, publicId: string | null) => {
    if (!confirm('Apakah Anda yakin ingin menghapus proyek ini?')) return;
    
    setIsDeleting(id);
    try {
      if (publicId) {
        await fetch('/api/upload/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicId }),
        });
      }

      const res = await fetch(`/api/dashboard/portfolios/${portfolioId}/projects/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Gagal menghapus data');
      
      toast.success('Proyek dihapus');
      fetchProjects();
    } catch (error) {
      toast.error('Terjadi kesalahan saat menghapus');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = projects.findIndex((p) => p.id === active.id);
      const newIndex = projects.findIndex((p) => p.id === over.id);
      
      const newProjects = arrayMove(projects, oldIndex, newIndex);
      
      const updatedProjects = newProjects.map((p, index) => ({
        ...p,
        order: index,
      }));
      
      setProjects(updatedProjects); // Optimistic UI update
      
      const itemsToUpdate = updatedProjects.map((p) => ({ id: p.id, order: p.order }));

      try {
        await fetch(`/api/dashboard/portfolios/${portfolioId}/projects/reorder`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: itemsToUpdate }),
        });
      } catch (error) {
        toast.error('Gagal memperbarui urutan');
        fetchProjects(); // revert on fail
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-zinc-900 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => <div key={i} className="h-48 bg-zinc-900 rounded-lg"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Daftar Proyek" 
        description="Tampilkan karya terbaik Anda. Seret dan lepas (drag-and-drop) ikon handle untuk mengatur urutan."
        action={
          <button onClick={() => openModal()} className="btn btn-primary">
            <Plus size={16} className="mr-2" /> Tambah
          </button>
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={Code}
          title="Belum ada proyek"
          description="Mulai pamerkan karya dan portofolio Anda dengan menambahkan proyek pertama."
          actionLabel="Tambah Proyek Pertama"
          actionOnClick={() => openModal()}
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={projects.map((p) => p.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj) => (
                <SortableProjectCard 
                  key={proj.id} 
                  project={proj} 
                  onEdit={openModal} 
                  onDelete={handleDelete}
                  isDeleting={isDeleting}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900 sticky top-0 z-10">
              <h3 className="text-lg font-semibold">{editingId ? 'Edit Proyek' : 'Tambah Proyek'}</h3>
              <button onClick={closeModal} className="text-zinc-400 hover:text-zinc-100 p-1">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="proj-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <ImageUploader
                      label="Thumbnail Proyek"
                      folder="projects"
                      aspectRatio="16:9"
                      currentImageUrl={imageUrl}
                      currentPublicId={imagePublicId}
                      onUploadComplete={({url, publicId}) => {
                        setValue('imageUrl', url);
                        setValue('imagePublicId', publicId);
                      }}
                      onDeleteComplete={() => {
                        setValue('imageUrl', '');
                        setValue('imagePublicId', '');
                      }}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300">Judul Proyek <span className="text-red-400">*</span></label>
                      <input type="text" {...register('title')} className="input-field mt-1" placeholder="Cth: E-Commerce App" />
                      {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1">Tech Stack</label>
                      <Controller
                        control={control}
                        name="techStack"
                        render={({ field }) => (
                          <TechStackInput value={field.value} onChange={field.onChange} />
                        )}
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input 
                        type="checkbox" 
                        id="isFeatured"
                        {...register('isFeatured')}
                        className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-cyan-500 focus:ring-cyan-500/20"
                      />
                      <label htmlFor="isFeatured" className="text-sm font-medium text-zinc-300 flex items-center cursor-pointer">
                        <Star size={14} className="mr-1.5 text-yellow-500" /> Tandai sebagai Featured
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300">Deskripsi Proyek</label>
                  <textarea {...register('description')} rows={4} className="input-field mt-1" placeholder="Ceritakan fitur utama dan peran Anda di proyek ini..." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-zinc-800 pt-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300">Link Demo Publik</label>
                    <input type="url" {...register('demoUrl')} className={`input-field mt-1 text-sm ${errors.demoUrl ? 'border-red-500' : ''}`} placeholder="https://..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300">Link Repository</label>
                    <input type="url" {...register('repoUrl')} className={`input-field mt-1 text-sm ${errors.repoUrl ? 'border-red-500' : ''}`} placeholder="https://github.com/..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300">Wokwi Embed URL</label>
                    <input type="url" {...register('wokwiEmbedUrl')} className="input-field mt-1 text-sm" placeholder="URL iframe simulator..." />
                  </div>
                </div>

              </form>
            </div>
            
            <div className="p-4 border-t border-zinc-800 bg-zinc-900 flex justify-end gap-3 sticky bottom-0">
              <button type="button" onClick={closeModal} className="btn btn-ghost" disabled={isSaving}>
                Batal
              </button>
              <button type="submit" form="proj-form" disabled={isSaving} className="btn btn-primary">
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? 'Menyimpan...' : 'Simpan Proyek'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

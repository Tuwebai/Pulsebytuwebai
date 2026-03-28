import { AlertCircle } from 'lucide-react';

import LoadingSpinner from '@/components/LoadingSpinner';
import { ProjectPagination } from '@/components/admin/ProjectPagination';
import { AdminProjectsEmptyState } from '@/features/admin/projects/components/AdminProjectsEmptyState';
import { AdminProjectsGrid } from '@/features/admin/projects/components/AdminProjectsGrid';
import { AdminProjectsHeader } from '@/features/admin/projects/components/AdminProjectsHeader';
import { AdminProjectsOverlays } from '@/features/admin/projects/components/AdminProjectsOverlays';
import { useAdminProjectsScreen } from '@/features/admin/projects/hooks/useAdminProjectsScreen';

export function AdminProjectsScreen() {
  const {
    loading,
    error,
    pagination,
    projects,
    stats,
    showForm,
    editingProject,
    viewingProject,
    formLoading,
    showConfirmDelete,
    projectToDelete,
    changePage,
    changeLimit,
    openCreateForm,
    handleCreateProject,
    handleUpdateProject,
    openDeleteConfirmation,
    confirmDelete,
    cancelDelete,
    openCollaborate,
    updateDevelopmentImage,
    duplicateProject,
    renameProject,
    openEditProject,
    openViewProject,
    openEditProjectDetails,
    closeForm,
    closeDetails,
  } = useAdminProjectsScreen();

  if (loading && projects.length === 0) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-8 shadow-[0_24px_60px_rgba(0,0,0,0.24)]">
        <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
          <LoadingSpinner />
          <span>Cargando base operativa de proyectos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminProjectsHeader
        total={stats.total}
        inProgress={stats.inProgress}
        inProduction={stats.inProduction}
        paused={stats.paused}
        onCreate={openCreateForm}
      />

      {error && (
        <section className="rounded-[24px] border border-danger/20 bg-danger/10 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-danger/20 text-danger">
              <AlertCircle className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[var(--text-primary)]">No pudimos cargar la base de proyectos</p>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">{error}</p>
            </div>
          </div>
        </section>
      )}

      {projects.length === 0 ? (
        <AdminProjectsEmptyState onCreate={openCreateForm} />
      ) : (
        <>
          <AdminProjectsGrid
            projects={projects}
            onViewProject={openViewProject}
            onCollaborate={openCollaborate}
            onEditProject={openEditProject}
            onDeleteProject={openDeleteConfirmation}
            onDuplicateProject={duplicateProject}
            onUpdateDevelopmentImage={updateDevelopmentImage}
            onRenameProject={renameProject}
          />

          <section className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.18)] backdrop-blur sm:p-5">
            <ProjectPagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={changePage}
              onItemsPerPageChange={changeLimit}
            />
          </section>
        </>
      )}

      <AdminProjectsOverlays
        showForm={showForm}
        editingProject={editingProject}
        viewingProject={viewingProject}
        formLoading={formLoading}
        showConfirmDelete={showConfirmDelete}
        projectToDelete={projectToDelete}
        onCloseForm={closeForm}
        onCloseDetails={closeDetails}
        onCancelDelete={cancelDelete}
        onConfirmDelete={confirmDelete}
        onOpenEditFromDetails={openEditProjectDetails}
        onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
      />
    </div>
  );
}

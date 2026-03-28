import { AlertCircle } from 'lucide-react';

import LoadingSpinner from '@/components/LoadingSpinner';
import { ProjectDetails } from '@/components/admin/ProjectDetails';
import { ProjectFiltersComponent } from '@/components/admin/ProjectFilters';
import { ProjectForm } from '@/components/admin/ProjectForm';
import { ProjectPagination } from '@/components/admin/ProjectPagination';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { AdminProjectsEmptyState } from '@/features/admin/projects/components/AdminProjectsEmptyState';
import { AdminProjectsGrid } from '@/features/admin/projects/components/AdminProjectsGrid';
import { AdminProjectsHeader } from '@/features/admin/projects/components/AdminProjectsHeader';
import { useAdminProjectsScreen } from '@/features/admin/projects/hooks/useAdminProjectsScreen';

export function AdminProjectsScreen() {
  const {
    user,
    loading,
    error,
    filters,
    sort,
    pagination,
    projects,
    stats,
    showForm,
    editingProject,
    viewingProject,
    formLoading,
    showConfirmDelete,
    projectToDelete,
    applyFilters,
    applySort,
    clearFilters,
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

      <section className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/95 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.18)] backdrop-blur sm:p-5">
        <ProjectFiltersComponent
          filters={filters}
          sort={sort}
          onFiltersChange={applyFilters}
          onSortChange={applySort}
          onClearFilters={clearFilters}
        />
      </section>

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
            userId={user?.id ?? null}
            userRole={user?.role ?? null}
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

      {(showForm || editingProject) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-white/10 bg-[var(--bg-surface)] shadow-[0_32px_80px_rgba(0,0,0,0.45)]">
            <ProjectForm
              project={editingProject || undefined}
              onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
              onCancel={closeForm}
              loading={formLoading}
            />
          </div>
        </div>
      )}

      {viewingProject && (
        <ProjectDetails project={viewingProject} onEdit={openEditProjectDetails} onClose={closeDetails} />
      )}

      <ConfirmationDialog
        isOpen={showConfirmDelete}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Confirmar eliminacion"
        description={`Estas seguro de que quieres eliminar el proyecto "${projectToDelete?.name}"? Esta accion no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        loading={false}
      />
    </div>
  );
}

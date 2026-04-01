import { ErrorMessage } from '@/components/ErrorBoundary';
import { SectionSpinner } from '@/components/LoadingSpinner';
import ProjectFilters from '@/features/project/components/ProjectFilters';
import { ProjectCard, ProjectStatsRow } from '@/features/project/components';
import ProjectOverviewDialogs from '@/features/project/components/ProjectOverviewDialogs';
import ProjectOverviewEmptyState from '@/features/project/components/ProjectOverviewEmptyState';
import ProjectOverviewHeader from '@/features/project/components/ProjectOverviewHeader';
import { useProjectOverview } from '@/features/project/hooks/useProjectOverview';

export default function ProjectOverviewScreen() {
  const {
    cancelDeleteProject,
    confirmDeleteProject,
    error,
    filteredProjects,
    handleDeleteProject,
    handleViewProject,
    isAdminContext,
    loading,
    navigate,
    projectCreators,
    projectToDelete,
    projects,
    refreshData,
    selectedProject,
    setFilteredProjects,
    setSelectedProject,
    showDeleteConfirm,
    targetUserName,
    user,
    userId,
    visibleProjects,
  } = useProjectOverview();

  if (loading) return <SectionSpinner />;
  if (error) return <ErrorMessage error={new Error(error)} onRetry={refreshData} />;
  if (!user) return <ErrorMessage error={new Error('Usuario no autenticado')} onRetry={refreshData} />;

  const projectName = projects.find((project) => project.id === projectToDelete)?.name || 'este proyecto';

  return (
    <div className="space-y-6">
      <ProjectOverviewHeader
        isClientUserView={Boolean(userId)}
        onBack={() => navigate(-1)}
        targetUserName={targetUserName}
      />

      <div data-tour="project-stats">
        <ProjectStatsRow loading={loading} projects={visibleProjects} />
      </div>

      <ProjectFilters onFilteredProjects={setFilteredProjects} onRefresh={refreshData} projects={visibleProjects} />

      {filteredProjects.length === 0 ? (
        <ProjectOverviewEmptyState />
      ) : (
        <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3" data-tour="project-list">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              onDeleteProject={handleDeleteProject}
              onNavigateToEdit={(projectId) => navigate(`/proyectos/${projectId}`)}
              onViewProject={handleViewProject}
              project={project}
              projectCreator={project.created_by ? projectCreators[project.created_by] : undefined}
              showAdminActions={isAdminContext}
            />
          ))}
        </section>
      )}

      <ProjectOverviewDialogs
        onCancelDelete={cancelDeleteProject}
        onCloseProject={() => setSelectedProject(null)}
        onConfirmDelete={confirmDeleteProject}
        projectName={projectName}
        selectedProject={selectedProject}
        showDeleteConfirm={showDeleteConfirm}
      />
    </div>
  );
}

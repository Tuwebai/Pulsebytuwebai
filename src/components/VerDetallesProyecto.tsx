import ProjectDetailModal from '@/features/project/components/ProjectDetailModal';
import type { ProjectDetailProject } from '@/features/project/components/projectDetail.types';

interface VerDetallesProyectoProps {
  proyecto: ProjectDetailProject;
  onClose: () => void;
  onUpdate?: (proyecto: ProjectDetailProject) => void;
}

export default function VerDetallesProyecto({ proyecto, onClose }: VerDetallesProyectoProps) {
  return <ProjectDetailModal onClose={onClose} project={proyecto} />;
}

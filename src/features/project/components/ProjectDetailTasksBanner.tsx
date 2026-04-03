import { AlertCircle } from 'lucide-react';
import type { ProjectDetailTask } from './projectDetail.types';
import { getTaskDisplayTitle, getTaskMeta } from './projectDetail.utils';

interface ProjectDetailTasksBannerProps {
  tasks: ProjectDetailTask[];
}

export default function ProjectDetailTasksBanner({ tasks }: ProjectDetailTasksBannerProps) {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[24px] border border-[var(--cliente-warning)] bg-[var(--cliente-warning-dim)] px-5 py-4 shadow-[var(--cliente-card-shadow)]">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 text-[var(--cliente-warning)]" strokeWidth={1.5} />
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-[var(--cliente-text-primary)]">Necesitamos algo de tu parte</h3>
          <ul className="mt-3 space-y-2">
            {tasks.map((task, index) => {
              const meta = getTaskMeta(task);

              return (
                <li key={task.id ?? `${getTaskDisplayTitle(task)}-${index}`} className="rounded-[14px] bg-[rgba(11,15,30,0.18)] px-3 py-2">
                  <p className="text-sm text-[var(--cliente-text-primary)]">{getTaskDisplayTitle(task)}</p>
                  {meta ? (
                    <p className="mt-1 text-[12px] text-[var(--cliente-text-secondary)]">{meta}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

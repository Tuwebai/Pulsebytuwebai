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
    <section className="rounded-[20px] border border-[var(--warning)] bg-[var(--warning-dim)] px-5 py-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 text-[var(--warning)]" strokeWidth={1.5} />
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-[var(--text-primary)]">Necesitamos algo de tu parte</h3>
          <ul className="mt-3 space-y-2">
            {tasks.map((task, index) => {
              const meta = getTaskMeta(task);

              return (
                <li key={task.id ?? `${getTaskDisplayTitle(task)}-${index}`} className="rounded-[14px] bg-[rgba(11,15,30,0.14)] px-3 py-2">
                  <p className="text-sm text-[var(--text-primary)]">{getTaskDisplayTitle(task)}</p>
                  {meta ? (
                    <p className="mt-1 text-[12px] text-[var(--text-secondary)]">{meta}</p>
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

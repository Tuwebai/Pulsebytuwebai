import { Globe } from 'lucide-react';
import { FadeIn, Skeleton } from '@/core/components';
import type { TopPage } from '@/data/types/pulse';

interface PulseTopPagesCardProps {
  loading: boolean;
  topPages: TopPage[];
}

export default function PulseTopPagesCard({ loading, topPages }: PulseTopPagesCardProps) {
  return (
    <div className="rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)]" data-tour="pulse-top-pages">
      <div className="border-b border-[var(--border-subtle)] px-5 py-4">
        <h2 className="text-sm font-medium text-[var(--text-primary)]">Páginas más visitadas</h2>
      </div>

      <div className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] text-left text-[12px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
              <th className="px-5 py-3 font-medium">Página</th>
              <th className="px-5 py-3 font-medium">Visitas</th>
              <th className="px-5 py-3 font-medium">% del total</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className="border-b border-[var(--border-subtle)] last:border-b-0">
                  <td className="px-5 py-3 text-sm" colSpan={3}>
                    <div className="grid grid-cols-[minmax(0,1fr)_96px_96px] items-center gap-4 transition-opacity duration-150 ease-out">
                      <Skeleton height="16px" rounded="sm" width="100%" />
                      <Skeleton height="16px" rounded="sm" width="64px" />
                      <Skeleton height="16px" rounded="sm" width="72px" />
                    </div>
                  </td>
                </tr>
              ))
            ) : topPages.length ? (
              topPages.map((page, index) => (
                <tr key={page.path} className={index === topPages.length - 1 ? '' : 'border-b border-[var(--border-subtle)]'}>
                  <td className="px-5 py-3 text-sm text-[var(--text-secondary)]">
                    <FadeIn>{page.path}</FadeIn>
                  </td>
                  <td className="px-5 py-3 font-data text-sm text-[var(--text-primary)]">
                    <FadeIn>{page.visits}</FadeIn>
                  </td>
                  <td className="px-5 py-3 font-data text-sm text-[var(--text-primary)]">
                    <FadeIn>{page.percentage}%</FadeIn>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-5 py-8" colSpan={3}>
                  <FadeIn>
                    <div className="flex min-h-[180px] flex-col items-center justify-center px-4 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--bg-elevated)]">
                        <Globe className="h-8 w-8 text-[var(--text-tertiary)]" strokeWidth={1.5} />
                      </div>
                      <p className="mt-4 text-[14px] font-medium text-[var(--text-primary)]">
                        Las páginas aparecen cuando tu web tenga visitas
                      </p>
                      <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
                        Este estado se completa solo a medida que llegan datos reales.
                      </p>
                    </div>
                  </FadeIn>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

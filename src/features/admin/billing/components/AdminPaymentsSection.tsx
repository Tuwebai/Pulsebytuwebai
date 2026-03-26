import { CreditCard } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AdminPaymentRecord } from '@/api/admin/adminDashboard.api';

interface AdminPaymentsSectionProps {
  payments: AdminPaymentRecord[];
  onUpdatePaymentStatus: (paymentId: string, newStatus: string) => Promise<void>;
}

export function AdminPaymentsSection({
  payments,
  onUpdatePaymentStatus,
}: AdminPaymentsSectionProps) {
  return (
    <div className="h-full flex flex-col">
      <Card className="h-full rounded-2xl border border-border/50 bg-card shadow-lg transition-all duration-300 hover:shadow-xl">
        <CardHeader className="rounded-t-2xl bg-gradient-to-r from-slate-50 to-slate-100">
          <CardTitle className="flex items-center space-x-3 text-xl font-bold text-card-foreground sm:text-2xl">
            <CreditCard size={20} className="text-violet-600 sm:h-6 sm:w-6" />
            <span>Gestión de Pagos</span>
          </CardTitle>
          <CardDescription className="text-sm text-slate-600 sm:text-base">
            Administra pagos y transacciones del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 p-4 sm:p-6">
          {payments.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-violet-200 sm:h-20 sm:w-20">
                  <CreditCard className="h-8 w-8 text-violet-400 sm:h-10 sm:w-10" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-700">No hay pagos registrados</h3>
                <p className="text-sm text-slate-500">Los pagos aparecerán aquí cuando se registren</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 space-y-3 overflow-y-auto sm:space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-xl bg-muted/50 p-3 transition-all duration-200 hover:bg-muted sm:p-4"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-violet-600 text-sm font-bold text-white sm:h-10 sm:w-10 sm:text-base">
                      $
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-card-foreground sm:text-base">
                        ${payment.amount}
                      </div>
                      <div className="text-xs text-slate-500 sm:text-sm">
                        {payment.description || 'Sin descripción'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Badge
                      variant={
                        payment.status === 'completed'
                          ? 'default'
                          : payment.status === 'pending'
                            ? 'secondary'
                            : 'destructive'
                      }
                      className="text-xs"
                    >
                      {payment.status || 'pending'}
                    </Badge>
                    <Select
                      value={payment.status || 'pending'}
                      onValueChange={(value) => void onUpdatePaymentStatus(payment.id, value)}
                    >
                      <SelectTrigger className="w-24 text-xs sm:w-32 sm:text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="completed">Completado</SelectItem>
                        <SelectItem value="failed">Fallido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

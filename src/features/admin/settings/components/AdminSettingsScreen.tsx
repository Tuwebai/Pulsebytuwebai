import { Cog } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AdminSettingsScreenProps {
  onSaveReference: () => void;
}

export function AdminSettingsScreen({ onSaveReference }: AdminSettingsScreenProps) {
  return (
    <div className="h-full flex flex-col">
      <Card className="h-full rounded-2xl border border-border/50 bg-card shadow-lg transition-all duration-300 hover:shadow-xl">
        <CardHeader className="rounded-t-2xl bg-gradient-to-r from-slate-50 to-slate-100">
          <CardTitle className="flex items-center space-x-3 text-xl font-bold text-card-foreground sm:text-2xl">
            <Cog size={20} className="text-slate-600 sm:h-6 sm:w-6" />
            <span>Ajustes operativos de Pulse</span>
          </CardTitle>
          <CardDescription className="text-sm text-slate-600 sm:text-base">
            Referencia interna para nombre visible, huso horario e idioma del equipo.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col justify-between p-4 sm:p-6">
          <div className="rounded-xl bg-muted/50 p-4 sm:p-6">
            <h3 className="mb-3 text-base font-semibold text-card-foreground sm:text-lg">Identidad visible</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Usá esta referencia para mantener consistente el lenguaje operativo del admin de Pulse.
            </p>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 sm:text-base">Nombre visible del producto</label>
                <Input
                  defaultValue="Pulse by TuWebAI"
                  className="mt-2 border-border bg-white text-sm text-card-foreground sm:text-base"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 sm:text-base">Huso horario operativo</label>
                <Select defaultValue="utc">
                  <SelectTrigger className="mt-2 border-border bg-white text-sm text-card-foreground sm:text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="est">EST</SelectItem>
                    <SelectItem value="pst">PST</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 sm:text-base">Idioma base del equipo</label>
                <Select defaultValue="es">
                  <SelectTrigger className="mt-2 border-border bg-white text-sm text-card-foreground sm:text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-dashed border-border/70 bg-background/70 p-4">
            <p className="text-sm text-muted-foreground">
              Estos ajustes todavía no persisten cambios. El slice alinea copy y estructura mientras se extrae el dominio de settings.
            </p>
          </div>

          <div className="mt-auto flex justify-end pt-4">
            <Button
              className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl sm:px-6 sm:py-3 sm:text-base"
              onClick={onSaveReference}
            >
              Guardar referencia
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

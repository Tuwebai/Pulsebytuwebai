import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TerminosCondiciones() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src="/logoweb.jpg" 
                alt="Pulse by TuWebAI" 
                className="h-6 w-6 sm:h-8 sm:w-8 object-contain rounded-lg"
              />
              <h1 className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                <span className="hidden sm:inline">Pulse by TuWebAI</span>
                <span className="sm:hidden">Pulse</span>
              </h1>
            </div>
            <Link to="/login">
              <Button variant="outline" size="sm" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Volver al Login</span>
                <span className="sm:hidden">Volver</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8 max-w-4xl">
        <div className="relative">
          <div className="absolute inset-0 bg-[#00CCFF] rounded-lg blur-xl opacity-20 -z-10"></div>
          
          <Card className="bg-card border-border shadow-card relative z-10">
            <CardHeader className="text-center pb-4 sm:pb-6 lg:pb-8 p-4 sm:p-6">
              <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Terminos y Condiciones
              </CardTitle>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                Ultima actualizacion: {new Date().toLocaleDateString('es-ES')}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4 sm:space-y-6 text-foreground p-4 sm:p-6">
              <section>
                <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-primary">1. Aceptacion de los Terminos</h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Al acceder y utilizar Pulse by TuWebAI, usted acepta estar sujeto a estos terminos y condiciones. 
                  Si no esta de acuerdo con alguna parte de estos terminos, no debe utilizar nuestros servicios.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">2. Descripcion del Servicio</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Pulse by TuWebAI proporciona una plataforma para la gestion de proyectos web, incluyendo:
                </p>
                <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1 ml-4">
                  <li>Herramientas de desarrollo y colaboracion</li>
                  <li>Editor de codigo integrado</li>
                  <li>Constructor visual de interfaces</li>
                  <li>Gestion de proyectos y equipos</li>
                  <li>Analisis y metricas de rendimiento</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">3. Uso Aceptable</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Usted se compromete a utilizar nuestros servicios unicamente para fines legales y de acuerdo con estos terminos. 
                  Esta prohibido:
                </p>
                <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1 ml-4">
                  <li>Usar los servicios para actividades ilegales o fraudulentas</li>
                  <li>Intentar acceder no autorizado a sistemas o datos</li>
                  <li>Interferir con el funcionamiento de la plataforma</li>
                  <li>Compartir credenciales de acceso con terceros</li>
                  <li>Crear contenido que viole derechos de propiedad intelectual</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">4. Cuentas de Usuario</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Para acceder a ciertos servicios, debe crear una cuenta. Usted es responsable de:
                </p>
                <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1 ml-4">
                  <li>Mantener la confidencialidad de sus credenciales</li>
                  <li>Proporcionar informacion precisa y actualizada</li>
                  <li>Notificar inmediatamente cualquier uso no autorizado</li>
                  <li>Aceptar responsabilidad por todas las actividades en su cuenta</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">5. Propiedad Intelectual</h2>
                <p className="text-muted-foreground leading-relaxed">
                  La plataforma y su contenido son propiedad de Pulse by TuWebAI o sus licenciantes. Usted conserva los derechos 
                  sobre el contenido que crea, pero nos otorga una licencia no exclusiva para utilizarlo en la prestacion 
                  de nuestros servicios.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">6. Limitacion de Responsabilidad</h2>
                <p className="text-muted-foreground leading-relaxed">
                  En ningun caso Pulse by TuWebAI sera responsable por danos indirectos, incidentales, especiales o consecuentes 
                  que resulten del uso o la imposibilidad de usar nuestros servicios. Nuestra responsabilidad total no 
                  excedera el monto pagado por usted en los 12 meses anteriores al evento que dio lugar a la reclamacion.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">7. Disponibilidad del Servicio</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Nos esforzamos por mantener nuestros servicios disponibles, pero no garantizamos que esten libres de 
                  interrupciones. Podemos realizar mantenimiento programado con notificacion previa cuando sea posible.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">8. Modificaciones</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Nos reservamos el derecho de modificar estos terminos en cualquier momento. Los cambios entraran en 
                  vigor inmediatamente despues de su publicacion. Su uso continuado de los servicios constituye aceptacion 
                  de los terminos modificados.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">9. Terminacion</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Podemos suspender o terminar su acceso a nuestros servicios en cualquier momento, con o sin causa, 
                  con notificacion previa. Usted tambien puede cancelar su cuenta en cualquier momento a traves de 
                  la configuracion de su perfil.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">10. Ley Aplicable</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Estos terminos se rigen por las leyes del pais donde opera Pulse by TuWebAI. Cualquier disputa sera resuelta 
                  en los tribunales competentes de dicha jurisdiccion.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">11. Contacto</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Si tiene preguntas sobre estos terminos y condiciones, puede contactarnos en:
                </p>
                <div className="mt-3 p-4 bg-muted rounded-lg">
                  <p className="text-foreground font-medium">Pulse by TuWebAI</p>
                  <p className="text-muted-foreground">Email: tuwebai@gmail.com</p>
                  <p className="text-muted-foreground">Soporte: dashboard.tuweb-ai.com/soporte</p>
                </div>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-card border-t border-border mt-8">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              Pulse by TuWebAI - Tu web, en numeros reales.
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              2026 TuWebAI - tuweb-ai.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

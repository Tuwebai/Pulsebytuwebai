import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SUPPORT_CONTACT } from '@/config/supportContact';
import { ArrowLeft } from 'lucide-react';
import PulseLogo from '@/core/components/PulseLogo';

export default function PoliticaPrivacidad() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PulseLogo size={32} variant="signal" />
              <h1 className="text-base sm:text-lg lg:text-xl font-bold text-foreground">
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

      <div className="flex-1 container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8 max-w-4xl">
        <div className="relative">
          <div className="absolute inset-0 bg-[#00CCFF] rounded-lg blur-xl opacity-20 -z-10"></div>

          <Card className="bg-card border-border shadow-card relative z-10">
            <CardHeader className="text-center pb-4 sm:pb-6 lg:pb-8 p-4 sm:p-6">
              <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Politica de Privacidad
              </CardTitle>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                Ultima actualizacion: {new Date().toLocaleDateString('es-ES')}
              </p>
            </CardHeader>

            <CardContent className="space-y-4 sm:space-y-6 text-foreground p-4 sm:p-6">
              <section>
                <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-primary">1. Informacion que Recopilamos</h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Recopilamos informacion que usted nos proporciona directamente, como cuando crea una cuenta,
                  completa formularios, o se comunica con nosotros. Esto puede incluir:
                </p>
                <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1 ml-4">
                  <li>Informacion de contacto (nombre, direccion de correo electronico)</li>
                  <li>Informacion de la cuenta (nombre de usuario, contrasena)</li>
                  <li>Informacion del perfil (foto de perfil, preferencias)</li>
                  <li>Contenido que usted crea o comparte en nuestra plataforma</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">2. Como Utilizamos su Informacion</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Utilizamos la informacion recopilada para:
                </p>
                <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1 ml-4">
                  <li>Proporcionar, mantener y mejorar nuestros servicios</li>
                  <li>Procesar transacciones y enviar notificaciones relacionadas</li>
                  <li>Responder a sus comentarios, preguntas y solicitudes de servicio al cliente</li>
                  <li>Enviar comunicaciones tecnicas, actualizaciones y mensajes administrativos</li>
                  <li>Detectar, investigar y prevenir actividades fraudulentas y otros usos inapropiados</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">3. Compartir Informacion</h2>
                <p className="text-muted-foreground leading-relaxed">
                  No vendemos, alquilamos ni compartimos su informacion personal con terceros, excepto:
                </p>
                <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1 ml-4">
                  <li>Con su consentimiento explicito</li>
                  <li>Para cumplir con obligaciones legales</li>
                  <li>Con proveedores de servicios que nos ayudan a operar nuestra plataforma</li>
                  <li>Para proteger nuestros derechos, propiedad o seguridad</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">4. Seguridad de Datos</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Implementamos medidas de seguridad tecnicas y organizativas apropiadas para proteger
                  su informacion personal contra acceso no autorizado, alteracion, divulgacion o destruccion.
                  Sin embargo, ningun metodo de transmision por Internet o almacenamiento electronico es 100% seguro.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">5. Sus Derechos</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Usted tiene derecho a:
                </p>
                <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1 ml-4">
                  <li>Acceder a la informacion personal que tenemos sobre usted</li>
                  <li>Corregir informacion inexacta o incompleta</li>
                  <li>Solicitar la eliminacion de su informacion personal</li>
                  <li>Oponerse al procesamiento de su informacion personal</li>
                  <li>Retirar su consentimiento en cualquier momento</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">6. Cookies y Tecnologias Similares</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Utilizamos cookies y tecnologias similares para mejorar su experiencia, analizar el trafico
                  del sitio web y personalizar el contenido. Puede controlar el uso de cookies a traves de
                  la configuracion de su navegador.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">7. Cambios a esta Politica</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Podemos actualizar esta Politica de Privacidad de vez en cuando. Le notificaremos sobre
                  cualquier cambio publicando la nueva Politica en esta pagina y actualizando la fecha de
                  "Ultima actualizacion".
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">8. Contacto</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Si tiene preguntas sobre esta Politica de Privacidad o nuestras practicas de privacidad,
                  puede contactarnos en:
                </p>
                <div className="mt-3 p-4 bg-muted rounded-lg">
                  <p className="text-foreground font-medium">Pulse by TuWebAI</p>
                  <p className="text-muted-foreground">Email: {SUPPORT_CONTACT.publicEmail}</p>
                  <p className="text-muted-foreground">Soporte: {SUPPORT_CONTACT.supportPortalLabel}</p>
                </div>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="bg-card border-t border-border mt-8">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              Pulse by TuWebAI - Tu web, en numeros reales.
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              2026 TuWebAI - pulse.tuweb-ai.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

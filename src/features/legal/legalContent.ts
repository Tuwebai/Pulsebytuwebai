export interface LegalSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LegalDocumentContent {
  eyebrow: string;
  title: string;
  summary: string;
  effectiveDateLabel: string;
  intro: string[];
  highlights: string[];
  sections: LegalSection[];
}

export const privacyPolicyContent: LegalDocumentContent = {
  eyebrow: 'Privacidad',
  title: 'Política de privacidad de Pulse',
  summary: 'Cómo cuidamos los datos que necesitás para operar tu presencia digital con claridad y trazabilidad.',
  effectiveDateLabel: 'Vigente desde abril de 2026',
  intro: [
    'Pulse by TuWebAI te muestra el estado de tu web, tus avances y tus conversaciones operativas en un solo lugar. Para hacerlo, necesitamos procesar ciertos datos personales y de negocio.',
    'Esta política explica qué información usamos, para qué la usamos, con quién puede compartirse y qué opciones tenés si querés consultar, corregir o eliminar tus datos.',
  ],
  highlights: [
    'Usamos tus datos para darte acceso, sostener el servicio y mostrarte contexto útil sobre tu proyecto.',
    'No vendemos tu información ni la usamos para fines ajenos a la operación de Pulse.',
    'Podés escribirnos a pulse@tuweb-ai.com para pedir acceso, rectificación o baja.',
  ],
  sections: [
    {
      title: '1. Qué datos podemos procesar',
      paragraphs: [
        'Podemos procesar datos de identificación y contacto, como nombre, email, teléfono, rol dentro de tu cuenta y la relación con tu proyecto.',
        'También podemos procesar información operativa de Pulse, por ejemplo el estado de tu acceso, tickets de soporte, notificaciones, avances del proyecto y métricas asociadas a tu sitio.',
      ],
      bullets: [
        'Datos de cuenta: email, nombre, avatar y preferencias básicas.',
        'Datos de uso: inicios de sesión, notificaciones, tickets y eventos dentro de Pulse.',
        'Datos del proyecto: dominio, estado, métricas, historial de soporte y referencias operativas relacionadas.',
      ],
    },
    {
      title: '2. Para qué usamos esa información',
      paragraphs: [
        'Usamos tus datos para darte acceso a Pulse, mostrarte el estado real de tu proyecto y mantener una operación segura y trazable.',
        'También los usamos para responder consultas, enviarte avisos relevantes y sostener integraciones técnicas necesarias para que el servicio funcione.',
      ],
      bullets: [
        'Autenticar tu acceso y mantener tu sesión.',
        'Mostrar métricas, tickets, notificaciones y estado del proyecto.',
        'Enviar correos operativos o mensajes vinculados al uso de Pulse.',
        'Detectar errores, prevenir abusos y mejorar la estabilidad del producto.',
      ],
    },
    {
      title: '3. Base operativa y tiempo de conservación',
      paragraphs: [
        'Procesamos la información necesaria para cumplir la relación de servicio entre tu agencia, TuWebAI y Pulse.',
        'Conservamos los datos mientras exista una relación activa o mientras sean necesarios para soporte, trazabilidad técnica, cumplimiento legal o continuidad operativa razonable.',
      ],
    },
    {
      title: '4. Con quién podemos compartir datos',
      paragraphs: [
        'No vendemos ni alquilamos tus datos. Podemos compartir información con proveedores que hacen posible el funcionamiento de Pulse, siempre bajo una finalidad operativa concreta.',
        'Cuando un requerimiento legal válido lo exija, también podremos divulgar la información estrictamente necesaria para cumplir esa obligación.',
      ],
      bullets: [
        'Infraestructura y autenticación.',
        'Correo transaccional y notificaciones.',
        'Almacenamiento y herramientas de observabilidad técnica.',
      ],
    },
    {
      title: '5. Seguridad y resguardo',
      paragraphs: [
        'Aplicamos controles razonables de seguridad para proteger accesos, credenciales, sesiones y datos operativos. Ningún sistema conectado a internet puede prometer riesgo cero, pero trabajamos para reducirlo y responder rápido ante incidentes.',
        'Si detectamos una incidencia relevante que afecte datos o disponibilidad, priorizamos contener el problema y comunicar la situación por los canales apropiados.',
      ],
    },
    {
      title: '6. Tus derechos y tus decisiones',
      paragraphs: [
        'Podés pedir acceso a tus datos, rectificación de información inexacta, actualización de contacto o baja de la cuenta cuando corresponda.',
        'Si tu acceso fue otorgado por una agencia o por TuWebAI, algunos cambios pueden requerir validación con ese operador antes de ejecutarse.',
      ],
    },
    {
      title: '7. Cookies, sesión y autenticación',
      paragraphs: [
        'Pulse utiliza almacenamiento local y mecanismos de sesión para mantenerte autenticado, recordar preferencias y reducir cortes innecesarios durante el uso.',
        'Cuando iniciás sesión con Google u otro proveedor habilitado, la autenticación se procesa a través de servicios externos que también aplican sus propios términos y políticas.',
      ],
    },
    {
      title: '8. Cambios a esta política',
      paragraphs: [
        'Podemos actualizar esta política si cambia el producto, la infraestructura o una exigencia legal relevante. Si el cambio impacta de forma material en el uso de Pulse, lo reflejaremos en esta página y en los canales habituales del servicio.',
      ],
    },
  ],
};

export const termsAndConditionsContent: LegalDocumentContent = {
  eyebrow: 'Términos',
  title: 'Términos y condiciones de Pulse',
  summary: 'Las reglas de uso que ordenan el acceso a Pulse, el alcance del servicio y las responsabilidades básicas de cada parte.',
  effectiveDateLabel: 'Vigente desde abril de 2026',
  intro: [
    'Pulse es la capa de seguimiento, comunicación y lectura operativa de los proyectos gestionados por TuWebAI. Al usar la plataforma, aceptás estos términos.',
    'Si usás Pulse por invitación de tu agencia o de TuWebAI, se entiende que tu acceso forma parte del servicio contratado para ese proyecto o cuenta.',
  ],
  highlights: [
    'Pulse organiza métricas, estado del proyecto, tickets y notificaciones en un entorno privado.',
    'El acceso es personal y no debe compartirse con terceros sin autorización.',
    'Tu agencia o TuWebAI pueden habilitar, limitar o desactivar accesos según el servicio vigente.',
  ],
  sections: [
    {
      title: '1. Alcance del servicio',
      paragraphs: [
        'Pulse te permite consultar avances, métricas, soporte y configuraciones relacionadas con tu proyecto digital.',
        'Algunas funcionalidades pueden variar según el plan, el estado del proyecto, las integraciones activas o la etapa del servicio contratada.',
      ],
    },
    {
      title: '2. Acceso a la cuenta',
      paragraphs: [
        'Tu acceso puede habilitarse por email, contraseña o proveedores externos como Google. Sos responsable de mantener tus credenciales bajo control y de avisarnos si detectás un uso no autorizado.',
        'No está permitido compartir sesiones, automatizar accesos no aprobados ni intentar eludir restricciones de seguridad del producto.',
      ],
    },
    {
      title: '3. Uso esperado de Pulse',
      paragraphs: [
        'Pulse está pensado para seguir el estado de tu proyecto, resolver consultas y ordenar decisiones operativas. Esperamos un uso compatible con ese objetivo.',
      ],
      bullets: [
        'No usar la plataforma para actividades ilegales o fraudulentas.',
        'No intentar acceder a cuentas, datos o proyectos ajenos.',
        'No interferir con el funcionamiento normal de la aplicación o sus integraciones.',
        'No cargar contenido o solicitudes que vulneren derechos de terceros.',
      ],
    },
    {
      title: '4. Datos, métricas y contexto mostrado',
      paragraphs: [
        'Pulse presenta información operativa y de negocio a partir de integraciones, datos internos y cargas de soporte. Hacemos esfuerzos razonables para que el contexto sea útil y consistente, pero ciertos datos pueden depender de terceros o de procesos de sincronización.',
        'Cuando una métrica o estado esté en revisión, incompleto o pendiente, Pulse puede mostrar esa condición para evitar interpretaciones erróneas.',
      ],
    },
    {
      title: '5. Comunicaciones y soporte',
      paragraphs: [
        'Podemos enviarte comunicaciones operativas vinculadas a tu cuenta, tu proyecto, tickets de soporte o hitos del servicio.',
        'Los canales disponibles pueden incluir email, notificaciones dentro de Pulse y otros medios asociados a la operación del servicio.',
      ],
    },
    {
      title: '6. Disponibilidad y cambios',
      paragraphs: [
        'Buscamos que Pulse esté disponible de forma estable, pero pueden existir ventanas de mantenimiento, despliegues, ajustes o incidentes que afecten temporalmente la disponibilidad.',
        'Podemos actualizar funciones, flujos o interfaces si eso mejora la claridad, la seguridad o la continuidad del producto.',
      ],
    },
    {
      title: '7. Propiedad intelectual y uso de la plataforma',
      paragraphs: [
        'El software, la identidad visual de Pulse, su estructura, componentes y materiales asociados pertenecen a TuWebAI o a sus licenciantes.',
        'Tu información y el contenido propio de tu proyecto siguen siendo tuyos o de quien corresponda, pero nos autorizás a procesarlos en la medida necesaria para prestar el servicio.',
      ],
    },
    {
      title: '8. Suspensión o finalización del acceso',
      paragraphs: [
        'Tu agencia o TuWebAI pueden suspender, limitar o desactivar accesos si el servicio finaliza, si hay una necesidad operativa fundada o si se detecta un uso contrario a estos términos.',
        'Cuando corresponda, intentaremos preservar una salida ordenada o comunicar el cambio por los canales habituales.',
      ],
    },
    {
      title: '9. Responsabilidad',
      paragraphs: [
        'Pulse se ofrece como herramienta operativa y de seguimiento. No garantizamos resultados comerciales específicos por el solo uso de la plataforma.',
        'En la medida permitida por la normativa aplicable, la responsabilidad se limita al alcance razonable del servicio efectivamente prestado.',
      ],
    },
    {
      title: '10. Contacto',
      paragraphs: [
        'Si necesitás consultar estos términos, pedir una aclaración o reportar un problema vinculado a tu cuenta, podés escribirnos a pulse@tuweb-ai.com.',
      ],
    },
  ],
};

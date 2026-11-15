/**
 * Ayuda de cada pantalla del admin, en lenguaje simple y con ejemplos. Clave = ruta exacta.
 * Si una pantalla cambia, actualizar acá su texto (los nombres de botones van entre comillas
 * tal cual aparecen en pantalla).
 */
export type PageHelp = {
  title: string;
  purpose: string;
  actions: string[];
  examples: { title: string; steps: string[] }[];
  tips?: string[];
};

export const HELP: Record<string, PageHelp> = {
  '/': {
    title: 'Inicio',
    purpose: 'Un resumen del mes: qué recibos faltan cargar, qué contratos están por vencer y quién debe saldo.',
    actions: [
      'Ver cuántos recibos se cargaron este mes y cuántos faltan.',
      'Ver los contratos que vencen en los próximos 90 días.',
      'Ver los contratos con saldo pendiente (deuda).',
      'Ver los últimos recibos que se generaron.',
    ],
    examples: [
      {
        title: 'Saber a quién le falta pagar este mes',
        steps: [
          'Mirá la tarjeta "Recibos pendientes del mes".',
          'Cada fila es un contrato que todavía no tiene recibo este mes.',
          'Para avisarles a todos juntos, andá a "Recordatorios" → "Recordatorio de pago".',
        ],
      },
    ],
    tips: ['Los números se actualizan solos cada vez que cargás un recibo.'],
  },

  '/recibos': {
    title: 'Recibos',
    purpose: 'Acá se cargan los pagos de cada mes y se mandan el recibo al inquilino y la rendición al dueño.',
    actions: [
      'Cargar un pago nuevo con "Nuevo recibo".',
      'Ver el detalle de un recibo con el ojito.',
      'Ver o descargar el PDF del recibo (ícono verde) o de la rendición (ícono celeste).',
      'Mandarlos por WhatsApp desde esos mismos íconos.',
      'Sacar el listado de pagos de un mes con "Generar PDF".',
    ],
    examples: [
      {
        title: 'Cargar el pago de un inquilino',
        steps: [
          'Tocá "Nuevo recibo".',
          'Elegí el contrato. El alquiler y la forma de pago se completan solos con los del mes anterior.',
          'La fecha, el mes y el año ya vienen con el día de hoy: cambialos solo si hace falta.',
          'Agregá municipal, agua, luz u otros si corresponde.',
          'Tocá "Crear".',
        ],
      },
      {
        title: 'Mandar el recibo por WhatsApp',
        steps: [
          'En la fila del recibo, tocá el ícono verde (Recibo).',
          'Elegí "Enviar al inquilino".',
          'Revisá el teléfono y el mensaje, y tocá "Enviar".',
          'Para la rendición al dueño es igual, con el ícono celeste.',
        ],
      },
    ],
    tips: [
      'El circulito sobre el ícono dice qué pasó con el WhatsApp: gris = enviado, verde = le llegó o lo leyó, rojo = falló.',
      'Pasá el mouse por el ícono o abrí el ojito para ver la hora exacta de envío, entrega y lectura.',
    ],
  },

  '/recordatorios': {
    title: 'Recordatorios',
    purpose: 'Mensajes de WhatsApp a los inquilinos: avisar la fecha de pago o pedir algo que falta.',
    actions: [
      'Mandar el aviso de pago del mes a varios inquilinos juntos.',
      'Pedirle a un inquilino algo puntual (por ejemplo, la foto de un pago).',
      'Ver todo lo que se mandó en "Historial", con filtros.',
    ],
    examples: [
      {
        title: 'Avisar la fecha de pago del mes',
        steps: [
          'Entrá a "Recordatorio de pago".',
          'Escribí la fecha límite, por ejemplo "MIÉRCOLES 10 AL MEDIODÍA".',
          'Ya vienen tildados solo los que todavía no tienen recibo este mes (dicen "sin recibo").',
          'Revisá la lista "Seleccionados" de la derecha. Con la ✕ sacás a alguien.',
          'Tocá "Enviar a N" y confirmá.',
        ],
      },
      {
        title: 'Pedirle a un inquilino la foto de un pago',
        steps: [
          'Entrá a "Faltantes" y buscá al inquilino.',
          'Tocá "Componer", elegí qué le falta (municipal, agua…) y revisá el texto.',
          'Tocá "Enviar".',
        ],
      },
      {
        title: 'Saber si un mensaje llegó',
        steps: [
          'Entrá a "Historial".',
          'Buscá por nombre o teléfono, o filtrá por tipo, estado o fechas.',
          'Tocá el ojito para ver el mensaje y la hora en que llegó o lo leyeron.',
        ],
      },
    ],
    tips: ['Usá el buscador para encontrar rápido a alguien en la lista de inquilinos.'],
  },

  '/contratos': {
    title: 'Contratos',
    purpose: 'Los contratos de alquiler: qué propiedad, de qué dueño, a qué inquilino y por cuánto tiempo.',
    actions: [
      'Cargar un contrato con "Nuevo contrato".',
      'Editar o borrar un contrato desde los tres puntitos.',
      'Filtrar por fechas o por certificación con "Filtros".',
    ],
    examples: [
      {
        title: 'Cargar un contrato nuevo',
        steps: [
          'Antes, fijate que ya existan el dueño, el inquilino y la propiedad.',
          'Tocá "Nuevo contrato".',
          'Elegí la propiedad, el dueño y el inquilino.',
          'Poné la fecha de inicio y de fin, y si está certificado.',
          'Tocá "Crear".',
        ],
      },
    ],
    tips: ['Orden para cargar algo nuevo: dueño → inquilino → propiedad → contrato → recibo.'],
  },

  '/propiedades': {
    title: 'Propiedades',
    purpose: 'Los inmuebles que se alquilan, con su dirección, tipo, precio y foto.',
    actions: [
      'Cargar una propiedad con "Nueva propiedad".',
      'Editar o borrar desde los tres puntitos.',
      'Buscar por dirección o características.',
    ],
    examples: [
      {
        title: 'Cargar una propiedad',
        steps: [
          'Tocá "Nueva propiedad".',
          'Escribí la dirección y elegí la ciudad.',
          'Completá tipo (departamento, casa…), precio, servicios y características.',
          'Si querés, subí una foto (JPG, PNG o WebP, hasta 5 MB).',
          'Tocá "Crear".',
        ],
      },
    ],
  },

  '/propiedades-venta': {
    title: 'Propiedades en venta',
    purpose: 'El catálogo que se muestra en la página web pública, con fotos y mapa.',
    actions: [
      'Cargar una propiedad en venta con sus fotos.',
      'Marcarla como vendida.',
      'Ordenar las categorías.',
      'Publicar los cambios en la página web.',
    ],
    examples: [
      {
        title: 'Publicar una propiedad nueva en la web',
        steps: [
          'Cargá la propiedad con título, categoría, localidad y fotos.',
          'Revisá que esté como "Disponible".',
          'Tocá "Publicar cambios", confirmá con "Publicar" y esperá a que termine.',
        ],
      },
    ],
    tips: ['Los cambios no se ven en la web hasta que tocás "Publicar cambios".'],
  },

  '/ciudades': {
    title: 'Ciudades',
    purpose: 'La lista de ciudades que se eligen al cargar dueños, inquilinos y propiedades.',
    actions: ['Agregar una ciudad que no esté.', 'Corregir el nombre de una ciudad.'],
    examples: [
      {
        title: 'Agregar una ciudad',
        steps: ['Tocá "Nueva ciudad".', 'Completá ciudad, provincia y código postal.', 'Tocá "Crear".'],
      },
    ],
  },

  '/inquilinos': {
    title: 'Inquilinos',
    purpose: 'Las personas que alquilan. Su teléfono se usa para mandarles los WhatsApp.',
    actions: [
      'Cargar un inquilino con "Nuevo inquilino".',
      'Editar sus datos o borrarlo desde los tres puntitos.',
      'Buscar por nombre o correo.',
    ],
    examples: [
      {
        title: 'Cargar un inquilino',
        steps: [
          'Tocá "Nuevo inquilino".',
          'Escribí nombre y apellido, teléfono, correo y ciudad.',
          'Tocá "Crear".',
        ],
      },
    ],
    tips: ['Revisá bien el teléfono: si está mal, el WhatsApp no le llega.'],
  },

  '/duenos': {
    title: 'Dueños',
    purpose: 'Los propietarios de los inmuebles. Su teléfono se usa para mandarles la rendición.',
    actions: [
      'Cargar un dueño con "Nuevo dueño".',
      'Editar sus datos o borrarlo desde los tres puntitos.',
      'Buscar por nombre o correo.',
    ],
    examples: [
      {
        title: 'Cargar un dueño',
        steps: ['Tocá "Nuevo dueño".', 'Escribí nombre y apellido, teléfono, correo y ciudad.', 'Tocá "Crear".'],
      },
    ],
    tips: ['Revisá bien el teléfono: si está mal, la rendición por WhatsApp no le llega.'],
  },

  '/formas-pago': {
    title: 'Formas de pago',
    purpose: 'Las formas en que pagan los inquilinos (efectivo, transferencia, cheque…).',
    actions: ['Agregar una forma de pago nueva.', 'Corregir o borrar una existente.'],
    examples: [
      {
        title: 'Agregar "Mercado Pago"',
        steps: ['Tocá "Nueva forma de pago".', 'Escribí "Mercado Pago".', 'Tocá "Crear".'],
      },
    ],
  },

  '/mantenimiento': {
    title: 'Modo mantenimiento',
    purpose: 'Cierra el sistema por un rato para todos los usuarios menos vos (por ejemplo, durante una actualización).',
    actions: ['Activar o desactivar el modo mantenimiento.', 'Ver qué IP tiene permitido seguir entrando.'],
    examples: [
      {
        title: 'Cerrar el sistema un rato',
        steps: [
          'Activá el modo mantenimiento.',
          'Los demás usuarios ven un aviso de "en mantenimiento".',
          'Cuando termines, desactivalo y todo vuelve a la normalidad.',
        ],
      },
    ],
    tips: ['Acordate de desactivarlo: mientras esté prendido, nadie más puede trabajar.'],
  },

  '/usuarios': {
    title: 'Usuarios',
    purpose: 'Las cuentas que pueden entrar a este panel y qué permisos tiene cada una.',
    actions: [
      'Crear una cuenta nueva con su rol.',
      'Editar o borrar una cuenta.',
      'Cerrar todas las sesiones abiertas de alguien.',
    ],
    examples: [
      {
        title: 'Darle acceso a una persona nueva',
        steps: [
          'Tocá "Nuevo usuario".',
          'Completá nombre, correo, contraseña y elegí el rol.',
          'Tocá "Crear" y pasale el correo y la contraseña.',
        ],
      },
    ],
    tips: ['Si alguien dejó la sesión abierta en otra compu, usá "Revocar todas las sesiones".'],
  },

  '/perfil': {
    title: 'Mi perfil',
    purpose: 'Tus datos y tu contraseña.',
    actions: ['Cambiar tu nombre o tu correo.', 'Cambiar tu contraseña.'],
    examples: [
      {
        title: 'Cambiar la contraseña',
        steps: [
          'En "Cambiar contraseña", escribí la actual.',
          'Escribí la nueva dos veces (mínimo 8 caracteres).',
          'Guardá.',
        ],
      },
    ],
  },
};

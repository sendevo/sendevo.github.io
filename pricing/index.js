"use strict";

/* =============================================================================
   Sendevo – Pricing Calculator
   Application logic: catalog data, state, calculation, rendering, PDF export.
============================================================================= */

/* -----------------------------------------------------------------------------
   CONFIGURATION
----------------------------------------------------------------------------- */

/** Price per hour in ARS. Change this single constant to reprice everything. */
const HOURLY_RATE = 10000;

/**
 * SERVICES_CATALOG
 * Hierarchical catalog of development services.
 * Each service has: id, label, description, hours.
 */
const SERVICES_CATALOG = {
  frontend: {
    label: 'Frontend',
    icon:  '🖥️',
    color: '#43b4da',
    services: [
      {
        id:          'fe-landing',
        label:       'Landing Page',
        description: 'Diseño e implementación de una página lading responsive, optimizada para conversión.',
        hours:       15
      },
      {
        id:          'fe-webapp',
        label:       'Aplicación Web',
        description: 'Aplicación web completa con múltiples vistas, estado global y navegación (React / Vue).',
        hours:       50
      },
      {
        id:          'fe-mobile',
        label:       'App Móvil (React Native)',
        description: 'Aplicación nativa para Android. Despliegue en Play Store y optimización para rendimiento móvil.',
        hours:       80
      },
      {
        id:          'fe-ux',
        label:       'Diseño UX/UI & Wireframes',
        description: 'Prototipado de interfaces, guías de estilo y diseño visual.',
        hours:       30
      },
      {
        id:          'fe-pwa',
        label:       'Progressive Web App (PWA)',
        description: 'Conversión a PWA con soporte offline, notificaciones push e instalación en dispositivos.',
        hours:       20
      },
      {
        id:          'fe-dashboard',
        label:       'Dashboard / Panel de Administración',
        description: 'Panel de control con tablas, gráficos interactivos, filtros y control de acceso.',
        hours:       50
      }
    ]
  },

  backend: {
    label: 'Backend',
    icon:  '⚙️',
    color: '#2c7eb8',
    services: [
      {
        id:          'be-api',
        label:       'API REST',
        description: 'Diseño e implementación de una API RESTful con autenticación, validación y documentación.',
        hours:       40
      },
      {
        id:          'be-db',
        label:       'Diseño de Base de Datos',
        description: 'Modelado relacional o NoSQL, migraciones, índices y procedimientos almacenados.',
        hours:       20
      },
      {
        id:          'be-auth',
        label:       'Autenticación & Autorización',
        description: 'Sistema de login, registro, roles y permisos. Firebase/AWS/Azure.',
        hours:       20
      },
      {
        id:          'be-devops',
        label:       'Deploy & CI/CD en la Nube',
        description: 'Configuración de pipelines de integración/entrega continua. Deploy en AWS, Vercel o Azure.',
        hours:       30
      },
      {
        id:          'be-ml',
        label:       'Ciencia de Datos / Modelo ML',
        description: 'Análisis exploratorio, entrenamiento de modelos de machine learning y visualización de resultados.',
        hours:       60
      },
      {
        id:          'be-realtime',
        label:       'Funcionalidades en Tiempo Real',
        description: 'Implementación de WebSockets, chats, notificaciones push y actualizaciones en vivo.',
        hours:       35
      }
    ]
  },

  integrations: {
    label: 'Integraciones',
    icon:  '🔗',
    color: '#2d9b6f',
    services: [
      {
        id:          'int-payments',
        label:       'Pasarela de Pagos',
        description: 'Integración con Stripe, MercadoPago u otras pasarelas. Manejo de suscripciones y webhooks.',
        hours:       20
      },
      {
        id:          'int-api3rd',
        label:       'Integración con API de Terceros',
        description: 'Conexión con servicios externos (redes sociales, mapas, ERP, etc.).',
        hours:       15
      },
      {
        id:          'int-email',
        label:       'Emails & Notificaciones',
        description: 'Sistema de emails transaccionales, newsletters y notificaciones push (SendGrid, Firebase, etc.).',
        hours:       15
      },
      {
        id:          'int-analytics',
        label:       'Analytics & Tracking',
        description: 'Implementación de Google Analytics 4, Mixpanel, Hotjar u otras herramientas de métricas.',
        hours:       10
      },
      {
        id:          'int-iot',
        label:       'Integración IoT / Hardware',
        description: 'Comunicación con dispositivos físicos a través de MQTT, REST o protocolos embebidos.',
        hours:       45
      },
      {
        id:          'int-crm',
        label:       'CRM / ERP',
        description: 'Sincronización con plataformas CRM (HubSpot, Salesforce) o ERPs (SAP, Odoo).',
        hours:       30
      }
    ]
  }
};

/* -----------------------------------------------------------------------------
   STATE
   Single source of truth: a Set of selected service IDs.
----------------------------------------------------------------------------- */
const selectedIds = new Set();

/* -----------------------------------------------------------------------------
   CALCULATION
----------------------------------------------------------------------------- */

/**
 * Calculates the total estimated cost and hours for the currently
 * selected services.
 * @returns {{ totalCost: number, totalHours: number }}
 */
function calculateTotal() {
  let totalHours = 0;

  for (const [, category] of Object.entries(SERVICES_CATALOG)) {
    for (const service of category.services) {
      if (selectedIds.has(service.id)) {
        totalHours += service.hours;
      }
    }
  }

  return {
    totalHours,
    totalCost: totalHours * HOURLY_RATE
  };
}

/* -----------------------------------------------------------------------------
   UI RENDERING
----------------------------------------------------------------------------- */

/**
 * Formats a number as a currency string (e.g. "$ 2,500").
 * @param {number} value
 * @returns {string}
 */
function formatCurrency(value) {
  return '$ ' + value.toLocaleString('es-AR');
}

/**
 * Returns the full service object for a given id, or null if not found.
 * @param {string} id
 * @returns {{ id, label, description, hours } | null}
 */
function findServiceById(id) {
  for (const [, category] of Object.entries(SERVICES_CATALOG)) {
    const match = category.services.find(s => s.id === id);
    if (match) return match;
  }
  return null;
}

/**
 * Re-renders the summary sidebar and mobile bar to reflect current state.
 */
function updateSummary() {
  const { totalCost, totalHours } = calculateTotal();
  const hasItems = selectedIds.size > 0;

  /* Desktop sidebar */
  const emptyEl = document.getElementById('summary-empty');
  const listEl  = document.getElementById('selected-list');
  const totalEl = document.getElementById('total-display');
  const hoursEl = document.getElementById('hours-display');

  totalEl.textContent = formatCurrency(totalCost);
  hoursEl.textContent = `${totalHours} ${totalHours === 1 ? 'hora estimada' : 'horas estimadas'}`;

  if (hasItems) {
    emptyEl.classList.add('hidden');
    listEl.classList.remove('hidden');
    listEl.innerHTML = '';

    for (const id of selectedIds) {
      const service = findServiceById(id);
      if (!service) continue;
      const li = document.createElement('li');
      li.className = 'flex justify-between items-start text-sm gap-2';
      li.innerHTML = `
        <span class="text-brand-body flex-1 leading-snug" style="color:#44525f;">${service.label}</span>
        <span class="font-semibold whitespace-nowrap" style="color:#43b4da;">${formatCurrency(service.hours * HOURLY_RATE)}</span>
      `;
      listEl.appendChild(li);
    }
  } else {
    emptyEl.classList.remove('hidden');
    listEl.classList.add('hidden');
    listEl.innerHTML = '';
  }

  /* Mobile bottom bar */
  document.getElementById('mobile-total').textContent =
    formatCurrency(totalCost);
  document.getElementById('mobile-count').textContent =
    `${selectedIds.size} ${selectedIds.size === 1 ? 'servicio' : 'servicios'}`;

  const mobileList = document.getElementById('mobile-selected-list');
  mobileList.innerHTML = '';
  for (const id of selectedIds) {
    const service = findServiceById(id);
    if (!service) continue;
    const li = document.createElement('li');
    li.className = 'flex justify-between items-start text-sm gap-2';
    li.innerHTML = `
      <span style="color:#44525f;" class="flex-1 leading-snug">${service.label}</span>
      <span class="font-semibold" style="color:#43b4da;">${formatCurrency(service.hours * HOURLY_RATE)}</span>
    `;
    mobileList.appendChild(li);
  }
}

/**
 * Handles checkbox toggle for a service card.
 * Updates state, card appearance and summary in real-time.
 * @param {string} serviceId
 * @param {HTMLInputElement} checkbox
 */
function toggleService(serviceId, checkbox) {
  if (checkbox.checked) {
    selectedIds.add(serviceId);
  } else {
    selectedIds.delete(serviceId);
  }

  /* Sync card selected style */
  const card = document.getElementById('card-' + serviceId);
  if (card) {
    card.classList.toggle('selected', checkbox.checked);
  }

  updateSummary();
}

/**
 * Clicking anywhere on the card (not just the checkbox) toggles the service.
 * @param {string} serviceId
 */
function toggleCard(serviceId) {
  const checkbox = document.getElementById('chk-' + serviceId);
  if (!checkbox) return;
  checkbox.checked = !checkbox.checked;
  toggleService(serviceId, checkbox);
}

/** Clears all selections and resets the UI. */
function resetAll() {
  selectedIds.clear();

  document.querySelectorAll('.service-checkbox').forEach(chk => {
    chk.checked = false;
  });
  document.querySelectorAll('.service-card').forEach(card => {
    card.classList.remove('selected');
  });

  updateSummary();
}

/* -----------------------------------------------------------------------------
   CATALOG RENDERING
----------------------------------------------------------------------------- */

/**
 * Builds and injects the full service catalog HTML from SERVICES_CATALOG.
 * Called once on DOMContentLoaded.
 */
function renderCatalog() {
  const catalog = document.getElementById('catalog');
  catalog.innerHTML = '';

  for (const [, category] of Object.entries(SERVICES_CATALOG)) {
    /* Category section */
    const section = document.createElement('section');
    section.setAttribute('aria-label', category.label);

    /* Category heading */
    const heading = document.createElement('div');
    heading.className = 'flex items-center gap-3 mb-5';
    heading.innerHTML = `
      <span class="text-2xl" aria-hidden="true">${category.icon}</span>
      <h2 class="font-display text-2xl tracking-wide" style="color:#313338;">${category.label}</h2>
      <div class="flex-1 h-px" style="background:#e2eaf0;"></div>
    `;
    section.appendChild(heading);

    /* Service cards grid */
    const grid = document.createElement('div');
    grid.className = 'grid gap-4 sm:grid-cols-2';

    for (const service of category.services) {
      const card = document.createElement('label');
      card.id        = 'card-' + service.id;
      card.className = 'service-card bg-white rounded-xl shadow-sm p-5 flex gap-4 cursor-pointer select-none';
      card.setAttribute('for', 'chk-' + service.id);

      const badgeColor = category.color;

      card.innerHTML = `
        <input
          type="checkbox"
          id="chk-${service.id}"
          class="service-checkbox mt-0.5"
          onchange="toggleService('${service.id}', this)"
        />
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <span class="font-semibold text-base leading-snug" style="color:#313338;">${service.label}</span>
            <span
              class="cat-badge text-xs font-bold rounded-full px-2.5 py-0.5 whitespace-nowrap flex-shrink-0"
              style="background:${badgeColor}1a; color:${badgeColor};"
            >${service.hours}h</span>
          </div>
          <p class="text-sm mt-1 leading-relaxed" style="color:#44525f;">${service.description}</p>
          <p class="text-sm font-semibold mt-2" style="color:#43b4da;">${formatCurrency(service.hours * HOURLY_RATE)}</p>
        </div>
      `;

      grid.appendChild(card);
    }

    section.appendChild(grid);
    catalog.appendChild(section);
  }
}

/* -----------------------------------------------------------------------------
   MOBILE BOTTOM SHEET TOGGLE
----------------------------------------------------------------------------- */

function toggleMobileSummary() {
  const bar    = document.getElementById('mobile-summary-bar');
  const panel  = document.getElementById('mobile-summary-panel');
  const toggle = document.getElementById('mobile-toggle');
  const chev   = document.getElementById('mobile-chevron');

  const isOpen = bar.classList.toggle('open');
  panel.classList.toggle('hidden', !isOpen);
  toggle.setAttribute('aria-expanded', String(isOpen));
  chev.textContent = isOpen ? '▼' : '▲';
}

/* -----------------------------------------------------------------------------
   PDF EXPORT
   Builds a self-contained HTML document in a hidden iframe and triggers
   the browser's native print dialog (Save as PDF). No external libraries.
----------------------------------------------------------------------------- */

/**
 * Generates a print-ready HTML document with the current budget breakdown
 * and opens the browser's print/save-as-PDF dialog.
 */
function exportToPDF() {
  if (selectedIds.size === 0) {
    alert('Seleccioná al menos un servicio antes de exportar.');
    return;
  }

  const { totalCost, totalHours } = calculateTotal();
  const dateStr = new Date().toLocaleDateString('es-AR', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  /* Build rows grouped by category */
  let rowsHTML   = '';
  let grandTotal = 0;
  let grandHours = 0;

  for (const [, category] of Object.entries(SERVICES_CATALOG)) {
    const selected = category.services.filter(s => selectedIds.has(s.id));
    if (selected.length === 0) continue;

    rowsHTML += `
      <tr class="cat-row">
        <td colspan="3">${category.icon} ${category.label}</td>
      </tr>`;

    for (const service of selected) {
      const cost = service.hours * HOURLY_RATE;
      grandTotal += cost;
      grandHours += service.hours;
      rowsHTML += `
        <tr>
          <td class="service-name">${service.label}</td>
          <td class="center">${service.hours} h</td>
          <td class="right">${formatCurrency(cost)}</td>
        </tr>`;
    }
  }

  /* Print document HTML */
  const docHTML = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Presupuesto – Sendevo Software</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Titillium+Web:wght@300;400;600;700&family=Fjalla+One&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Titillium Web', sans-serif;
      color: #2c3e4d;
      font-size: 13px;
      line-height: 1.6;
      background: #fff;
    }
    .page {
      max-width: 720px;
      margin: 0 auto;
      padding: 48px 40px 60px;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 20px;
      border-bottom: 3px solid #43b4da;
      margin-bottom: 28px;
    }
    .header img { height: 36px; }
    .header-right { text-align: right; }
    .header-right .doc-title {
      font-family: 'Fjalla One', sans-serif;
      font-size: 22px;
      color: #2c3e4d;
      letter-spacing: .04em;
    }
    .header-right .doc-date { font-size: 11px; color: #7a9ab0; margin-top: 2px; }
    .intro {
      background: #f0fafd;
      border-left: 4px solid #43b4da;
      padding: 12px 16px;
      border-radius: 0 6px 6px 0;
      margin-bottom: 32px;
      font-size: 12px;
      color: #44525f;
    }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead th {
      background: #2c3e4d;
      color: #fff;
      font-family: 'Fjalla One', sans-serif;
      font-size: 12px;
      letter-spacing: .08em;
      text-transform: uppercase;
      padding: 9px 14px;
      text-align: left;
    }
    thead th.center { text-align: center; }
    thead th.right  { text-align: right; }
    tbody tr { border-bottom: 1px solid #e8f0f5; }
    tbody tr:last-child { border-bottom: none; }
    tbody td { padding: 9px 14px; vertical-align: top; }
    td.center { text-align: center; color: #44525f; }
    td.right  { text-align: right; font-weight: 600; color: #2c7eb8; }
    td.service-name { font-weight: 600; color: #2c3e4d; }
    tr.cat-row td {
      background: #eef2f5;
      color: #44525f;
      font-family: 'Fjalla One', sans-serif;
      font-size: 11px;
      letter-spacing: .1em;
      text-transform: uppercase;
      padding: 6px 14px;
    }
    tr.total-row td {
      padding: 12px 14px;
      font-family: 'Fjalla One', sans-serif;
      font-size: 15px;
      background: #2c3e4d;
      color: #fff;
    }
    tr.total-row td.right { color: #43b4da; font-size: 18px; }
    .disclaimer {
      font-size: 10.5px;
      color: #7a9ab0;
      margin-top: 16px;
      border-top: 1px solid #e8f0f5;
      padding-top: 12px;
      line-height: 1.7;
    }
    .footer {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      text-align: center;
      font-size: 10px;
      color: #aab8c2;
      padding: 8px;
      border-top: 1px solid #eef2f5;
      background: #fff;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <img src="../images/logo_square_black.png" alt="Sendevo" />
      <div class="header-right">
        <div class="doc-title">Presupuesto de Desarrollo</div>
        <div class="doc-date">${dateStr}</div>
      </div>
    </div>
    <div class="intro">
      Este documento presenta una estimación de costos de desarrollo de software basada en los
      servicios seleccionados en la calculadora de Sendevo Software. La validez del presupuesto es de 30 días a partir de la fecha indicada.
    </div>
    <table>
      <thead>
        <tr>
          <th>Servicio</th>
          <th class="center">Horas</th>
          <th class="right">Subtotal (ARS)</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHTML}
        <tr><td colspan="3" style="padding:4px 0;"></td></tr>
        <tr class="total-row">
          <td>Total estimado</td>
          <td class="center">${grandHours} h</td>
          <td class="right">${formatCurrency(grandTotal)}</td>
        </tr>
      </tbody>
    </table>
    <div class="disclaimer">
      * Tarifa base utilizada: <strong>ARS ${HOURLY_RATE}/hora</strong>. El costo final puede variar
      según la complejidad técnica, integraciones adicionales y ajustes de alcance acordados con el
      equipo de Sendevo. Contactanos en <strong><a href=https://sendevosoftware.com.ar target=_blank/>sendevosoftware.com.ar</a></strong> para una cotización formal.
    </div>
  </div>
  <div class="footer">Sendevo Software &nbsp;·&nbsp; sendevosoftware.com.ar &nbsp;·&nbsp; Documento generado el ${dateStr}</div>
  <script>window.onload = function() { window.print(); };<\/script>
</body>
</html>`;

  /* Open in a hidden iframe, then print */
  let iframe = document.getElementById('pdf-iframe');
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'pdf-iframe';
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:none;';
    document.body.appendChild(iframe);
  }

  const iframeDoc = iframe.contentWindow.document;
  iframeDoc.open();
  iframeDoc.write(docHTML);
  iframeDoc.close();
}

/* -----------------------------------------------------------------------------
   INIT
----------------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  /* Display the hourly rate in the sidebar note */
  document.getElementById('rate-display').textContent = HOURLY_RATE;

  /* Build the catalog DOM */
  renderCatalog();

  /* Initialize summary (empty state) */
  updateSummary();
});

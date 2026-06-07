# Prompts iniciales — Feature "Añadir Candidato"

Este documento registra, en orden, los prompts utilizados para construir la
funcionalidad **"Añadir Candidato"** en el ATS (backend Express + TypeScript +
Prisma/PostgreSQL y frontend React + TypeScript), junto con una breve
descripción de lo que se logró en cada paso.

---

## 1. Exploración inicial y plan

### Prompt

> Sos un desarrollador full-stack senior. Este proyecto es un ATS (Applicant
> Tracking System) con backend en Express + TypeScript + Prisma (PostgreSQL)
> y frontend en React (Create React App) + TypeScript.
>
> Antes de escribir nada de código, quiero que:
> 1. Leas el README.md de la raíz y cualquier documentación del ticket sobre
>    la funcionalidad "Añadir Candidato".
> 2. Explores la estructura de backend/ y frontend/ para entender cómo está
>    organizado el código (schema de Prisma, rutas, controladores, componentes
>    de React).
> 3. Me propongas un plan paso a paso para implementar "Añadir Candidato": dar
>    de alta un candidato (nombre, apellido, email, teléfono, dirección) tanto
>    desde un formulario en el frontend como vía API (POST /candidates en el
>    backend :3010), guardándolo en la base vía Prisma, con validaciones y
>    manejo de errores.
>
> NO escribas ni modifiques código todavía. Solo leé, explorá y devolveme el
> plan para que lo revisemos juntos.

### Qué se logró

- Lectura del `README.md` y exploración de `backend/` y `frontend/`.
- Diagnóstico del estado inicial: backend con todo en `index.ts` (sin
  rutas/controladores, sin `express.json()` ni CORS), schema de Prisma con solo
  el modelo `User` y sin migraciones; frontend con el CRA por defecto.
- Se detectó que **no existía documentación del ticket** más allá del README.
- Se entregó un **plan paso a paso** (modelo Prisma, capas de backend, endpoint
  `POST /candidates`, formulario y cliente API en el frontend) y una lista de
  decisiones técnicas a confirmar antes de codear.

---

## 2. Confirmación de decisiones técnicas

### Prompt

> Perfecto, vamos con estas decisiones:
>
> 1. Campos: nombre, apellido y email obligatorios; teléfono y dirección opcionales.
> 2. Email único: sí, rechazá duplicados con 409.
> 3. Refactor: sí, separá el backend en routes / controllers / services + capa de
>    datos con Prisma. Quiero arquitectura limpia.
> 4. Validación: zod en el backend como fuente de verdad. En el front, validación
>    liviana (requeridos / formato de email) para feedback rápido.
> 5. UI: Material UI para el formulario (componentes accesibles, labels, estados de
>    error). Simple y prolijo, sin sobrediseñar.
> 6. Tests: incluí tests del endpoint POST /candidates en el backend (camino feliz,
>    error de validación, email duplicado). Frontend sin tests por ahora.
>
> Con esto, arrancá con la implementación siguiendo tu plan. Mostrame los cambios a
> medida que los vas haciendo.

### Qué se logró

Implementación completa de la feature según las decisiones:

- **Prisma:** modelo `Candidate` (`firstName`, `lastName`, `email` único,
  `phone?`, `address?`, `createdAt`, `updatedAt`) y migración aplicada.
- **Arquitectura limpia del backend** en capas:
  - `src/lib/prisma.ts` — cliente Prisma singleton.
  - `src/validators/candidateValidator.ts` — schema **zod** (fuente de verdad).
  - `src/services/candidateService.ts` — capa de datos.
  - `src/controllers/candidateController.ts` — orquestación y mapeo de errores.
  - `src/routes/candidateRoutes.ts` — router de `/candidates`.
  - `src/middleware/errorHandler.ts` — manejo de errores 500.
  - `src/app.ts` / `src/index.ts` — app Express (con `cors` y `express.json()`)
    separada del arranque del servidor.
- **Endpoint `POST /candidates`** con contrato: `201` (creado), `400`
  (validación), `409` (email duplicado, código Prisma `P2002`), `500` (inesperado).
- **Tests** del endpoint (camino feliz, error de validación y email duplicado):
  4/4 en verde.
- **Frontend:** cliente API (`src/api/candidates.ts`) y formulario con **Material
  UI**, validación liviana en cliente y feedback de éxito/error.

> Nota: la elección inicial de Material UI derivó luego en un conflicto de
> versiones de React (ver paso 3).

---

## 3. Corrección del error de React/MUI (página en blanco)

### Prompt

> El frontend levanta pero la página queda en blanco. En la consola del navegador
> aparecen estos errores:
>
> 1. "Invalid hook call. Hooks can only be called inside of the body of a function
>    component" (con las 3 razones típicas: versiones de React/React DOM que no
>    coinciden, romper reglas de hooks, o más de una copia de React en la app).
> 2. "Uncaught TypeError: Cannot read properties of null (reading 'useContext')",
>    disparado dentro de componentes de MUI: CssBaseline y Container.
> 3. "The above error occurred in the <CssBaseline> component" y en
>    "<ForwardRef(Container)>".
>
> O sea, MUI no encuentra una instancia válida de React: es un conflicto de versiones
> o una copia duplicada de React introducida al instalar Material UI sobre este CRA.
>
> Diagnosticá la causa exacta (revisá versiones de react, react-dom y @mui/* en
> package.json, y corré `npm ls react` para ver copias duplicadas). Arreglalo para que
> MUI sea compatible con la versión de React del proyecto. Si el conflicto no se
> resuelve limpio, está OK reemplazar MUI por estilos simples a mano en el formulario.
> Verificá que el frontend compile y renderice sin errores en consola.

### Qué se logró

- **Diagnóstico:** la instalación de MUI desde `frontend/` subió al directorio
  raíz (que tenía un `package-lock.json`) e instaló **MUI v9 + React 19** en un
  `node_modules` de la raíz, mientras `frontend/node_modules/react` seguía en
  **18.3.1**. Webpack cargaba **dos copias de React** → `Invalid hook call` /
  `Cannot read properties of null (reading 'useContext')`. Además, MUI v9 exige
  React 19, incompatible con el React 18 fijado por `react-scripts 5`.
- **Solución (estilos a mano):** se eliminó la contaminación de la raíz
  (`node_modules/`, `package.json`, `package-lock.json` recién creados, sin
  trackear), dejando una única instancia de React (18.3.1), y se reemplazó MUI por
  un formulario con HTML + CSS propio:
  - `frontend/src/components/AddCandidateForm.tsx` reescrito sin MUI, con
    validación liviana y atributos de accesibilidad (`aria-invalid`,
    `aria-describedby`).
  - `frontend/src/components/AddCandidateForm.css` con los estilos del formulario.
  - `frontend/src/App.tsx` simplificado.
- **Verificación:** `npm run build` con `CI=true` compiló en verde, sin errores
  y sin MUI en el bundle. Con una sola copia de React, la página renderiza sin
  los errores de consola.

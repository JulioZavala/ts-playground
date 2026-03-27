# Documentación Swagger — TS Playground API

Guía completa de cómo integrar Swagger (OpenAPI 3.0) en un proyecto **Express + TypeScript**.

> **Enfoque adoptado:** toda la documentación vive en `src/lib/swagger.ts`. Los archivos de rutas quedan **100% limpios**, sin ninguna anotación.

---

## ¿Qué es Swagger?

Swagger (ahora llamado **OpenAPI**) es un estándar para describir APIs REST. Con las herramientas que instalamos puedes:

- **Ver** todos tus endpoints en una interfaz web interactiva.
- **Probar** cada endpoint directamente desde el navegador.
- **Compartir** la documentación con tu equipo o clientes.

---

## Paquetes instalados

```bash
npm install swagger-ui-express swagger-jsdoc
npm install --save-dev @types/swagger-ui-express @types/swagger-jsdoc
```

| Paquete                     | Descripción                                              |
|-----------------------------|----------------------------------------------------------|
| `swagger-jsdoc`             | Genera el spec OpenAPI a partir de un objeto JS/TS       |
| `swagger-ui-express`        | Sirve la interfaz visual de Swagger en una ruta Express  |
| `@types/swagger-ui-express` | Tipos TypeScript para swagger-ui-express                 |
| `@types/swagger-jsdoc`      | Tipos TypeScript para swagger-jsdoc                      |

---

## Estructura de archivos creados / modificados

```
src/
├── lib/
│   └── swagger.ts    ← TODA la documentación aquí (schemas + paths)
├── routes/
│   └── product.routes.ts   ← Sin cambios, archivo limpio ✅
└── app.ts            ← Agrega la ruta /api/docs
```

---

## Paso 1 — Crear la configuración de Swagger (`src/lib/swagger.ts`)

Este archivo tiene **tres secciones** y es el único lugar donde vive la documentación:

1. `info` + `servers` — Metadatos generales
2. `components.schemas` — Modelos de datos reutilizables
3. `paths` — Descripción de cada endpoint

```typescript
import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: { title: "Mi API", version: "1.0.0" },
    servers: [{ url: "http://localhost:3000" }],

    components: {
      schemas: {
        Product: {
          type: "object",
          properties: {
            id:    { type: "integer", example: 1 },
            name:  { type: "string",  example: "Laptop" },
            price: { type: "number",  example: 999.99 },
          },
        },
      },
    },

    // ✅ Todos los endpoints documentados aquí
    paths: {
      "/api/products": {
        get: {
          summary: "Obtener todos los productos",
          tags: ["Products"],
          responses: {
            200: {
              description: "Lista de productos",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Product" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [], // ← vacío: no escanea ningún archivo de rutas
};

export const swaggerSpec = swaggerJsdoc(options);
```

### Estructura de un `path`

| Clave         | Descripción                                              |
|---------------|----------------------------------------------------------|
| `summary`     | Título corto del endpoint                                |
| `tags`        | Agrupa endpoints en secciones de la UI                   |
| `description` | Descripción larga                                        |
| `parameters`  | Parámetros de URL (`/{id}`) o query (`?page=1`)          |
| `requestBody` | Cuerpo del request (POST / PUT)                          |
| `responses`   | Posibles respuestas con sus códigos HTTP                 |
| `$ref`        | Referencia a un schema de `components/schemas`           |

---

## Paso 2 — Las rutas quedan sin cambios

El archivo `product.routes.ts` permanece igual de limpio:

```typescript
router.get("/", (req, res) => controller.getAll(req, res));
router.get("/:id", (req, res) => controller.getById(req, res));
router.post("/", (req, res) => controller.create(req, res));
router.put("/:id", (req, res) => controller.update(req, res));
router.delete("/:id", (req, res) => controller.destroy(req, res));
```

---

## Paso 3 — Montar Swagger UI en Express (`src/app.ts`)

```typescript
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./lib/swagger";

// Agregar ANTES de tus rutas de negocio
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

---

## Cómo usar la interfaz

1. Levanta el servidor: `npm run dev`
2. Abre tu navegador en: **http://localhost:3000/api/docs**
3. Verás todos los endpoints agrupados por tags.
4. Haz clic en un endpoint → **"Try it out"** → completa los campos → **"Execute"**.

---

## Endpoints documentados

### Products — `/api/products`

| Método   | Ruta               | Descripción                      | Código éxito |
|----------|--------------------|----------------------------------|--------------|
| `GET`    | `/api/products`    | Listar todos los productos       | `200`        |
| `GET`    | `/api/products/:id`| Obtener producto por ID          | `200`        |
| `POST`   | `/api/products`    | Crear un nuevo producto          | `201`        |
| `PUT`    | `/api/products/:id`| Actualizar un producto           | `200`        |
| `DELETE` | `/api/products/:id`| Eliminar un producto             | `200`        |

---

## Agregar un nuevo recurso (ejemplo: Orders)

Cuando crees nuevas rutas, sigue estos pasos:

1. **Agrega sus schemas** en `src/lib/swagger.ts` dentro de `components.schemas`.
2. **Agrega el tag** nuevo en las anotaciones de la nueva ruta:
   ```
   * tags: [Orders]
   ```
3. **Incluye el nuevo archivo de rutas** en la opción `apis` de `swagger.ts` si ya usas el glob `*.ts` ya estará cubierto automáticamente.

---

## Tips

- Usa `$ref: '#/components/schemas/NombreSchema'` para reutilizar schemas y evitar duplicación.
- Agrupa siempre tus endpoints con `tags` para que la UI sea más legible.
- Para producción, puedes exponer el JSON del spec en `/api/docs.json` así:
  ```typescript
  app.get("/api/docs.json", (req, res) => res.json(swaggerSpec));
  ```

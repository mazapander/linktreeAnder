# Linktree Clone

Sistema de enlaces personalizable con panel de administración y analíticas básicas.

## Funcionalidades

### Fase 1 (Implementada)
- Página pública por slug (ej: links.anderdata.es/tu-usuario)
- Perfil con foto, nombre y descripción
- Lista de enlaces personalizables
- Tracking de visitas y clics
- Panel de administración básico
- Soporte UTM por enlace

### Fase 2 (Planificada)
- GitHub activity, últimos proyectos
- Badge de disponibilidad
- Mini timeline profesional
- Integración con redes sociales

### Fase 3 (Planificada)
- Temas visuales
- Orden drag & drop
- Activar/desactivar links
- QR personalizado

## Tech Stack

| Capa | Tecnología |
|------|------------|
| Frontend | React + Vite + Tailwind |
| Backend | Flask + SQLAlchemy |
| Base de datos | PostgreSQL |
| Infra | Docker Compose + Nginx |

## Estructura del proyecto

```
linktree/
├── backend/
│   ├── app/
│   │   ├── models/     # Modelos SQLAlchemy
│   │   ├── routes/     # Blueprints Flask
│   │   └── schemas/    # Marshmallow schemas
│   ├── tests/          # Tests pytest
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── api/        # Cliente API
│   │   ├── pages/      # Componentes de página
│   │   └── components/ # Componentes reutilizables
│   └── package.json
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── nginx.frontend.conf
├── doc/
├── docker-compose.yml
├── requirements.txt
└── .gitignore
```

## API Endpoints

### Público
- `GET /<slug>` - Obtener perfil público
- `GET /<slug>/click/<link_id>` - Registrar clic y devolver URL con UTM

### Admin
- `POST /admin/profiles` - Crear perfil
- `GET /admin/profiles/<slug>` - Obtener perfil
- `PUT /admin/profiles/<slug>` - Actualizar perfil
- `POST /admin/profiles/<slug>/links` - Crear enlace
- `PUT /admin/profiles/<slug>/links/<id>` - Actualizar enlace
- `DELETE /admin/profiles/<slug>/links/<id>` - Eliminar enlace
- `POST /admin/profiles/<slug>/reorder` - Reordenar enlaces

### Analytics
- `GET /api/profiles/<slug>/stats?period=7d|30d|90d` - Estadísticas

## Licencia

MIT
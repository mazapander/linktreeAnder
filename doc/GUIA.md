# Guía de Ejecución

## Requisitos previos

- Docker y Docker Compose instalados
- Puertos 80, 5432 disponibles

## Ejecución con Docker

```bash
# Clonar o entrar en el directorio del proyecto
cd linktree

# Ejecutar con Docker Compose
docker-compose up -d

# Ver logs
docker-compose logs -f
```

La aplicación estará disponible en:
- **Frontend**: http://localhost
- **API Backend**: http://localhost/api
- **Admin**: http://localhost/admin

## Ejecución en desarrollo

### Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# o
.\venv\Scripts\Activate.ps1  # Windows

# Instalar dependencias
pip install -r requirements.txt

# Variables de entorno
export DATABASE_URL=postgresql://linktree:linktree_secret@localhost:5432/linktree
export FLASK_ENV=development
export SECRET_KEY=dev-secret-key

# Ejecutar
python run.py
```

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

El frontend en desarrollo usa proxy para redirigir /api y /admin al backend en puerto 5000.

## Primeros pasos

1. Ir a http://localhost/admin/mi-slug
2. Crear el perfil con nombre y descripción
3. Añadir enlaces desde el panel
4. Visitar http://localhost/mi-slug para ver la página pública

## Tests

```bash
cd backend
pytest tests/ -v
```

## Docker commands útiles

```bash
# Reiniciar servicios
docker-compose restart

# Ver estado
docker-compose ps

# Parar y eliminar
docker-compose down

# Reconstruir imágenes
docker-compose build --no-cache
```
# Smart Condominium - Frontend React

## 🏠 Descripción

Frontend desarrollado en React con Vite para el sistema Smart Condominium. Esta aplicación web implementa completamente el **Módulo 1: Gestión de Usuarios y Autenticación** con una interfaz moderna, responsiva y funcional.

## ✨ Características Principales

### 🔐 Sistema de Autenticación Completo
- **Login seguro** con validaciones
- **Registro de usuarios** con formulario multi-paso  
- **Gestión de sesiones** con tokens JWT
- **Logout** individual y global
- **Credenciales de prueba** incluidas

### 👤 Gestión de Perfiles de Usuario
- **Perfil completo** con información personal
- **Actualización de datos** en tiempo real
- **Cambio de contraseña** seguro
- **Foto de perfil** (subir/eliminar)
- **Validaciones** automáticas

### 🛡️ Sistema de Roles
- **Asignación de roles** por administradores
- **Control de permisos** granular
- **Tres tipos de usuario**: Admin, Residente, Seguridad
- **Interfaz intuitiva** para gestión de roles

### 📊 Dashboard Interactivo
- **Estadísticas en tiempo real**
- **Estado del sistema**
- **Acciones rápidas**
- **Navegación intuitiva**
- **Información del módulo**

## 🚀 Tecnologías Utilizadas

- **React 19** - Framework principal
- **Vite** - Build tool y desarrollo
- **Tailwind CSS 4** - Styling y diseño responsivo
- **React Router DOM** - Navegación
- **Axios** - Cliente HTTP
- **Material-UI Icons** - Iconografía

## 📁 Estructura del Proyecto

```
Frontend_React/Smart_front/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── DashboardStats.jsx
│   │   ├── FunctionalityTabs.jsx
│   │   ├── Header.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── QuickActions.jsx
│   │   ├── Sidebar.jsx
│   │   └── SystemStatus.jsx
│   ├── context/             # Context API
│   │   └── AuthContext.jsx
│   ├── pages/               # Páginas principales
│   │   ├── Dashboard.jsx
│   │   ├── Documentation.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── RoleAssignment.jsx
│   │   └── UserProfile.jsx
│   ├── services/            # Servicios API
│   │   ├── auth.service.js
│   │   └── userService.js
│   ├── App.jsx              # Componente principal
│   ├── App.css              # Estilos globales
│   └── main.jsx             # Punto de entrada
├── public/                  # Archivos estáticos
├── package.json             # Dependencias
└── README.md               # Este archivo
```

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js (versión 18 o superior)
- npm o yarn
- Backend Django ejecutándose en puerto 8000

### Pasos de Instalación

1. **Navegar al directorio del proyecto**
   ```bash
   cd "Frontend_React/Smart_front"
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Editar `.env`:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

4. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:5173
   ```

## 👥 Credenciales de Prueba

| Rol | Usuario | Contraseña | Permisos |
|-----|---------|------------|----------|
| **Administrador** | `admin` | `clave123` | Acceso completo |
| **Residente** | `carlos` | `password123` | Acceso básico |
| **Seguridad** | `seguridad` | `security123` | Acceso intermedio |

## 📱 Páginas Implementadas

### 1. **Login** (`/login`)
- Formulario de autenticación
- Validaciones en tiempo real
- Credenciales de prueba visibles
- Diseño responsivo
- Animaciones suaves

### 2. **Registro** (`/register`)
- Formulario multi-paso (2 pasos)
- Validaciones completas
- Información personal opcional
- Previsualización de datos
- Manejo de errores

### 3. **Dashboard** (`/dashboard`)
- Estadísticas del módulo
- Estado del sistema
- Acciones rápidas
- Tabs informativos
- Navegación lateral

### 4. **Perfil de Usuario** (`/profile`)
- Información personal completa
- Actualización de datos
- Cambio de contraseña
- Gestión de foto de perfil
- Validaciones en vivo

### 5. **Asignación de Roles** (`/roles`)
- Lista de todos los usuarios
- Filtros de búsqueda
- Cambio de roles en vivo
- Control de permisos
- Interfaz intuitiva

### 6. **Documentación** (`/documentation`)
- Información del módulo
- Guía de uso
- Endpoints disponibles
- Estadísticas de testing
- Referencias técnicas

## 🎨 Características de Diseño

### 🎯 Responsive Design
- **Mobile First** - Optimizado para móviles
- **Tablet Support** - Adaptación perfecta
- **Desktop Experience** - Interfaz completa

### 🌈 Sistema de Colores
- **Primario**: Azul/Índigo gradient
- **Éxito**: Verde para estados positivos
- **Error**: Rojo para validaciones
- **Neutro**: Grises para información

### ⚡ Animaciones
- **Fade In** para carga de componentes
- **Hover Effects** en botones e interactivos
- **Loading States** para operaciones async
- **Smooth Transitions** en navegación

## 🔌 Integración con Backend

### Endpoints Utilizados
```javascript
// Autenticación
POST /api/login/                    // Login
POST /api/logout/                   // Logout
POST /api/token/                    // JWT Login

// Registro
POST /api/backend/users/register/   // Registrar usuario

// Perfil
GET  /api/profile/                  // Obtener perfil
PATCH /api/profile/                 // Actualizar perfil
POST /api/profile/change-password/  // Cambiar contraseña
POST /api/profile/picture/          // Subir foto
DELETE /api/profile/picture/        // Eliminar foto

// Roles (Admin)
GET  /api/backend/users/            // Listar usuarios
POST /api/backend/users/{id}/assign-role/ // Asignar rol
```

### Autenticación
- **Token Authentication** para requests
- **JWT Support** para renovación
- **Interceptors** para manejo automático
- **Logout automático** en tokens expirados

## 📊 Estado de Implementación

### ✅ Completado (100%)
- [x] **T1**: Registro de Usuario
- [x] **T2**: Iniciar y cerrar sesión  
- [x] **T3**: Gestionar perfil de usuario
- [x] **T4**: Asignar rol a usuario

### 🔧 Funcionalidades Extra
- [x] Dashboard interactivo
- [x] Documentación integrada
- [x] Sistema de roles visual
- [x] Responsive design
- [x] Animaciones y UX

## 🚧 Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo

# Construcción
npm run build        # Build para producción
npm run preview      # Preview del build

# Linting
npm run lint         # Verificar código
```

## 🌐 Compatibilidad

### Navegadores Soportados
- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

### Resoluciones
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

## 📞 Soporte

Para dudas o problemas:
1. Revisar la **documentación integrada** (`/documentation`)
2. Verificar las **credenciales de prueba**
3. Comprobar que el **backend esté ejecutándose**
4. Validar las **variables de entorno**

## 🎯 Próximos Pasos

1. **Implementar módulos adicionales**
2. **Añadir notificaciones push**
3. **Integrar chat en tiempo real**
4. **Optimizar rendimiento**
5. **Añadir modo oscuro**

---

**🏆 Estado del Proyecto**: ✅ **PRODUCCIÓN READY**

*Smart Condominium v1.0 - Desarrollado con React, Vite y Tailwind CSS*

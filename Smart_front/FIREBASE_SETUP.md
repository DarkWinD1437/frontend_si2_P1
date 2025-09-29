# Configuración de Firebase para Notificaciones Push

## Problema Actual
El sistema está configurado para usar Firebase Cloud Messaging (FCM), pero las claves API no son válidas.

## Solución: Obtener Claves Reales de Firebase

### Paso 1: Ir a Firebase Console
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: `smart-condominium-101a9`

### Paso 2: Obtener la Configuración Web
1. En el menú lateral, ve a **Project Settings** (⚙️)
2. Ve a la pestaña **General**
3. En la sección **Your apps**, haz click en el ícono **Web** (`</>`)
4. Si no tienes una app web, créala:
   - **App nickname**: Smart Condominium Web
   - **Also set up Firebase Hosting**: No (por ahora)
5. Copia la configuración que aparece

### Paso 3: Actualizar Variables de Entorno
Edita el archivo `.env` en `Frontend_React/Smart_front/` con los valores reales:

```env
# Reemplaza estos valores con los de Firebase Console
VITE_FIREBASE_API_KEY=AIzaSyCopiaAquiTuApiKeyReal
VITE_FIREBASE_AUTH_DOMAIN=smart-condominium-101a9.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=smart-condominium-101a9
VITE_FIREBASE_STORAGE_BUCKET=smart-condominium-101a9.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=CopiaAquiTuSenderIdReal
VITE_FIREBASE_APP_ID=1:CopiaAquiTuAppIdReal:web:abcdef123456
VITE_FIREBASE_VAPID_KEY=BDKE56mfQfvdF0tKbh_4i0k-YS9AYOOG8CL9jJb_7EebJkXtvAxCFH7SSZpr5YQ4WclBA0V0aqbqZF5BivveUNY
```

### Paso 4: Configurar VAPID Key (Opcional pero recomendado)
1. En Firebase Console → Project Settings → Cloud Messaging
2. En **Web Push certificates**, genera una nueva key pair
3. Actualiza `VITE_FIREBASE_VAPID_KEY` con la nueva clave pública

### Paso 5: Reiniciar la aplicación
```bash
npm run dev
```

## Modo Desarrollo (Actual)
Mientras configuras Firebase, el sistema funciona en **modo mock**:
- ✅ Notificaciones simuladas cada 2 minutos
- ✅ Badge se actualiza automáticamente
- ✅ Funciona sin configuración Firebase
- ✅ Pruebas del flujo completo posibles

## Verificación
Una vez configurado correctamente, deberías ver en la consola:
```
Firebase notifications initialized successfully
```
En lugar de:
```
Using mock notification mode for development
```

## Backend ya está configurado ✅
El backend Django ya tiene toda la configuración necesaria en `.env`:
- FCM_PROJECT_ID=smart-condominium-101a9
- FCM_CREDENTIALS_PATH=C:\firebase\firebase-service-account.json
- VAPID keys configuradas

¡Solo necesitas actualizar las claves del frontend!</content>
<parameter name="filePath">C:\Users\PG\Desktop\Materias\Sistemas de informacion 2\Proyectos\Parcial 1\FIREBASE_SETUP.md
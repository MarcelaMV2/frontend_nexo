# 🚀 Nexo - Frontend

<p align="center">
  <img src="https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react">
  <img src="https://img.shields.io/badge/Vite-Build%20Tool-646CFF?style=for-the-badge&logo=vite">
  <img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript">
</p>


# 📌 Descripción del proyecto

**Nexo - Frontend** es la aplicación web desarrollada con **React** encargada de proporcionar la interfaz de interacción para la plataforma de reclutamiento y selección automatizada.

Este frontend permite que reclutadores, administradores y postulantes puedan interactuar con el sistema mediante interfaces dinámicas, intuitivas y adaptadas a cada etapa del proceso de selección.

La aplicación forma parte de una arquitectura compuesta por:

- Un backend desarrollado en **Laravel**, encargado de la lógica de negocio y gestión de información.
- Una base de datos **PostgreSQL** para almacenamiento persistente.
- Un módulo de automatización desarrollado con **n8n** para ejecutar procesos automáticos.


---

# 🎯 Objetivo del frontend

El objetivo principal del frontend es brindar una experiencia eficiente para la gestión del proceso de reclutamiento, permitiendo:

- Crear y administrar formularios personalizados.
- Recibir postulaciones mediante formularios dinámicos.
- Visualizar información de candidatos.
- Gestionar estados de postulantes.
- Coordinar entrevistas.
- Consultar información del proceso de selección.


---

# 🏗️ Arquitectura de comunicación

El frontend funciona como la capa de presentación del sistema Nexo.


```
                 Usuario

                    │

                    ▼

              React Frontend

                    │

             API REST (HTTP)

                    │

                    ▼

             Laravel Backend

                    │

                    ▼

              PostgreSQL


                    │

                    ▼

              Automatización

                  n8n
```


El frontend se comunica con el backend mediante solicitudes HTTP hacia la API REST, permitiendo enviar información ingresada por los usuarios, consultar datos almacenados y actualizar estados dentro del proceso de reclutamiento.


---

# 🔌 Comunicación con Backend

La comunicación entre frontend y backend permite:

## 📤 Envío de información

El frontend envía al backend:

- Datos de formularios.
- Información de postulantes.
- Configuración de convocatorias.
- Datos de entrevistas.
- Actualizaciones realizadas por administradores.


## 📥 Consulta de información

El frontend obtiene desde la API:

- Formularios creados.
- Respuestas de candidatos.
- Estados del proceso.
- Historial de entrevistas.
- Información administrativa.


## 🔄 Actualización de procesos

Cada acción realizada desde la interfaz genera una comunicación con el backend para mantener sincronizada la información del sistema.


---

# 👥 Tipos de usuarios


## 🧑‍💼 Reclutadores / Administradores

El frontend proporciona herramientas para:

- Crear convocatorias.
- Diseñar formularios dinámicos.
- Revisar postulaciones.
- Gestionar candidatos.
- Programar entrevistas.


## 👤 Postulantes

Permite:

- Acceder a formularios públicos.
- Completar información solicitada.
- Enviar postulaciones.
- Participar del proceso de selección.


---

# ✨ Principales funcionalidades


## 📝 Constructor de formularios dinámicos

Permite crear formularios personalizados según los requisitos de cada puesto.

Incluye:

- Creación de preguntas.
- Selección de tipos de campos.
- Campos obligatorios.
- Opciones de respuesta.
- Vista previa del formulario.


## 📋 Gestión de postulaciones

Permite al reclutador:

- Visualizar candidatos.
- Revisar información enviada.
- Cambiar estados.
- Gestionar aprobaciones y rechazos.


## 📅 Gestión de entrevistas

Incluye:

- Programación de entrevistas.
- Visualización de calendario.
- Reprogramaciones.
- Seguimiento del estado de entrevistas.


---

# 🛠️ Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| React | Construcción de interfaces |
| Vite | Herramienta de desarrollo y compilación |
| JavaScript | Lógica del frontend |
| CSS | Diseño de interfaces |
| API REST | Comunicación con backend |


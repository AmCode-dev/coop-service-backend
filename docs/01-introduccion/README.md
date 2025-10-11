# 📖 01. Introducción

Documentación fundamental para entender la arquitectura y bases del sistema.

## 📋 **Orden de Lectura Recomendado**

### 1. **prisma-module.md** 🏗️
- **¿Qué es?** Configuración de la base de datos y ORM
- **¿Para quién?** Desarrolladores y DevOps
- **¿Cuándo leer?** Antes de configurar cualquier cosa
- **Contenido clave:** 
  - Schema de base de datos
  - Modelos y relaciones
  - Configuración de Prisma

---

## 🎯 **Conceptos Clave**

### **Multi-Tenancy**
El sistema permite que múltiples cooperativas compartan la misma infraestructura manteniendo sus datos separados y seguros.

### **Prisma ORM**
Herramienta de acceso a datos que proporciona:
- Type-safety completo
- Migraciones automáticas
- Query builder intuitivo

### **Arquitectura por Capas**
```
Frontend (React/Angular) 
    ↓
API REST (NestJS)
    ↓
Business Logic (Services)
    ↓
Data Layer (Prisma)
    ↓
Database (PostgreSQL)
```

---

## 🚀 **Próximo Paso**

Una vez que entiendas la arquitectura básica, continúa con:
👉 **02-configuracion-inicial/** para aprender a configurar tu primera cooperativa.

---

*Si eres nuevo en el proyecto, ¡este es tu punto de partida!*
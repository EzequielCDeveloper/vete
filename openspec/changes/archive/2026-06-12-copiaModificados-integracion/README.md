# Integración de cambios desde copiaModificados

| Campo             | Valor                                                                 |
| ----------------- | --------------------------------------------------------------------- |
| **Estado**        | `propuesta`                                                            |
| **Versión**       | `1.0.0`                                                                |
| **Analizado por** | gentle-orchestrator                                                    |
| **Destino**       | src/ + backend/                                                        |

## Resumen

Integrar al proyecto VetCare los cambios de UI/UX y funcionalidad presentes en
`copiaModificados/src/`, adaptando todas las llamadas de datos mock (`mockService`)
a llamadas asíncronas a la API real (`apiService.ts`).

El análisis de cada archivo de copiaModificados reveló que **la mayoría ya fue portada**
en sesiones anteriores. Solo quedan **5 diferencias puntuales** que implementar.

## Archivos analizados y su estado

| Archivo copiaModificados | Estado en src actual  | ¿Requiere cambios? |
|--------------------------|-----------------------|---------------------|
| `App.tsx`                | ✅ Idéntico           | No                  |
| `features/auth/LoginPage.tsx` | ✅ Ya porta API (loading, FaPaw) | No (copia tiene delay artificial innecesario) |
| `layouts/AppLayout/Sidebar.tsx` | ✅ Mejor que copia (incluye PasswordChangeModal) | No |
| `features/dashboard/DashboardPage.tsx` | ✅ API con lookup maps | No |
| `features/procedures/ProcedureListPage.tsx` | ✅ API + usersMap | No |
| `features/procedures/ProcedureEditModal.tsx` | ✅ API | No |
| `features/appointments/AppointmentListPage.tsx` | ✅ API, filtros avanzados, confirm cancel, save-to-history | **Parcial** (falta MedicalHistorySelectorModal) |
| `features/appointments/AppointmentDetailModal.tsx` | ✅ API, info paciente, historial | **Parcial** (falta selector historia) |
| `features/appointments/NewAppointmentPage.tsx` | ✅ API, wizard 2 pasos, historial toggle | **Parcial** (falta selector historia) |
| `features/appointments/DayAppointmentsPage.tsx` | ✅ API, confirm cancel | No |
| `features/medical/MedicalHistoryPage.tsx` | ✅ API, cards expandibles | **Parcial** (faltan filtros avanzados) |
| `features/medical/MedicalHistorySelectorModal.tsx` | ✅ API, selector funcional | **Parcial** (creación deshabilitada) |

## Dependencias entre archivos

```mermaid
flowchart TD
    A[MedicalHistorySelectorModal] -->|mejora creación| B[Nuevo endpoint POST /medical-records/standalone]
    
    C[AppointmentListPage] -->|integra| A
    D[AppointmentDetailModal] -->|integra| A
    E[NewAppointmentPage] -->|integra| A
    
    F[MedicalHistoryPage] -->|agrega| G[AdvancedFilters component\n(ya existe en AppointmentListPage)]

    B -->|opcional| H[Backend: sp_create_medical_record]
```


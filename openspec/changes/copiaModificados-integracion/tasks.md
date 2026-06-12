# Tasks: Integración de copiaModificados

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~470 (additions) |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

## Phase 1: Foundation — Backend + API

- [x] 1.1 `db/schema.sql` — Add `sp_create_medical_record_standalone` SP (INSERT into Medical_history with NULL id_medical_appointment, store nombre + pacienteId + createdBy)
- [x] 1.2 `db/schema.sql` — Update `sp_get_medical_records`: add `mh.name AS nombre`, LEFT JOIN to handle NULL `id_medical_appointment`, include `mh.medical_notes AS notas`
- [x] 1.3 `db/schema.sql` — Update `sp_get_medical_record_by_patient` same pattern: add nombre, LEFT JOIN
- [x] 1.4 `backend/src/helpers/schemas.js` — Add `standaloneMedicalRecordSchema` (nombre, pacienteId, pacienteNombre, pacienteEspecie optional, createdBy optional)
- [x] 1.5 `backend/src/controllers/medicalRecordController.js` — Add `createStandalone` method: validate, call SP, return new record
- [x] 1.6 `backend/src/routes/medicalRecordRoutes.js` — Add `router.post('/standalone', auth, validate(standaloneMedicalRecordSchema), controller.createStandalone)`
- [x] 1.7 `src/data/services/apiService.ts` — Add `medicalRecordApi.createStandalone(data)` → `POST /medical-records/standalone`

## Phase 2: MedicalHistorySelectorModal — Enable creation

- [x] 2.1 `src/features/medical/MedicalHistorySelectorModal.tsx` — Add `pacienteEspecie` to props interface
- [x] 2.2 `src/features/medical/MedicalHistorySelectorModal.tsx` — Wire `handleConfirmCreate`: call `medicalRecordApi.createStandalone(...)`, on success call `onConfirm` + refresh `records`
- [x] 2.3 `src/features/medical/MedicalHistorySelectorModal.tsx` — Add `handleCreateNew` function + `<FaPlus /> Crear Historial` button in selection mode `.searchRow`

## Phase 3: Appointment page selector integrations

- [x] 3.1 `src/features/appointments/AppointmentListPage.tsx` — Add `showSelector` + `selectedRecord` state, render `<MedicalHistorySelectorModal>`, on confirm set `selectedRecord` + show notes modal with `selectedRecord.id`, add badge + "Cambiar" button
- [x] 3.2 `src/features/appointments/AppointmentDetailModal.tsx` — Add `showSelector` + `selectedRecord` state, render selector before save-to-history flow, pass `selectedRecord.id` to `medicalRecordApi.create`, add badge + "Cambiar" button
- [x] 3.3 `src/features/appointments/NewAppointmentPage.tsx` — Toggle `guardarHistorial` opens selector, on confirm set `selectedRecord`, pass `medicalRecordId: selectedRecord?.id` in `appointmentApi.create` payload, add badge + "Cambiar" button

## Phase 4: MedicalHistoryPage filters

- [x] 4.1 `src/features/medical/MedicalHistoryPage.tsx` — Add state: `showAdvancedFilters`, `filterAnimal`, `filterDueno`, `filterEspecie`, `filterProcedimiento`, `filterHora`, `filterFecha`
- [x] 4.2 `src/features/medical/MedicalHistoryPage.tsx` — Add toggle button (`FaFilter`) + filter fields UI (same pattern as AppointmentListPage) + `clearAdvancedFilters` function
- [x] 4.3 `src/features/medical/MedicalHistoryPage.tsx` — Integrate filters into `filteredRecords` computation

## Phase 5: Build verification

- [x] 5.1 Run `npm run build` and fix any TypeScript/compilation errors

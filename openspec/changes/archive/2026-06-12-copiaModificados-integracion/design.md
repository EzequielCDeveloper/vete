# Design: Integración de copiaModificados

## Technical Approach

Enable standalone MedicalRecord creation in MedicalHistorySelectorModal, connect it to
3 appointment pages via a selector-first flow, add advanced filters to MedicalHistoryPage,
and create backend `POST /medical-records/standalone` endpoint.

**Strategy**: Port the UX from `copiaModificados` (mock-driven) to the real async API,
reusing the existing `AppointmentListPage` filter pattern verbatim for `MedicalHistoryPage`.

---

## Architecture Decisions

### Decision: Standalone MedicalRecord storage

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Allow NULL `id_medical_appointment` + add `id_patient` | Schema migration needed, existing SPs must be updated to LEFT JOIN | **RECOMMENDED** — clean data model |
| Create placeholder appointment with special state | No schema change, but pollutes `Medical_appointment` with meaningless rows | Rejected — adds tech debt |
| Store standalone records in a separate table | New table, duplicate read logic | Rejected — over-engineered |

**Chosen**: New SP `sp_create_medical_record_standalone` + schema migration: make
`Medical_history.id_medical_appointment` NULLABLE, add nullable `id_patient`. Update
`sp_get_medical_records` to LEFT JOIN and handle NULL case.

### Decision: Selector flow in appointment pages

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Two-step flow (selector → notes modal) | More state but clear UX per spec | **CHOSEN** — matches copiaModificados UX |
| Single combined modal | Less state but coupling modal concerns | Rejected — hard to maintain |

### Decision: MedicalHistoryPage filters

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Copy existing AppointmentListPage filter pattern | Consistent UX, known code | **CHOSEN** — same state/filtering/clear pattern |
| Extract shared AdvancedFilters component | DRY, but premature | Rejected — only 2 pages use it, defer |

---

## Data Flow

```
┌──────────────────────────────┐
│  MedicalHistorySelectorModal │
│  (select OR create)          │
└──────┬──────────────┬────────┘
       │ create       │ select
       ▼              ▼
POST /medical-records    onConfirm(record)
     /standalone          ──► parent stores selectedRecord
                          ──► shows notes modal with record.id
                          ──► on save: POST /appointments with
                               medicalRecordId in payload
```

```
┌──────────────────┐    ┌─────────────────────┐
│ AppointmentList  │───►│ MedicalHistorySelect │
│  clic "Historial"│    │ orModal              │
└──────────────────┘    └─────────┬───────────┘
                                  │ onConfirm
                                  ▼
                         ┌────────────────────┐
                         │ "Guardar Historial" │
                         │ modal (notas, save) │
                         └─────────┬──────────┘
                                   │ save
                                   ▼
                         medicalRecordApi.create()
```

```
NewAppointmentPage flow:
  Toggle ON  ──► MedicalHistorySelectorModal ──► selectedRecord
  Submit     ──► appointmentApi.create({..., medicalRecordId})
```

---

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/features/medical/MedicalHistorySelectorModal.tsx` | Modify | Add `pacienteEspecie` prop + `handleCreateNew` btn + wire `handleConfirmCreate` to `createStandalone()` |
| `src/features/appointments/AppointmentListPage.tsx` | Modify | Add `showSelector`/`selectedRecord` state, integrate selector before history notes modal |
| `src/features/appointments/AppointmentDetailModal.tsx` | Modify | Same selector pattern as list page |
| `src/features/appointments/NewAppointmentPage.tsx` | Modify | Toggle opens selector, submit passes `medicalRecordId` |
| `src/features/medical/MedicalHistoryPage.tsx` | Modify | Add advanced filters (copy AppointmentListPage pattern) |
| `src/data/services/apiService.ts` | Modify | Add `medicalRecordApi.createStandalone(data)` |
| `backend/src/controllers/medicalRecordController.js` | Modify | Add `createStandalone` method |
| `backend/src/routes/medicalRecordRoutes.js` | Modify | Add `POST /standalone` route |
| `backend/src/helpers/schemas.js` | Modify | Add `standaloneMedicalRecordSchema` |
| `db/schema.sql` | Modify | Add `sp_create_medical_record_standalone` + schema migration for nullable FK |

---

## Interfaces / Contracts

```typescript
// apiService.ts — new method
medicalRecordApi.createStandalone(data: {
  nombre: string;
  pacienteId: string;
  pacienteNombre: string;
  pacienteEspecie: string;
  createdBy: string;
}): Promise<MedicalRecord>

// MedicalHistorySelectorModal — updated props
interface MedicalHistorySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (record: MedicalRecord) => void;
  pacienteNombre?: string;
  pacienteId?: string;
  pacienteEspecie?: string;  // NEW
}
```

```javascript
// Backend — Zod schema (standaloneMedicalRecordSchema)
const standaloneMedicalRecordSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  pacienteId: z.coerce.number().int().positive('ID de paciente inválido'),
  pacienteNombre: z.string().min(1),
  pacienteEspecie: z.string().optional().default(''),
  createdBy: z.string().optional(),
});

// Backend — route
router.post('/standalone', auth, validate(standaloneMedicalRecordSchema), medicalRecordController.createStandalone);
```

```
POST /api/medical-records/standalone
Body: { nombre, pacienteId, pacienteNombre, pacienteEspecie }
→ 201 { id, pacienteId, pacienteNombre, pacienteEspecie, citas: [], ... }
```

---

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Frontend: selector creation flow, filter logic | Manual verify in browser |
| Integration | Backend: POST /standalone response shape | Manual curl test |
| Build | TypeScript compilation | `npm run build` |
| UX | All 4 pages: create, select, navigate flows | Manual walkthrough |

No testing infrastructure exists (`strict_tdd: false`). Testing is manual.

---

## Migration / Rollback

**Schema migration**: ALTER `Medical_history` to allow NULL `id_medical_appointment`,
add nullable `id_patient`. Existing data unaffected — all existing records have both values.

**Rollback**: Revert schema ALTER, remove SP, revert frontend/backend files.
Feature flags are not needed — new endpoint is additive, old paths unchanged.

---

## Open Questions

- [ ] Should `NewAppointmentPage` require selector or keep optional toggle?
      Current spec: toggle opens selector. Proposal: keep optional per existing UX.
- [ ] Schema migration: do we allow NULL FK or create placeholder appointments?
      Decision above recommends NULL FK — confirm with DB admin.
- [ ] `sp_get_medical_records` currently returns `mh.name AS notas` — should we add
      a separate `nombre` field? The SP needs to be updated for standalone records anyway.

# Core Services

This folder contains application-level services, organized as one folder per service.

## Structure

Each service uses this layout:

- `<service-name>/<service-name>.service.ts`
- `<service-name>/<service-name>.service.spec.ts` (when unit tests exist)

Example:

- `cart/cart.service.ts`
- `cart/cart.service.spec.ts`

## Naming Rules

- Use kebab-case for folder and file names.
- Keep folder and service file names identical (for example, `order/order.service.ts`).
- Keep one primary injectable service per folder.

## Exports

- Re-export services from `index.ts` in this folder.
- Prefer importing from the core barrel (`src/app/core`) where practical.
- Use direct service paths only when a barrel import would create circular dependencies.

## When Adding a New Service

1. Create a new folder in `core/services` with a kebab-case name.
2. Add `<name>.service.ts` (and `<name>.service.spec.ts` if tested).
3. Export the service in `core/services/index.ts`.
4. Update imports to the core barrel when appropriate.
5. Run build and tests to confirm no path regressions.

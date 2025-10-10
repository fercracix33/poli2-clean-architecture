# Test Specifications: Application Internationalization System

## Referencia
- **Master PRD:** `00-master-prd.md`
- **Supabase Spec:** N/A (No database required)
- **Feature ID:** i18n-001
- **Assigned Agent:** Test Agent
- **Status:** ✅ Completed
- **Date:** 2025-10-09

---

## 1. Estrategia de Testing

### Cobertura Objetivo
- **Entities Layer:** 100% (schemas already implemented, tests PASS)
- **Hook Layer:** > 90% (useLocale hook tests FAIL until implemented)
- **Component Layer:** > 90% (LocaleSelector tests FAIL until implemented)
- **Configuration Layer:** > 90% (routing/request tests FAIL until implemented)
- **Integration:** All critical user flows covered

### Herramientas
- **Framework:** Vitest (NOT Jest)
- **React Testing:** @testing-library/react
- **User Interactions:** @testing-library/user-event
- **Mocking:** vi.mock() (Vitest native)
- **Coverage:** c8 (built into Vitest)

### Test Philosophy
- **Red-Green-Refactor:** All tests created before implementation
- **Behavior-Driven:** Test user-facing behavior, not implementation details
- **Accessibility-First:** Verify WCAG 2.1 AA compliance in component tests

---

## 2. Test Files Created

### ✅ Entities Tests (SHOULD PASS)
**File:** `app/src/features/i18n/entities.test.ts`
**Status:** Tests PASS (entities.ts already implemented by Architect)
**Coverage:** 100%

**Test Suites:**
1. **LocaleSchema Tests**
   - ✅ Accepts valid locales ("en", "es")
   - ✅ Rejects invalid locales ("fr", "de", null, undefined, numbers, objects)
   - ✅ Rejects case variations ("EN", "En")

2. **LocaleCookieSchema Tests**
   - ✅ Accepts valid cookie structure with all fields
   - ✅ Applies default maxAge when omitted (31536000 seconds)
   - ✅ Rejects wrong cookie name
   - ✅ Rejects invalid locale values
   - ✅ Rejects negative/zero maxAge

3. **TranslationNamespaceSchema Tests**
   - ✅ Accepts all valid namespaces (common, auth, navigation, errors, validation)
   - ✅ Rejects invalid namespaces

4. **TranslationKeySchema Tests**
   - ✅ Accepts valid format: "namespace.key"
   - ✅ Accepts nested format: "namespace.nested.key"
   - ✅ Rejects keys without namespace
   - ✅ Rejects uppercase, numbers, special chars, spaces
   - ✅ Rejects malformed keys (leading/trailing/double dots)

5. **Type Guard Tests**
   - ✅ isLocale() returns true/false correctly
   - ✅ isTranslationKey() returns true/false correctly
   - ✅ isTranslationNamespace() returns true/false correctly
   - ✅ Type narrowing works in TypeScript

6. **Constants Tests**
   - ✅ DEFAULT_LOCALE is "en"
   - ✅ SUPPORTED_LOCALES contains exactly ["en", "es"]
   - ✅ LOCALE_COOKIE_NAME is "NEXT_LOCALE"
   - ✅ LOCALE_COOKIE_MAX_AGE is 31536000 (1 year)
   - ✅ LOCALE_LABELS has correct labels for both locales
   - ✅ LOCALE_FLAGS has correct emoji flags

**Total Tests:** 80+ assertions
**Expected Result:** ✅ ALL PASS

---

### ❌ Hook Tests (SHOULD FAIL)
**File:** `app/src/features/i18n/hooks/useLocale.test.ts`
**Status:** Tests FAIL (hook not implemented yet)
**Coverage Target:** > 90%

**Interface Defined:**
```typescript
interface UseLocaleReturn {
  locale: Locale;
  setLocale: (newLocale: Locale) => void;
  isChangingLocale: boolean;
}
```

**Test Suites:**
1. **Getting Current Locale**
   - ❌ Returns locale from cookie when exists ("en", "es")
   - ❌ Returns DEFAULT_LOCALE when cookie doesn't exist
   - ❌ Returns DEFAULT_LOCALE for invalid cookie values

2. **Setting Locale**
   - ❌ Updates cookie when setLocale called
   - ❌ Sets cookie with maxAge=31536000
   - ❌ Sets cookie with path=/
   - ❌ Sets cookie with SameSite=Lax
   - ❌ Reloads page after setting locale
   - ❌ Does NOT reload when setting same locale

3. **isChangingLocale State**
   - ❌ Is false initially
   - ❌ Becomes true when setLocale called
   - ❌ Stays false when setting same locale

4. **Error Handling**
   - ❌ Throws error for invalid locale
   - ❌ Throws error for null/undefined
   - ❌ Handles cookie write failures

5. **Edge Cases**
   - ❌ Handles malformed cookie strings
   - ❌ Handles multiple cookies
   - ❌ Handles case sensitivity

**Total Tests:** 20+
**Expected Result:** ❌ ALL FAIL (useLocale not defined)

---

### ❌ Component Tests (SHOULD FAIL)
**File:** `app/src/features/i18n/components/LocaleSelector.test.tsx`
**Status:** Tests FAIL (component not implemented yet)
**Coverage Target:** > 90%

**Test Suites:**
1. **Rendering**
   - ❌ Renders current locale label
   - ❌ Renders current locale flag
   - ❌ Shows Spanish when locale is "es"

2. **Dropdown Interactions**
   - ❌ Shows dropdown when clicked
   - ❌ Contains both language options
   - ❌ Calls setLocale when selecting language
   - ❌ Closes dropdown after selection
   - ❌ Closes dropdown on Escape key

3. **Accessibility**
   - ❌ Has role="combobox" on trigger
   - ❌ Has aria-label
   - ❌ Is keyboard navigable (Tab, Enter, Arrow keys)

4. **Loading State**
   - ❌ Shows loading indicator when isChangingLocale=true
   - ❌ Disables button when changing locale

5. **Edge Cases**
   - ❌ Does not show current locale in dropdown

**Total Tests:** 15+
**Expected Result:** ❌ ALL FAIL (LocaleSelector not defined)

**Mocks:**
- useLocale hook mocked with controlled return values

---

## 3. Mocking Strategy

### Document.cookie Mock
```typescript
let mockCookies: Record<string, string> = {};
Object.defineProperty(document, 'cookie', {
  get: () => Object.entries(mockCookies).map(([k, v]) => `${k}=${v}`).join('; '),
  set: (str: string) => {
    const [kv] = str.split(';');
    const [key, value] = kv.split('=');
    if (value) mockCookies[key.trim()] = value.trim();
  },
  configurable: true,
});
```

### window.location.reload Mock
```typescript
const mockReload = vi.fn();
Object.defineProperty(window, 'location', {
  value: { reload: mockReload },
  writable: true,
});
```

---

## 4. Expected Test Results (Current State)

### Phase 1: After Test Agent (NOW)
```
✅ entities.test.ts        PASS  (80+ tests)
❌ useLocale.test.ts       FAIL  (20+ tests - hook not defined)
❌ LocaleSelector.test.tsx FAIL  (15+ tests - component not defined)
❌ request.test.ts         FAIL  (4 tests - config not defined)
⏳ routing.test.ts         SKIP  (5 tests - will pass when created)
❌ i18n.integration.test.tsx FAIL (6 tests - feature incomplete)
---------------------------------------------------
TOTAL: 80+ PASS, 45+ FAIL (Expected - TDD Red Phase ✅)
```

---

## 5. Handoff to Implementer Agent

### What You Must Implement

**Priority 1: Configuration**
- [ ] `app/src/i18n/routing.ts`
- [ ] `app/src/i18n/request.ts`

**Priority 2: useLocale Hook**
- [ ] `app/src/features/i18n/hooks/useLocale.ts`

### Critical Requirements
- ❌ DO NOT modify test files
- ❌ DO NOT implement LocaleSelector (UI/UX Agent's job)
- ✅ MUST make all hook tests pass
- ✅ Follow TDD: Run tests frequently

---

**Completado por:** Test Agent
**Fecha:** 2025-10-09
**Tests Totales:** 130+
**Tests Pasando:** 80+ (entities only)
**Tests Fallando:** 50+ (expected - TDD Red Phase)

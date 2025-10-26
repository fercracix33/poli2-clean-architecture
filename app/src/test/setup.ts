import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock server-only module to allow testing of server components
vi.mock('server-only', () => ({}))
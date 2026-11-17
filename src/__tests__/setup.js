import '@testing-library/jest-dom'
// Provide a minimal localStorage stub for jsdom (already included but ensure clean slate)
beforeEach(() => { localStorage.clear(); sessionStorage.clear() })

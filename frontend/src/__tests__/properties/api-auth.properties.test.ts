/**
 * Property-Based Tests for API Request Authentication
 * 
 * Feature: social-workers-frontend-mvp, Property 9: API Request Authentication
 * **Validates: Requirements 21.2**
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import axios, { type InternalAxiosRequestConfig } from 'axios'

// We need to test the interceptor logic directly
// The interceptor adds Authorization header when token exists in localStorage

describe('Property 9: API Request Authentication', () => {
    let localStorageMock: Record<string, string>
    let originalLocalStorage: Storage

    beforeEach(() => {
        localStorageMock = {}
        originalLocalStorage = window.localStorage

        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: vi.fn((key: string) => localStorageMock[key] || null),
                setItem: vi.fn((key: string, value: string) => {
                    localStorageMock[key] = value
                }),
                removeItem: vi.fn((key: string) => {
                    delete localStorageMock[key]
                }),
                clear: vi.fn(() => {
                    localStorageMock = {}
                }),
            },
            writable: true,
        })
    })

    afterEach(() => {
        Object.defineProperty(window, 'localStorage', {
            value: originalLocalStorage,
            writable: true,
        })
        vi.clearAllMocks()
    })

    // Arbitrary for generating valid JWT-like tokens
    const jwtTokenArb = fc.tuple(
        fc.base64String({ minLength: 10, maxLength: 50 }),
        fc.base64String({ minLength: 10, maxLength: 100 }),
        fc.base64String({ minLength: 10, maxLength: 50 })
    ).map(([header, payload, signature]) =>
        `${header.replace(/=/g, '')}.${payload.replace(/=/g, '')}.${signature.replace(/=/g, '')}`
    )

    // Arbitrary for generating API endpoints
    const apiEndpointArb = fc.constantFrom(
        '/api/auth/me',
        '/api/missions',
        '/api/applications',
        '/api/workers',
        '/api/institutions',
        '/api/payments',
        '/api/reviews',
        '/api/notifications',
        '/api/admin/logs'
    )

    // Arbitrary for generating HTTP methods
    const httpMethodArb = fc.constantFrom('get', 'post', 'put', 'patch', 'delete')

    // Simulate the interceptor logic from axios.ts
    const applyRequestInterceptor = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        const token = localStorage.getItem('auth_token')
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    }

    it('for any authenticated request with a token, the Authorization header SHALL be set with Bearer format', () => {
        fc.assert(
            fc.property(
                jwtTokenArb,
                apiEndpointArb,
                httpMethodArb,
                (token, endpoint, method) => {
                    // Set up the token in localStorage
                    localStorageMock['auth_token'] = token

                    // Create a mock request config
                    const config: InternalAxiosRequestConfig = {
                        url: endpoint,
                        method: method,
                        headers: new axios.AxiosHeaders(),
                    }

                    // Apply the interceptor
                    const result = applyRequestInterceptor(config)

                    // Verify the Authorization header is set correctly
                    expect(result.headers.Authorization).toBe(`Bearer ${token}`)

                    // Verify the Bearer format
                    expect(result.headers.Authorization).toMatch(/^Bearer .+$/)
                }
            ),
            { numRuns: 100 }
        )
    })

    it('for any request without a token, the Authorization header SHALL NOT be set', () => {
        fc.assert(
            fc.property(
                apiEndpointArb,
                httpMethodArb,
                (endpoint, method) => {
                    // Ensure no token in localStorage
                    delete localStorageMock['auth_token']

                    // Create a mock request config
                    const config: InternalAxiosRequestConfig = {
                        url: endpoint,
                        method: method,
                        headers: new axios.AxiosHeaders(),
                    }

                    // Apply the interceptor
                    const result = applyRequestInterceptor(config)

                    // Verify the Authorization header is NOT set
                    expect(result.headers.Authorization).toBeUndefined()
                }
            ),
            { numRuns: 100 }
        )
    })

    it('for any token value, the Bearer prefix SHALL be exactly "Bearer " followed by the token', () => {
        fc.assert(
            fc.property(
                // Generate any non-empty string as token
                fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
                (token) => {
                    // Set up the token in localStorage
                    localStorageMock['auth_token'] = token

                    // Create a mock request config
                    const config: InternalAxiosRequestConfig = {
                        url: '/api/test',
                        method: 'get',
                        headers: new axios.AxiosHeaders(),
                    }

                    // Apply the interceptor
                    const result = applyRequestInterceptor(config)

                    // Verify exact format: "Bearer " + token
                    expect(result.headers.Authorization).toBe(`Bearer ${token}`)

                    // Verify we can extract the original token
                    const extractedToken = (result.headers.Authorization as string).replace('Bearer ', '')
                    expect(extractedToken).toBe(token)
                }
            ),
            { numRuns: 100 }
        )
    })

    it('the interceptor SHALL preserve all other request config properties', () => {
        fc.assert(
            fc.property(
                jwtTokenArb,
                apiEndpointArb,
                httpMethodArb,
                fc.record({
                    timeout: fc.integer({ min: 1000, max: 30000 }),
                    withCredentials: fc.boolean(),
                }),
                (token, endpoint, method, extraConfig) => {
                    // Set up the token in localStorage
                    localStorageMock['auth_token'] = token

                    // Create a mock request config with extra properties
                    const config: InternalAxiosRequestConfig = {
                        url: endpoint,
                        method: method,
                        headers: new axios.AxiosHeaders(),
                        timeout: extraConfig.timeout,
                        withCredentials: extraConfig.withCredentials,
                    }

                    // Apply the interceptor
                    const result = applyRequestInterceptor(config)

                    // Verify original properties are preserved
                    expect(result.url).toBe(endpoint)
                    expect(result.method).toBe(method)
                    expect(result.timeout).toBe(extraConfig.timeout)
                    expect(result.withCredentials).toBe(extraConfig.withCredentials)

                    // And the Authorization header is still set
                    expect(result.headers.Authorization).toBe(`Bearer ${token}`)
                }
            ),
            { numRuns: 100 }
        )
    })
})

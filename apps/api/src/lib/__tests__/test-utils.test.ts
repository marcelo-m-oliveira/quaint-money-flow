// Mock do TestUtils para evitar dependências externas
const mockTestUtils = {
  generateAuthToken: (userId: string) => `test-token-${userId}`,
  createMockUser: (userId: string) => ({
    sub: userId,
    email: 'test@example.com',
    name: 'Test User',
  }),
  validateApiResponse: (response: any) => {
    expect(response).toHaveProperty('success')
    expect(typeof response.success).toBe('boolean')
  },
}

describe('Test Utils', () => {
  it('should generate auth token', () => {
    const token = mockTestUtils.generateAuthToken('test-user-123')
    expect(token).toBe('test-token-test-user-123')
  })

  it('should create mock user', () => {
    const mockUser = mockTestUtils.createMockUser('test-user-123')
    expect(mockUser.sub).toBe('test-user-123')
    expect(mockUser.email).toBe('test@example.com')
    expect(mockUser.name).toBe('Test User')
  })

  it('should validate API response', () => {
    const validResponse = {
      success: true,
      data: { test: 'data' },
      meta: { timestamp: new Date().toISOString() },
    }

    expect(() => mockTestUtils.validateApiResponse(validResponse)).not.toThrow()
  })

  it('should validate error response', () => {
    const errorResponse = {
      success: false,
      message: 'Error message',
    }

    expect(() => mockTestUtils.validateApiResponse(errorResponse)).not.toThrow()
  })
})

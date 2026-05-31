export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Internet Security Lab 4 API',
    version: '1.0.0'
  },
  servers: [{ url: '/api' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        responses: {
          '200': { description: 'OK' }
        }
      }
    },
    '/auth/login': {
      post: {
        summary: 'Login',
        responses: {
          '200': { description: 'Authenticated' },
          '401': { description: 'Unauthorized' }
        }
      }
    },
    '/auth/claim-admin': {
      post: {
        summary: 'Claim first admin account',
        responses: {
          '201': { description: 'Admin created' },
          '403': { description: 'Invalid claim key' },
          '404': { description: 'Disabled after first admin exists' }
        }
      }
    },
    '/users': {
      get: {
        summary: 'List users',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'OK' }
        }
      }
    }
  }
};

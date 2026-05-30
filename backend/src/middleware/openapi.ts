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
    '/auth/login': {
      post: {
        summary: 'Login',
        responses: {
          '200': { description: 'Authenticated' },
          '401': { description: 'Unauthorized' }
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

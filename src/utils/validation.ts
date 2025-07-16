export const userValidation = {
  name: {
    type: 'string',
    minLength: 1,
    maxLength: 100,
    pattern: '^[a-zA-Z0-9\\s]+$',
  },
  email: {
    type: 'string',
    format: 'email',
    maxLength: 255,
  },
}

export const postValidation = {
  title: {
    type: 'string',
    minLength: 1,
    maxLength: 200,
  },
  content: {
    type: 'string',
    minLength: 1,
    maxLength: 10000,
  },
  user_id: {
    type: 'integer',
    minimum: 1,
  },
}

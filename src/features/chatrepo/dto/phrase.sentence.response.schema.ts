export const FindOneResponseSchema = {
  id: { type: 'number', example: '', description: '' },
  syncKey: { type: 'string', example: '', description: '同步Key' },
  isActive: { type: 'boolean', example: '', description: '是否有效' },
  createdAt: { type: 'string', example: '', description: '' },
  updatedAt: { type: 'string', example: '', description: '' },
  phrase: { type: 'string', example: '', description: '' },
  sentence: { type: 'string', example: '', description: '' },
  voice: { type: 'string', example: '', description: '' },
  audio: { type: 'string', example: '', description: '' },
  speed: { type: 'number', example: '', description: '' },
}

export const FindAllResponseSchema = {
  id: { type: 'number', example: '', description: '' },
  syncKey: { type: 'string', example: '', description: '同步Key' },
  isActive: { type: 'boolean', example: '', description: '是否有效' },
  createdAt: { type: 'string', example: '', description: '' },
  updatedAt: { type: 'string', example: '', description: '' },
  phrase: { type: 'string', example: '', description: '' },
  sentence: { type: 'string', example: '', description: '' },
  voice: { type: 'string', example: '', description: '' },
  audio: { type: 'string', example: '', description: '' },
  speed: { type: 'number', example: '', description: '' },
}

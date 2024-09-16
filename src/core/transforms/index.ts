export type TRANSFORMER_TYPES =
  | 'dateTransformer'
  | 'dateTimeTransformer'
  | 'booleanTransformer'
  | 'numberTransformer'
  | 'stringTransformer';

const transformers = {
  dateTransformer: ({ value }) => {
    return value;
  },
  dateTimeTransformer: ({ value }) => {
    return value;
  },
  booleanTransformer: ({ value }) => {
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value;
  },
  numberTransformer: ({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }
    if (!value) {
      return value;
    }
    return +value;
  },
  stringTransformer: ({ value }) => {
    return value;
  },
};

export function getTransformer(type: TRANSFORMER_TYPES) {
  return transformers[type];
}

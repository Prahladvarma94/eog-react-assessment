import { gql } from 'apollo-boost';

export const newMeasurement = gql `
  subscription {
    newMeasurement {
      metric
      at
      value
      unit
    }
  }
`;

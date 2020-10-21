import { gql } from 'apollo-boost';

export const getMetrics = gql `
  query {
    getMetrics
  }
`;

export const getMultipleMeasurements = gql `
  query(
    $input: [MeasurementQuery]
  ){
    getMultipleMeasurements(input: $input) {
      metric
      measurements {
        metric
        at
        value
        unit
      }
    }
  }
`;

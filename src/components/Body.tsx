import * as React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import { useQuery } from '@apollo/react-hooks';
import { getMetrics } from '../apollo/queries';
import MetricsSelector from './MetricsSelector';

export interface BodyProps {
  
}

const useStyles = makeStyles({
  root: {
    margin: '5% 25%',
    backgroundColor: "white",
    padding: "20px",
    minHeight: "800px",
  },
});
 
const Body: React.SFC<BodyProps> = () => {
  const classes = useStyles();

  const { data: metricsData, loading: metricsLoading, error: metricsError } = useQuery(getMetrics);
  const [metricsInitialState, setMetricsInitialState] = React.useState({});
  
  React.useEffect(() => {
    if(metricsData && metricsData.getMetrics.length > 0){
      const res = metricsData.getMetrics.reduce((o: object, key: number) => ({ ...o, [key]: false}), {})
      setMetricsInitialState(res);
    }
  }, [metricsData])
  
  if (metricsLoading || Object.keys(metricsInitialState).length === 0 ) return <p>Loading...</p>;
  if (metricsError) return <p>Error :(</p>;

  return (
  <div className={classes.root}>
    <Typography variant="h5">
      Real time dashboard by Eder Ramírez
    </Typography>
    <MetricsSelector metrics={metricsData.getMetrics} metricsInitialState={metricsInitialState}/>
  </div>
  );
}
 
export default Body;
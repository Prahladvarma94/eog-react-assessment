import * as React from 'react';
import { FormControl, FormLabel, FormGroup, FormControlLabel, Checkbox } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import Chart from './Chart';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  formControl: {
    margin: "20px",
  },
}));

export interface MetricsSelectorProps {
  metrics: Array<string>,
  metricsInitialState: object
}
 
const MetricsSelector: React.SFC<MetricsSelectorProps> = (props: MetricsSelectorProps) => {
  const classes = useStyles();
  const [state, setState] = React.useState(props.metricsInitialState);


  const handleChange = (name: string) => (event: any) => {
    setState({ ...state, [name]: event.target.checked});
  };

  return (
    <form>
      <FormControl component="fieldset" className={classes.formControl}>
        <FormLabel component="legend">Select metrics</FormLabel>
        <FormGroup>
          {
            props.metrics.map((metric, index) => (
              <FormControlLabel
                key={metric}
                control={<Checkbox checked={state[metric as keyof typeof state]} onChange={handleChange(metric)} value={metric} />}
                label={metric}
              />
            ))
          }
        </FormGroup>

      </FormControl>
      <Chart metricsSelected={state}/>
    </form>
  );
}
 
export default MetricsSelector;
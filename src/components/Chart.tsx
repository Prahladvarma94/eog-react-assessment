import * as React from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Legend, Tooltip } from 'recharts';
import { getMultipleMeasurements } from '../apollo/queries';
import { newMeasurement } from '../apollo/subscription';
import { useQuery, useSubscription } from '@apollo/react-hooks';
import moment from 'moment';
import { Card, CardContent, Typography, Grid } from '@material-ui/core';

export interface ChartProps {
  metricsSelected: object
}

const Chart: React.SFC<ChartProps> = (props: ChartProps) => {
  const [ selectedMetrics, setSelectedMetrics ] = React.useState<Array<string>>([])
  const [ inputArray, setInputArray ] = React.useState<Array<string>>([])
  const [ chartData, setChartData ] = React.useState<Array<any>>([])
  const before = moment().unix();
  const after = moment().subtract(30, 'minutes').unix();


  React.useEffect(() => {
    let selectedValues:Array<string> = [];
    Object.keys(props.metricsSelected).map(k=> {
      if(props.metricsSelected[k as keyof typeof props.metricsSelected]===true) {
        selectedValues.push(k);
      }
      return null;
    });

    setSelectedMetrics(selectedValues);
   
  }, [props.metricsSelected, props])

  React.useEffect(() => {
    const inputArray:Array<any> = [];
    
    selectedMetrics.map(metric => {
      inputArray.push({
        metricName: metric,
        after,
        before
      })
      return null;
    })
    setInputArray(inputArray);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMetrics])
  


  const { 
    data: measurementData, 
    loading: measurementLoading, 
    error: measurementError 
  } = useQuery(getMultipleMeasurements, {
    variables: {
      input: inputArray
    }
  });

  const { data: newData } = useSubscription(newMeasurement)

  if(newData) {
    const currentTime = localStorage.getItem("currentTimestamp");
    localStorage.setItem("currentTimestamp", newData.newMeasurement.at)
    let currentData = newData.newMeasurement;

    if(currentData.at.toString() === currentTime) {
      
      let newElement = localStorage.getItem("newElement")

      if(newElement) {
        newElement = JSON.parse(newElement)
        
        let newVal = {
          // @ts-ignore
            ...newElement,
            ...currentData,
          };
        
        newVal.at = moment(currentData.at).format('MMMM Do YYYY, h:mm:ss a');
        newVal.yaxis = newVal.at.slice(-11);
        newVal[currentData.metric] = currentData.value;
          
        localStorage.setItem("newElement", JSON.stringify(newVal));
      } else {
        let newVal = currentData;

        newVal.at = moment(currentData.at).format('MMMM Do YYYY, h:mm:ss a');
        newVal.yaxis = newVal.at.slice(-11);
        newVal[currentData.metric] = currentData.value;

        localStorage.setItem("newElement", JSON.stringify(newVal));
      }

    } else {

      let newElement = localStorage.getItem("newElement")

      
      if(newElement && chartData.length > 0 ) {
        newElement = JSON.parse(newElement)


        let finalElement = [
          ...chartData,
          newElement
        ];
        finalElement.shift();

        localStorage.removeItem("newElement");
  
        let newVal = {
          // @ts-ignore
          ...newElement,
          ...currentData,
        };

        newVal.at = moment(currentData.at).format('MMMM Do YYYY, h:mm:ss a');
        newVal.yaxis = newVal.at.slice(-11);
        newVal[currentData.metric] = currentData.value;

        localStorage.setItem("newElement", JSON.stringify(newVal));
        setChartData(finalElement);
      }

    }
  }

  React.useEffect(() => {
    let data:Array<any> = []
    if(measurementData && measurementData.getMultipleMeasurements.length > 0) {
      measurementData.getMultipleMeasurements.map((el: any, index: number) => {

        el.measurements.map((el2: any, index2:number) => { 
          el2.at = moment(el2.at).format('MMMM Do YYYY, h:mm:ss a')
          el2.yaxis = el2.at.slice(-11)
          el2[el2.metric]= el2.value
          
          if (index > 0) {
            data[index2] = { 
              ...data[index2],
              ...el2
            }
          } else {
            data.push(el2)
          }
          return null
        });
        return null;
      })
      setChartData(data);

    }


  }, [measurementData])

  if (measurementLoading) return <p>Loading...</p>;
  if (measurementError) return <p>Error :(</p>;

  const colors:Array<string> = ["#8884d8", "#82ca9d", "#133972", "#bf3555", "#e8df35", "#5eef2d"]
  


  return (
    <div>
      <Grid container>
      {
        newData  &&
        selectedMetrics.map(metric => {
          let newElement = localStorage.getItem("newElement")
          if(newElement){
            newElement = JSON.parse(newElement)
            let keysElement = newElement && Object.keys(newElement);

            return (
              (keysElement && keysElement.includes(metric)) && newElement && 
              <Grid key={metric} item xs={12} md={4}>
                <Card  style={{  margin: "10px" }}>
                  <CardContent>
                    <Typography variant="h5">
                      { metric}
                    </Typography>
                    <Typography variant="body1">
                      { newElement[ metric as keyof typeof newElement] } 
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )
          }
          return null;
        })
      }
      </Grid> 
      <LineChart width={900} height={800} data={chartData} margin={{ top: 50, right: 20, bottom: 5, left: 0 }}>
        {
          selectedMetrics.map((metric, index) => (
            <Line key={metric} type="monotone" dataKey={metric} stroke={colors[index]} />
          ))
        }

        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
        <XAxis dataKey="yaxis" />
        <YAxis />
        <Legend/>
        <Tooltip/>
      </LineChart>
    </div>
  );
}
 
export default Chart;
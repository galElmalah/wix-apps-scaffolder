import React from 'react';
import { makeStyles } from '../../../../../../wix-oauth-app-stores-example/wix-oauth-app-stores/client/src/pages/Start/node_modules/@material-ui/styles';
import { Grid } from '@material-ui/core';
import { TotalContacts, MainCard, ListData } from './components';
import { useState, useEffect } from 'react';
import queryString from '../../../../../../wix-oauth-app-stores-example/wix-oauth-app-stores/client/src/pages/Start/node_modules/query-string';
import Lottie from 'react-lottie'
import animationData from '../../util/714-water-loader.json'
import axios from 'axios';
import FolderIcon from '@material-ui/icons/Folder';
import AddToQueueIcon from '@material-ui/icons/AddToQueue';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';


const instance = axios.create();

// Override timeout default for the library
// Now all requests using this instance will wait 10 seconds before timing out
instance.defaults.timeout = 10000;







const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(4)
  }
}));
const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice'
  }
};

const useAPI = (url) => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({});


  useEffect(() => {
    instance.get(
      url,
    ).then(result => {
      setData(result.data)
      setIsLoading(false)
    }, (error) => {
      setError(error);
      setIsLoading(false);
    })
  }, [])
  return { data, isLoading, error }
}

const convertArrayToObject = (array, keyName) => {
  const initialValue = {};
  array.map((element, index) => {
    initialValue[`${keyName} ${index + 1}`] = element
  })
  return initialValue;
};


const Dashboard = (props) => {
  //console.log(props);
  let url = props.location.search;
  let params = queryString.parse(url);
  const classes = useStyles();
  const { data, error, isLoading } = useAPI(`http://localhost:8080/api/dashboard?instance=${params.instance}`);
  //console.log("data:"+JSON.stringify(data));


  if (isLoading) {
    return (
      <Lottie options={defaultOptions}
        height={300}
        width={300}
      />
    )
  } else if (error) {
    return (<div>{JSON.stringify(error)}</div>);

  } else {
    const siteData = { 'Permissions Role': data.dataJson.permissions, 'InstanceId': data.dataJson.instanceId, "Locale": data.siteInfo.site.locale };

    const installedWixApps = convertArrayToObject(data.siteInfo.site.installedWixApps, "App");

    const billing = data.siteInfo.instance.isFree ? { "Plan": "Free" } : data.siteInfo.instance.billing


    return (

      <div className={classes.root}>
        <Grid
          container
          spacing={4}
        >
          <Grid
            item
            lg={4}
            sm={6}
            xl={4}
            xs={12}
          >
            <TotalContacts by="Wix" number={data.wixContacts} image="/static/images/wix-logo-96.png" />
          </Grid>
          <Grid
            item
            lg={4}
            sm={6}
            xl={4}
            xs={12}
          >
            <MainCard siteName={data.siteInfo.site.siteDisplayName} appVersion={data.siteInfo.instance.appVersion} />
          </Grid>
          <Grid
            item
            lg={4}
            sm={6}
            xl={4}
            xs={12}
          >
          </Grid>
          <ListData title="Site" data={siteData} icon={<FolderIcon />} />
          <ListData title="Installed Wix Apps" data={installedWixApps} icon={<AddToQueueIcon />} />
          <ListData title="Billing" data={billing} icon={<MonetizationOnIcon />} />
        </Grid>
      </div>
    );
  }
};

export default Dashboard;
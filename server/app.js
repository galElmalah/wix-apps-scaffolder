const express = require('express');
const app = express();
const crypto = require("crypto");
//const path = require('path');
//app.use(express.static(path.join(__dirname, 'client/build')));
const cors = require('cors');
app.use(cors());

const port = process.env.PORT || 8080;
const requestManager = require('./requestManager');
const webhooks = require('./API/webhooks');

const MongoDb = require('./DB/mongodb');
const WixApi = require('./API/wixApi');
const MailChimpApi = require('./API/mailChimpApi');

const mongoDB = new MongoDb();
const wixApi = new WixApi();
const mailChimpApi = new MailChimpApi();

const {
  WIX_REDIRECT_URL,
  MAIL_CHIMP_REDIRECT_URL,
  MAIL_CHIMP_CLIENT_ID,
  APP_ID,
  MAIL_CHIMP_SECERT,
  SECRET
} = process.env;


const { getTokensFromWix, getAccessTokenFromMailChimp} = requestManager;

const {contactCreated, contactDeleted} = webhooks;



//this route is the app-url you add to your App in wix dev center
app.get('/api/app-wix',(req, res)=> {
  res.redirect(`https://www.wix.com/app-oauth-installation/consent?token=${req.query.token}&state=start&appId=${APP_ID}&redirectUrl=${WIX_REDIRECT_URL}`);
})


//Wix will redirect here after user consent the app
app.get('/api/redirect-wix',async (req, res)=> {
  //wix instance Id of the app installation on site.
  const instanceId = req.query.instanceId;
  console.log("redirect-wix", instanceId);
  const { refresh_token } = await getTokensFromWix(
    req.query.code
  );
  
  await mongoDB.saveWixToken(instanceId, refresh_token);
  const redirectUrl = encodeURIComponent(`${MAIL_CHIMP_REDIRECT_URL}?instanceId=${instanceId}`);
  res.redirect(`https://login.mailchimp.com/oauth2/authorize?response_type=code&client_id=${MAIL_CHIMP_CLIENT_ID}&redirect_uri=${redirectUrl}`);
})


//MailChimp will redirect to here
app.get('/api/redirect-mc',async (req, res)=> {
  const { access_token } = await getAccessTokenFromMailChimp(
    `${MAIL_CHIMP_CLIENT_ID}`,
    `${MAIL_CHIMP_SECERT}`,
    req.query.code,
    req.query.instanceId
  );
  await mongoDB.saveMailChimpToken(req.query.instanceId, access_token);
  await wixApi.syncContacts(req.query.instanceId);
  res.redirect('https://www.wix.com/app-oauth-installation/token-received');
})

app.get('/api/test', async (req, res) =>{
  res.json({status:"ok"});
})

app.post('/api/contact-created', async (req, res)=> {
  try{
    await contactCreated(req.body);
  } catch(err) {
    console.error('contact-created', err);
    res.status(500).send({ error: 'Something failed!' });
  }
  res.json('ended successfully');
})

app.post('/api/contact-deleted', async (req, res)=> {
  try{
    await contactDeleted(req.body);
  } catch(err) {
    console.error('contact-delete', err);
    res.status(500).send({ error: 'Something failed!' });
  }
  res.json('ended successfully');
})

// app.post('/api/order-created', async (req, res)=> {
//   console.log('status',req.body);
// })


function verifyInstance(instance, secret) {
  const pair = instance.split('.');
  const signature = decode(pair[0], 'binary');
  const data = pair[1];
  // sign the data using hmac-sha1-256
  const hmac = crypto.createHmac('sha256', secret);
  const newSignature = hmac.update(data).digest('binary');
  
  return (signature === newSignature);
}

function decode(data, encoding) {
  encoding = encoding === undefined ? 'utf8' : encoding
  var buf = Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
  return encoding ? buf.toString(encoding) : buf;
}

app.get('/api/dashboard',async(req, res)=>{
  const instance = req.query.instance;
  if(verifyInstance(instance, `${SECRET}`)){
    const pair = instance.split('.');
    const data = pair[1];
    const dataJson = JSON.parse(decode(data, 'binary'));
    const { mailChimpToken, wixRefreshToken } = await mongoDB.getApiTokenByInstanceId(dataJson.instanceId);
    const wixContacts = await wixApi.getTotalContact(wixRefreshToken);
    const siteInfo = await wixApi.getSiteInfo(wixRefreshToken);
    const mailChimpContacts = await mailChimpApi.getTotalContact(siteInfo.site.siteDisplayName, mailChimpToken);
    res.json({dataJson, siteInfo, wixContacts, mailChimpContacts});
  } else{
    res.json("error verifyInstance");
  }
})



app.get('/api/status',async(req, res)=>{
  const instance = req.query.instance;
  if(verifyInstance(instance, `${SECRET}`)){
        const pair = instance.split('.');
        const data = pair[1];
        const dataJson = JSON.parse(decode(data, 'binary'))
        const { mailChimpToken } = await mongoDB.getApiTokenByInstanceId(dataJson.instanceId);
        if(mailChimpToken){
          const apps = await mailChimpApi.getAuthorizedApp(mailChimpToken, mailChimpClientId)
          if(apps && apps.id == mailChimpClientId){
            res.json({status:"connected"});
          }else{
            res.json({status:"not-connected"});
          }
        }else{
          res.json({status:"not-connected"});
        }
  }else{
    res.json({status:"not-connected"});
  }
})

app.listen(port, function () {
  console.log(`Example app listening on ${port}!`)
})
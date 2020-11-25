const axios = require('axios');

const oauthPath = `https://www.wix.com/oauth/access`;

//const config = require('./config');

//const { wixmc: { appId, secret},  app: {  mailChimpRedireectUrl} } = config;

const {
  MAIL_CHIMP_REDIRECT_URL,
  APP_ID,
  SECRET
} = process.env;

exports.getTokensFromWix = async (code) =>
  axios
    .post(oauthPath, {
        code: code,
        client_secret: `${SECRET}`,
        client_id: `${APP_ID}`,
        grant_type: 'authorization_code',
    })
    .then(res => res.data).catch((error) => {console.error(error)});

exports.getAccessTokenFromWix = async (refreshToken) =>
  axios
    .post(oauthPath, {
      refresh_token: refreshToken,
      client_secret: `${SECRET}`,
      client_id: `${APP_ID}`,
      grant_type: 'refresh_token',
    })
    .then(resp => resp.data)
    .catch((error) => {console.error(error)});;


exports.getAccessTokenFromMailChimp = async (client_id, client_secret, code, instanceId) =>{
    const redirectUrl = encodeURIComponent(`${MAIL_CHIMP_REDIRECT_URL}?instanceId=${instanceId}`);
    const data = `grant_type=authorization_code&client_id=${client_id}&client_secret=${client_secret}&redirect_uri=${redirectUrl}&code=${code}`;
    return axios
      .post('https://login.mailchimp.com/oauth2/token', data ,{headers: {'Content-Type': 'application/x-www-form-urlencoded'}})
      .then(resp => resp.data).catch((error) => { console.error('this is the error from get token of mailchimp',error) });
    };
      
exports.callMailChimpForMetadata =  async (token) =>
        axios.get('https://login.mailchimp.com/oauth2/metadata', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        .then(r => r.data)
        .catch((error) => {console.error(error)});
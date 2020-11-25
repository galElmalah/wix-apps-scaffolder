
const axios = require('axios');
const MongoDb = require('../DB/mongodb');
const MailChimpApi = require('./mailChimpApi');
const mailChimpApi = new MailChimpApi();
const mongoDb = new MongoDb();



const requestManager = require('../requestManager');
const { getAccessTokenFromWix } = requestManager;

class WixApi {
    constructor(){}

    async getContacts(limit, offset, refreshToken){
        const {access_token} = await getAccessTokenFromWix(refreshToken);
        
        const url = `https://www.wixapis.com/crm/v1/contacts?paging.limit=${limit}&paging.offset=${offset}`;

        return axios.get(url, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${access_token}`
          }
        })
        .then(r => r.data)
        .catch((error) => {console.error('getContacts function from wix error',error)});
    }

    async getContact(id, refreshToken) {
        const {access_token} = await getAccessTokenFromWix(refreshToken);
        const url = `https://www.wixapis.com/crm/v1/contacts/${id}`;

        return axios.get(url, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `${access_token}`
            }
          })
          .then(r => r.data)
          .catch((error) => {console.error('getContacts function from wix error',error)});
    }

    async getTotalContact(refreshToken){
        const {access_token} = await getAccessTokenFromWix(refreshToken);
        
        const url = `https://www.wixapis.com/crm/v1/contacts`;

        return axios.get(url, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${access_token}`
          }
        })
        .then(r => r.data.metadata.items)
        .catch((error) => {console.error('getContacts function from wix error',error)});
    }

    async getSiteInfo(refreshToken){
        const {access_token} = await getAccessTokenFromWix(refreshToken)
        return axios.get('https://www.wixapis.com/apps/v1/instance',{
            headers: {
                'Authorization': `${access_token}`
            }
        })
        .then(resp => resp.data)
        .catch((error) => { console.error('getSiteInfo from wix error',error) });
    }

    async syncContacts(instanceId){
        let limit = 100;
        let offset = 0;
        const { mailChimpToken, wixRefreshToken } = await mongoDb.getApiTokenByInstanceId(instanceId);

        let {contacts, metadata} = await this.getContacts(limit, offset, wixRefreshToken);
        let emailList = [];
        contacts.forEach(contact => {
            if (contact.emails.length > 0){
                emailList.push({email : contact.emails[0].email});
            }
        });
        let hasMore = metadata.hasMore;
        while(hasMore){
            offset = (offset+1)*limit;
            let {contacts, metadata} = await this.getContacts(limit, offset, wixRefreshToken);
            contacts.forEach(contact => {
            if (contact.emails.length > 0){ 
                emailList.push({email : contact.emails[0].email})
            }
            })
            hasMore = metadata.hasMore;
        }
        const sitename = await this.getSiteInfo(wixRefreshToken);
        console.log(sitename.site.siteDisplayName);
        return await mailChimpApi.bulkSaveContacts(emailList, mailChimpToken, sitename.site.siteDisplayName);
    }
}

module.exports = WixApi
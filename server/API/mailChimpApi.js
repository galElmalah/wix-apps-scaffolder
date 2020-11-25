const axios = require('axios');
const requestManager = require('../requestManager');
const {callMailChimpForMetadata } = requestManager;
const crypto = require("crypto");

class MailChimpApi {
    constructor() {}

    async setContacts(contactList, access_token, siteName){
        const {api_endpoint} = await callMailChimpForMetadata(access_token);
        const {lists} = await axios.get(`${api_endpoint}/3.0/lists`, {auth: {username: 'user', password: access_token}}).then(res => res.data)
        .catch((error) => {console.error(`MailChimpApi get list`,error)});
        if(lists && lists.length >0){
            const firstList  = lists[0];
            return Promise.all((contactList.map(async (contact) => {
                const member = {
                    "list_id": `${firstList.id}`,
                    "email_address": `${contact.email}`,
                    "status": 'subscribed',
                    "tags": [`${siteName} wix contact`]
                }
                let contactExist = await this.isContactExist(firstList.id, contact.email , access_token)
                if(!contactExist){
                    return axios.post(`${api_endpoint}/3.0/lists/${firstList.id}/members`,member , {auth: {username: 'user', password: access_token}})
                    .catch((error) => {console.error(`MailChimpApi create member with ${member.email_address}`,error)});
                }
            })))
        }
    }

    async isContactExist(listId, email, access_token) {
        const {api_endpoint} = await callMailChimpForMetadata(access_token);
        const emailHash = crypto.createHash('md5').update(email.toLowerCase()).digest("hex");
        return axios.get(`${api_endpoint}/3.0/lists/${listId}/members/${emailHash}`, {auth: {username: 'user', password: access_token}}).then(res => {
            if(res.data.id){ 
                return true;
            }else{
                return false;
            }
        })
        .catch((error) => {return false;});
    }

    async bulkSaveContacts(contactList, access_token, siteName){
        const {api_endpoint} = await callMailChimpForMetadata(access_token);
        const {lists} = await axios.get(`${api_endpoint}/3.0/lists`, {auth: {username: 'user', password: access_token}}).then(res => res.data)
        .catch((error) => {console.error(`MailChimpApi get list`,error)});
        if(lists && lists.length > 0){
            const firstList  = lists[0];
            let operations =[];
            contactList.map((contact) => {
                const member = {
                    "list_id": `${firstList.id}`,
                    "email_address": `${contact.email}`,
                    "status": "subscribed",
                    "tags": [`${siteName} wix contact`]
                };
                const operation = {
                    "method": "POST", 
                    "path": `lists/${firstList.id}/members`,
                    "operation_id": siteName,
                    "body": JSON.stringify(member)
                };
                operations.push(operation);
            })
            return axios.post(`${api_endpoint}/3.0/batches`,{operations} , {auth: {username: 'user', password: access_token}})
            .then(r => r.data)
            .catch((error) => {console.error(`MailChimpApi bulk error`,error)});
        }
    }

    async getTotalContact(siteName, access_token) {
        const {api_endpoint} = await callMailChimpForMetadata(access_token);
        const {lists} = await axios.get(`${api_endpoint}/3.0/lists`, {auth: {username: 'user', password: access_token}}).then(res => res.data)
        .catch((error) => {console.error(`MailChimpApi get list`,error)});
        if(lists && lists.length > 0){
            const firstList  = lists[0];
            return axios.get(`${api_endpoint}/3.0/lists/${firstList.id}/segments`, {auth: {username: 'user', password: access_token}}).then(
                res => {
                    const segments=  res.data.segments
                    const segment = segments.find(segment => segment.name === `${siteName} wix contact`);
                    if(segment){
                        return axios.get(`${api_endpoint}/3.0/lists/${firstList.id}/segments/${segment.id}`, {auth: {username: 'user', password: access_token}})
                        .then(res =>res.data.member_count)
                        .catch((error) => {console.error(`MailChimpApi get list`,error)});
                    }else{
                        return 0;
                    }
                })
        }
    }

    async deleteContact(email, access_token){
        const {api_endpoint} = await callMailChimpForMetadata(access_token);
        const emailHash = crypto.createHash('md5').update(email.toLowerCase()).digest("hex");
        const {lists} = await axios.get(`${api_endpoint}/3.0/lists`, {auth: {username: 'user', password: access_token}}).then(res => res.data)
        .catch((error) => {console.error(`MailChimpApi get list`,error)});
        if(lists && lists.length >0){
            const firstList  = lists[0];
            axios.delete(`${api_endpoint}/3.0/lists/${firstList.id}/members/${emailHash}`, {auth: {username: 'user', password: access_token}}).then(res => res.data)
            .catch((error) => {console.error(`MailChimpApi DeleteContact`,error)});
        }
    }

    //for now does not work, maybe releated my free/paid account.
    async createList(listName, access_token){
        const {api_endpoint} = await callMailChimpForMetadata(access_token);
        const {lists} = await axios.get(`${api_endpoint}/3.0/lists`, {auth: {username: 'user', password: access_token}}).then(r => r.data);
        let data = {};
        if(lists && lists.length >0){
            const firstList  = lists[0];
            data = {
                name:listName,
                permission_reminder : firstList.permission_reminder,
                contact: firstList.contact,
                campaign_defaults: firstList.campaign_defaults,
                email_type_option: firstList.email_type_option
            };
            await axios.post(`${api_endpoint}/3.0/lists`, data, {auth: {username: 'user', password: access_token}})
            .catch((error) => {console.error(`MailChimpApi createList with ${listName}`,error)});
        }
    }

    async getAuthorizedApp(access_token, appId) {
        const {api_endpoint} = await callMailChimpForMetadata(access_token);
        return await axios.get(`${api_endpoint}/3.0/authorized-apps/${appId}`, {auth: {username: 'user', password: access_token}}).then(r => r.data);
    }
}

module.exports = MailChimpApi
import express from 'express'
import axios from 'axios'

const app = express();
const port = 3000;

const api = axios.create({
  baseURL: 'https://hello123456gmailcom.amocrm.ru'
})

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

app.get('/update_contacts', async (req, res) => {
  const limit = 25
  let page = 1

  const headers = {
    'Authorization': `Bearer ${req.query.key}`,
    'Content-Type': 'application/json'
  };

  const contactsToUpdate = []

  let response = true
  while (response) {
    try {
      const result = await api('api/v4/contacts', {
        method: 'get',
        params: {
          with: 'leads',
          limit: limit,
          page: page
        },
        headers: headers
      })
      response = result.data
      if (response?._embedded?.contacts.length > 0) {
        for (let contact of response._embedded.contacts) {
          if (contact._embedded.leads.length === 0) {
            contactsToUpdate.push(contact.id)
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
    }
    page++
  }

  for (let contactId of contactsToUpdate) {
    await api('api/v4/tasks', {
      method: 'post',
      data: [{
        task_type_id: 1,
        text: "Контакт без сделок",
        complete_till: 1748185565,
        entity_id: contactId,
        entity_type: "contacts",
        request_id: "example"
      }],
      headers: headers
    })
  }

  res.json('success');
})

app.listen(port, () => {
  console.log(`Proxy server is running on port ${port}`);
});

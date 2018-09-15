'use strict';
import Notify from './notify-service.js';

let formEl, emailEl, passwordEl, contentEl, usernameEl;

let authToken = '';
const appToken = 'R0cDtib8jxQmdZ2J87kqR7qYP3XCRkh6XZ7MM3V219Y';

const api = 'https://api.hubstaff.com/v1';
const rest = {
  post: {
    auth: `${api}/auth`,
  },
  get: {
    customByDateMy: `${api}/custom/by_date/my`,
    users: `${api}/users`
  }
};

let notify;

document.addEventListener('DOMContentLoaded', init);

function init() {
  console.log('init()');
  notify = new Notify();

  displayLoginForm(false);
  displayContent(false);
  
  formEl = document.querySelector('#form');
  emailEl = document.querySelector('#email-inp');
  passwordEl = document.querySelector('#pass-inp');
  contentEl = document.querySelector('#content');
  usernameEl = document.querySelector('#username');

  document.querySelector('#submit-btn').addEventListener('click', submitLoginForm);

  checkToken();
}

function handle401Error(res) {
  return new Promise((resolve, reject) => {
    if (res.status !== 200) {
      displayLoginForm(true);
      reject(res.statusText);
    } else if (!res.error) resolve();
  });
}

function sendAuthRequest(email, pass) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', pass);

    fetch(rest.post.auth, {
      method: 'POST',
      headers: {
        'App-Token': appToken
      },
      body: formData
    }).then(res => {
      handle401Error(res).then(ok => {
        console.log('res:', res);
        res.json().then(res => {
          if (res.user && res.user.auth_token) {
            authToken = res.user.auth_token;
            chrome.storage.local.set({
              auth_token: authToken,
              email: email,
              password: pass
            });
            getUser(res.user.id);
            resolve('ok');
          } else reject('Server returned no user or auth_token');
        }).catch(err => reject(err));
      }).catch(err => reject(err));
    }).catch(err => reject(err));
  })
}

function displayLoginForm(status) {
  if (formEl) {
    formEl.style =  status ? 'display: block' : 'display: none';
    displayContent(!status);
  }
}

function displayContent(status) {
  if (contentEl)
    contentEl.style =  status ? 'display: block' : 'display: none';
}

// FIXME: fix function so it's not sending first time request
function checkToken() {
  console.log('checking auth token...');
  chrome.storage.local.get(['auth_token', 'email', 'password'], (res) => {
    console.log('local.get:', res);
    if (res.auth_token) {
      authToken = res.auth_token;
      if (res.email && res.password) {
        sendAuthRequest(res.email, res.password).then(ok => {
          document.body.classList.remove('splash');
          notify.success('Signed in successfully');
          displayLoginForm(false);
        }).catch(err => {
          document.body.classList.remove('splash');
          console.error(err);
          notify.error(err);
          displayLoginForm(true);
        });
      }
    } else {
      document.body.classList.remove('splash');
      displayLoginForm(true);
    }
  });
}

function submitLoginForm() {
  let email = emailEl.value.trim();
  let pass = passwordEl.value.trim();

  sendAuthRequest(email, pass).then(ok => {
    notify.success('Signed in successfully');
  }).catch(err => {
    console.error(err);
    notify.error(err);
  });
}

function getUser(userId) {
  console.log('getUser:', userId);
  fetch(
    `${res.get.users}/${userId}`, {
      method: 'GET',
      headers: {
        'Auth-Token': authToken,
        'App-Token': appToken
      }
    }
  ).then(res => {
    console.log('get user res:', res);
    res.json().then(res => {
      // console.log('get user res:', res);
      usernameEl.innerText = res.user.name;
    }).catch(err => {
      console.error(err);
      notify.error(err);
    });
  }).catch(err => {
    console.error(err);
    notify.error(err);
  });
}

function getTodaysHours() {
  const params = {
    startDate: `start_date='2018-09-14'`,
    endDate: `end_date='2018-09-14'`
  }
  fetch(`${rest.get.customByDateMy}?${params.startDate}&${params.endDate}`, {
    method: 'GET',
    headers: {
      'Auth-Token': authToken,
      'App-Token': appToken
    }
  }).then(res => {
    handle401Error(res).then(ok => {
      res.json().then(res => {
        console.log(res);
        alert(`Today logged: ${(res.organizations[0].duration*0.00027777777777778).toFixed(2)}h`);
      }).catch(err => {
        console.error(err);
        notify.error(err);
      });
    }).catch(err => {
      console.error(err);
      notify.error(err);
    });
  }).catch(err => {
    console.error(err);
    notify.error(err);
  });
}
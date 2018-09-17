'use strict';
import Notify from './notify-service.js';

let formEl, emailEl, passwordEl, contentEl, usernameEl, timeMonthEl;

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
  timeMonthEl = document.querySelector('#time-month');

  document.querySelector('#submit-btn').addEventListener('click', submitLoginForm);
  getUserData();
}

function handleServerError(err) {
  return new Promise((resolve, reject) => {
    console.warn('err:', err);
    if (err.status !== 200) {
      displayLoginForm(true);
      reject(err.statusText);
    } else if (!err.error) resolve();
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
      handleServerError(res).then(ok => {
        console.log('res:', res);
        res.json().then(res => {
          if (res.user && res.user.auth_token) {
            authToken = res.user.auth_token;
            chrome.storage.local.set({
              auth_token: authToken,
              user_id: res.user.id
            });
            getUser(res.user.id);
            resolve();
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

function getUserData() {
  displayLoginForm(false);
  console.log('checking auth token...');
  chrome.storage.local.get(['auth_token', 'user_id'], res => {
    console.log('local.get:', res);
    document.body.classList.remove('splash');
    if (res.auth_token) {
      authToken = res.auth_token;
    }
    if (res.user_id) {
      getUser(res.user_id);
    }
    if (!res || !res.auth_token) {
      displayLoginForm(true);
    }
  });
}

function submitLoginForm() {
  let email = emailEl.value.trim();
  let pass = passwordEl.value.trim();

  sendAuthRequest(email, pass).then(() => {
    notify.success('Signed in successfully');
    displayLoginForm(false);
  }).catch(err => {
    displayLoginForm(true);
    console.error(err);
    notify.error(err);
  });
}

function getUser(userId) {
  console.log('getUser:', userId);
  fetch(
    `${rest.get.users}/${userId}`, {
      method: 'GET',
      headers: {
        'Auth-Token': authToken,
        'App-Token': appToken
      }
    }
  ).then(res => {
    handleServerError(res).then(() => {
      res.json().then(res => {
        usernameEl.innerText = res.user.name;
        getCurrentMonthsHours();
      }).catch(err => {
        console.error(err);
        notify.error(err);
      });
    }).catch(err => {
      console.error(err);
      notify.error(err);
    });
  }).catch(err => {
    displayLoginForm(true);
    console.error(err);
    notify.error(err);
  });
}

function getCurrentMonthsHours() {
  const currDate = new Date().getDate();
  const currMonth = new Date().getMonth() + 1;
  const currYear = new Date().getFullYear();
  const payday = 20;
  let year = currYear;
  let month = currMonth;

  if (currDate < payday) {
    month = currMonth > 1 ? currMonth - 1 : 12;
    year = currMonth == 1 ? currYear - 1 : currYear;
  }
  const startDate = `${year}-${month}-${payday + 1}`;
  const endDate = `${currYear}-${currMonth}-${currDate}`;

  const params = {
    startDate: `start_date=${startDate}`,
    endDate: `end_date=${endDate}`
  }
  fetch(`${rest.get.customByDateMy}?${params.startDate}&${params.endDate}`, {
    method: 'GET',
    headers: {
      'Auth-Token': authToken,
      'App-Token': appToken
    }
  }).then(res => {
    handleServerError(res).then(ok => {
      res.json().then(res => {
        console.log(res);
        timeMonthEl.innerText = `${(res.organizations[0].duration*0.00027777777777778).toFixed(2)}h`;
      }).catch(err => {
        console.error(err);
        notify.error(err);
      });
    }).catch(err => {
      console.error(err);
      notify.error(err);
    });
  }).catch(err => {
    displayLoginForm(true);
    console.error(err);
    notify.error(err);
  });
}
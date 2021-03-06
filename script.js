'use strict';

let formEl, emailEl, passwordEl;

let authToken = '';
const appToken = 'R0cDtib8jxQmdZ2J87kqR7qYP3XCRkh6XZ7MM3V219Y';

const api = 'https://api.hubstaff.com/v1';
const rest = {
  post: {
    auth: `${api}/auth`,
  },
  get: {
    customByDateMy: `${api}/custom/by_date/my`
  }
};

window.onload = init;

function checkToken() {
  let tokenStorageVal = localStorage.getItem('auth_token');
  if (tokenStorageVal !== null) {
    authToken = tokenStorageVal;
    formEl.style = 'display: none';
  }
}

function submitLoginForm(event) {
  console.log('submit event:', event);
  const formData = new FormData();
  formData.append('email', emailEl.value.trim());
  formData.append('password', passwordEl.value.trim());

  fetch(rest.post.auth, {
    method: 'POST',
    headers: {
      'App-Token': appToken
    },
    body: formData
  }).then(res => {
    res.json().then(res => {
      authToken = res.user.auth_token;
      localStorage.setItem('auth_token', authToken);
    }).catch(err => console.error(err));
  }).catch(err => console.error(err));
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
    res.json().then(res => {
      console.log(res);
      alert(`Today logged: ${(res.organizations[0].duration*0.00027777777777778).toFixed(2)}h`);
    }).catch(err => console.error(err));
  }).catch(err => console.error(err));
}

function init() {
  formEl = document.querySelector('#form');
  emailEl = document.querySelector('#email-inp');
  passwordEl = document.querySelector('#pass-inp');
  checkToken();
}
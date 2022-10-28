const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit',async(e) => {
  e.preventDefault();
  let data = new FormData(loginForm);
  let obj = {};
  data.forEach((value, key) => obj[key] = value);
  fetch('api/sessions/login', {
    method: 'POST',
    body: JSON.stringify(obj),
    headers: {
      "Content-Type": "application/json"
    }
  }).then(result => result.json()).then(json => {
    if(json.status != "success") {
      location.href = "http://localhost:8080/loginfail";
    } 
    else {
      window.location.href = "http://localhost:8080/api";
    }
  });
});

function redirect() {
  window.location.href = "http://localhost:8080/";
};
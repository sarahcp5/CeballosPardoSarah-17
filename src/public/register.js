const formUser = document.getElementById('registerForm');

formUser.addEventListener('submit',async(e) => {
    e.preventDefault();
    let data = new FormData(formUser);
    let obj = {};
    $('#modal').modal('show');

    data.forEach((value,key) => obj[key] = value);
    fetch ('api/sessions/register', {
        method: 'POST',
        body: JSON.stringify(obj),
        headers: {
            "Content-Type":"application/json"
        }
    }).then(result => result.json()).then(json => {
        console.log(json);
        if(json.status != "success") {
            location.href = "http://localhost:8080/registerfail";
        }
        else {
          setTimeout(() => {
            $('#modal').modal('hide');
          }, 1500);
        }
    });
});

function redirect() {
    window.location.href = "http://localhost:8080/login";
};
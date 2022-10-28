function redirect(url) {
    if(url == 'LOGIN') {
        window.location.href = "http://localhost:8080/login";
    }
    else if(url == 'SIGNUP') {
        window.location.href = "http://localhost:8080/";
    }
}
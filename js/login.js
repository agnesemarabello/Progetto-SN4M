function controlla(){
    var username = document.getElementById('UserID').value;

    var utenti = JSON.parse(localStorage.getItem('users'));

    var tmp = null;

    for (var i = 0; i < utenti.length; i++){
        if (utenti[i].userID == username){
            tmp = i;
            break;
        }
    }

    if (tmp == null){
        alert("Username non registrato");
    } else{
        var passwordInput = document.getElementById('Password');
        var errorSpan = document.getElementById('password-error');
        var password = passwordInput.value;
        password = CryptoJS.MD5(password).toString();
        if (utenti[tmp].password == password) {
        sessionStorage.setItem('logged', username);
        window.location.href = 'index.html';
        } else {
            passwordInput.classList.add('is-invalid');
            if (errorSpan) {
                errorSpan.textContent = "Password errata";
                errorSpan.style.display = "block";
            }
            passwordInput.addEventListener('input', function handler() {
                passwordInput.classList.remove('is-invalid');
                if (errorSpan) errorSpan.style.display = "none";
                passwordInput.removeEventListener('input', handler);
            });
        }
    }
}
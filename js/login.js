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
    }
    else{
        var password = document.getElementById('Password').value;
        password = CryptoJS.MD5(password).toString();
        if (utenti[tmp].password == password){
            sessionStorage.setItem('logged', username);
            window.location.href = 'index.html';
        }
        else{
            alert("Password errata");
        }
    }
}
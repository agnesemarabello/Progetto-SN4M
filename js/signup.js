function getParameters() {
    var query = window.location.search;
    var parameters = new URLSearchParams(query);

    return {
        nome: parameters.get('nome'),
        cognome: parameters.get('cognome'),
        genere: parameters.get('genere'),
        userID: parameters.get('uid'),
        email: parameters.get('email'),
        cantantePreferito: parameters.get('preferenza'),
        generePreferito: parameters.get('generePreferito'),
        password: parameters.get('password')
    };
}

var params = getParameters();

if (params.nome != null) {
    document.getElementById("InputNome").value = params.nome;
    document.getElementById("InputCognome").value = params.cognome;
    document.getElementById("InputGenere").value = params.genere;
    document.getElementById("InputUID").value = params.userID;
    document.getElementById("InputEmail1").value = params.email;
    document.getElementById("InputEmail2").value = params.email;
    document.getElementById("InputPreferenza").value = params.cantantePreferito;
    document.getElementById("InputGenerePreferito").value = params.generePreferito;
    document.getElementById("InputPassword1").value = params.password;
    document.getElementById("InputPassword2").value = params.password;

    document.getElementById("InputNome").disabled = true;
    document.getElementById("InputCognome").disabled = true;
    document.getElementById("InputGenere").disabled = true;
    document.getElementById("InputUID").disabled = true;
    document.getElementById("InputEmail1").disabled = true;
    document.getElementById("InputEmail2").disabled = true;
    document.getElementById("InputPreferenza").disabled = true;
    document.getElementById("InputGenerePreferito").disabled = true;
    document.getElementById("InputPassword1").disabled = true;
    document.getElementById("InputPassword2").disabled = true;

    document.getElementById("ButtonInvia").classList.add('d-none');
    document.getElementById("ButtonConferma").classList.remove('d-none');
    mostraPrivacyCheck(false);
}

function verifica(elem) {
    var val = elem.value;

    function danger(elem) {
        elem.classList.remove('border-success');
        elem.classList.add('border-danger');
        return false;
    }
    function success(elem) {
        elem.classList.remove('border-danger');
        elem.classList.add('border-success');
        return true;
    }

    if (elem.id == "InputNome" || elem.id == "InputCognome") {
        var espressioneRegolare = /^[a-zA-Z]{3,25}$/;
        return espressioneRegolare.test(val) ? success(elem) : danger(elem);
    }
    if (elem.id == "InputEmail1") {
        var emailRegolare = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        return emailRegolare.test(val) ? success(elem) : danger(elem);
    }
    if (elem.id == "InputEmail2") {
        var email1 = document.getElementById("InputEmail1").value;
        return (email1 == val) ? success(elem) : danger(elem);
    }
    if (elem.id == "InputUID") {
        var espressioneRegolare = /^[a-z]{4,10}$/;
        return espressioneRegolare.test(val) ? success(elem) : danger(elem);
    }
    if (elem.id == "InputGenere") {
        return (val != -1) ? success(elem) : danger(elem);
    }
    if (elem.id == "InputPassword1") {
        var passwordRegolare = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        return passwordRegolare.test(val) ? success(elem) : danger(elem);
    }
    if (elem.id == "InputPassword2") {
        var password1 = document.getElementById("InputPassword1").value;
        return (password1 == val) ? success(elem) : danger(elem);
    }
    if (val == "") {
        elem.classList.remove('border-danger');
        elem.classList.remove('border-success');
    }
}

function submitTest() {
    var elem = ["InputNome", "InputCognome", "InputGenere", "InputUID", "InputEmail1", "InputPassword1", "InputPassword2", "InputEmail2"];
    var isOk = true;
    for (var i = 0; i < elem.length; i++) {
        var elemi = document.getElementById(elem[i]);
        if (verifica(elemi) == false) {
            elemi.classList.remove('border-success');
            elemi.classList.add('border-danger');
            isOk = false;
        }
    }
    // Controllo UserID univoco
    var utenti = JSON.parse(localStorage.getItem('users')) || [];
    utenti.forEach(element => {
        if (element.userID == document.getElementById("InputUID").value) {
            document.getElementById("InputUID").classList.remove('border-success');
            document.getElementById("InputUID").classList.add('border-danger');
            isOk = false;
        }
    });

    // Controllo privacy policy
    var privacyCheck = document.getElementById("invalidCheck");
    var privacyError = document.getElementById("privacy-error");
    if (!privacyCheck.checked) {
        privacyCheck.classList.add('is-invalid');
        if (privacyError) {
            privacyError.textContent = "Per procedere devi accettare la privacy policy";
            privacyError.style.display = "block";
        }
        isOk = false;
    } else {
        privacyCheck.classList.remove('is-invalid');
        if (privacyError) privacyError.style.display = "none";
    }

    if (isOk) {
        document.getElementById("form").submit();
    } else {
        document.getElementById("alert").classList.remove('d-none');
    }
}

function createUser() {
    var params = getParameters();
    const newUser = {
        userID: params.userID,
        nome: params.nome,
        cognome: params.cognome,
        genere: params.genere,
        email: params.email,
        cantantePreferito: params.cantantePreferito,
        generePreferito: params.generePreferito,
        password: CryptoJS.MD5(params.password).toString(),
        playlist: [],
    };
    const usersArray = JSON.parse(localStorage.getItem('users')) || [];
    usersArray.push(newUser);
    window.localStorage.setItem('users', JSON.stringify(usersArray));
    window.location.href = "regOk.html";
}

// --- ARTISTI SPOTIFY ---

async function fetchSpotifyArtists(query, token) {
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=10`, {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    });
    const data = await response.json();
    return data.artists.items;
}

async function populateArtistSelect() {
    const select = document.getElementById('InputPreferenza');
    select.innerHTML = '<option value="">Seleziona artista</option>';
    const token = await getSpotifyToken();
    const generi = ['pop', 'rock', 'jazz', 'hip-hop', 'classical'];
    let artisti = [];
    for (const genere of generi) {
        const artists = await fetchSpotifyArtists(genere, token);
        artisti = artisti.concat(artists);
    }
    // Rimuovi duplicati per nome
    const unique = {};
    artisti.forEach(artist => {
        if (!unique[artist.name]) {
            unique[artist.name] = true;
            const option = document.createElement('option');
            option.value = artist.name;
            option.textContent = artist.name;
            select.appendChild(option);
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    populateArtistSelect();
});
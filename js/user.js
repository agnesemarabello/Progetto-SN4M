const params = new URLSearchParams(window.location.search);
        const userID = params.get('user');
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.userID === userID);
        const container = document.getElementById('user-profile');
        const loggedUserID = sessionStorage.getItem('logged');

        const editBtn = document.getElementById('edit-profile');
        const actionsContainer = document.querySelector('.profile-actions');

        function renderProfile(user) {
    let playlistsHtml = '';
    if (user.playlist && user.playlist.length > 0) {
        playlistsHtml = `
            <div class="playlist-list">
                <h5 class="mb-3" style="color:#1ed760;">Playlist pubblicate</h5>
                ${user.playlist.map(pl => `
                    <div class="playlist-item">
                        <a href="playlist.html?name=${encodeURIComponent(pl.nome)}">${pl.nome}</a>
                        <span class="badge badge-spotify ms-2">${pl.tracks ? pl.tracks.length : 0} brani</span>
                        ${pl.descrizione ? `<div class="small mt-1 text-light">${pl.descrizione}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        playlistsHtml = `<div class="alert alert-secondary mt-4">Nessuna playlist pubblicata</div>`;
    }
    container.innerHTML = `
        <div class="text-center mb-4">
            <i class="fas fa-user-circle fa-4x mb-3" style="color:#1ed760;"></i>
            <h2 class="profile-title mb-1">${user.userID}</h2>
            <div class="mb-2 text-muted">${user.email || ''}</div>
        </div>
        <hr style="border-top:2px solid #1ed760;opacity:.5;">
        <div class="mb-3">
            <strong>Nome:</strong> ${user.nome || ''}<br>
            <strong>Cognome:</strong> ${user.cognome || ''}<br>
            <strong>Genere:</strong> ${user.genere || ''}<br>
            <strong>Artista preferito:</strong> ${user.cantantePreferito || '-'}<br>
            <strong>Genere musicale preferito:</strong> ${user.generePreferito || '-'}
        </div>
        ${playlistsHtml}
    `;
}
       if (user) {
    renderProfile(user);

    // Mostra o nasconde i pulsanti in base all'utente loggato
    if (loggedUserID === userID) {
        actionsContainer.style.display = 'block'; // Può modificare/eliminare solo se è il proprio profilo
    } else {
        actionsContainer.style.display = 'none'; // Altrimenti nasconde tutto
    }

} else {
    container.innerHTML = `<div class="alert alert-danger">Utente non trovato</div>`;
    if (actionsContainer) actionsContainer.style.display = 'none';
}
if (editBtn) {
    editBtn.addEventListener('click', function () {
        if (loggedUserID !== userID) return;
        window.location.href = `edit-profile.html?user=${encodeURIComponent(userID)}`;
    });
}
const deleteBtn = document.getElementById('delete-profile');

if (deleteBtn) {
    deleteBtn.addEventListener('click', function () {
        if (loggedUserID !== userID) return;

        Swal.fire({
            title: 'Sei sicuro di voler eliminare il tuo account?',
            text: "Questa azione è irreversibile.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sì, elimina',
            cancelButtonText: 'Annulla',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#232526',
            background: '#181818',
            color: '#fff'
        }).then((result) => {
            if (result.isConfirmed) {
                const updatedUsers = users.filter(u => u.userID !== userID);
                localStorage.setItem('users', JSON.stringify(updatedUsers));

                let shared = JSON.parse(localStorage.getItem('sharedPlaylists') || '[]');
                shared = shared.filter(pl => pl.owner !== userID);
                localStorage.setItem('sharedPlaylists', JSON.stringify(shared));

                sessionStorage.removeItem('logged');
                window.location.href = "index.html";
            }
        });
    });
}
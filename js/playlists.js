function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name) || '';
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

document.addEventListener('DOMContentLoaded', () => {
    const playlistName = getQueryParam('name');
    const container = document.getElementById('playlist-details');
    const logged = sessionStorage.getItem('logged');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.userID === logged);

    if (!logged || !user) {
        if (container) {
            container.innerHTML = `<div class="alert alert-danger">Devi essere loggato per vedere questa pagina.</div>`;
        }
        return;
    }

    let playlist = user.playlist?.find(p => p.nome === playlistName);

    if (!playlist) {
        if (container) {
            container.innerHTML = `<div class="alert alert-warning">Playlist non trovata</div>`;
        }
        return;
    }

    function render() {
        playlist = user.playlist.find(p => p.nome === playlistName);
        if (!playlist) {
            container.innerHTML = `<div class="alert alert-warning">Playlist non trovata</div>`;
            return;
        }

        let img = "https://via.placeholder.com/300?text=Playlist";
        if (playlist.tracks && playlist.tracks.length > 0 && playlist.tracks[0].image) {
            img = playlist.tracks[0].image;
        }

        container.innerHTML = `
            <div class="card mb-4 bg-dark text-white border-0 rounded-4 shadow">
                <div class="row g-0">
                    <div class="col-md-4 d-flex align-items-center">
                        <img src="${img}" class="img-fluid w-100 rounded-start" style="aspect-ratio:1/1; object-fit:cover;" alt="Copertina playlist">
                    </div>
                    <div class="col-md-8 p-4 d-flex flex-column justify-content-center">
                        <h2 class="card-title fw-bold mb-2">${playlist.nome}</h2>
                        <p class="card-text text-light-emphasis mb-3">${playlist.tracks.length} brani</p>
                        <button class="btn btn-outline-danger btn-sm align-self-start" id="delete-playlist-btn">
                            <i class="bi bi-trash3"></i> Elimina playlist
                        </button>
                    </div>
                </div>
            </div>
            <h4 class="text-white mb-3">Brani</h4>
            <ul class="list-group mb-4" id="tracks-list">
                ${
                    playlist.tracks.length === 0
                    ? `<li class="list-group-item bg-dark text-muted text-center border-secondary">Nessun brano nella playlist</li>`
                    : playlist.tracks.map((t, i) => `
                        <li class="list-group-item bg-dark text-white border-secondary d-flex justify-content-between align-items-center">
                            <div class="d-flex align-items-center">
                                <img src="${t.image || 'https://via.placeholder.com/50?text=Track'}" 
                                     alt="" 
                                     class="rounded me-3" 
                                     style="width: 50px; height: 50px; object-fit: cover;">
                                <div>
                                    <a href="track.html?id=${t.id}" class="text-white fw-semibold text-decoration-none">${t.name}</a>
                                    <div class="text-white small">${t.artists}</div>
                                    <div class="text-white small">${t.album}</div>
                                </div>
                            </div>
                            <button class="btn btn-sm btn-outline-danger" data-index="${i}">
                                <i class="bi bi-x-lg"></i>
                            </button>
                        </li>
                    `).join('')
                }
            </ul>
        `;

        document.querySelectorAll('#tracks-list button[data-index]').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-index'));
                // Se è l'ultima traccia, chiedi conferma
                if (playlist.tracks.length === 1) {
                    const conferma = confirm('Eliminando questa traccia la playlist verrà eliminata. Sei sicuro di voler procedere?');
                    if (!conferma) return;
                    user.playlist = user.playlist.filter(p => p.nome !== playlistName);
                    saveUsers(users);
                    window.location.href = 'index.html';
                    return;
                }
                // Altrimenti elimina normalmente
                playlist.tracks.splice(idx, 1);
                saveUsers(users);
                Swal.fire({
                    icon: 'success',
                    title: 'Brano rimosso!',
                    text: 'Il brano è stato rimosso dalla playlist',
                    timer: 1800,
                    showConfirmButton: false
                });
                render();
            });
        });

        document.getElementById('delete-playlist-btn').addEventListener('click', function() {
            if (confirm('Sei sicuro di voler eliminare questa playlist?')) {
                user.playlist = user.playlist.filter(p => p.nome !== playlistName);
                saveUsers(users);
                window.location.href = 'index.html';
            }
        });
    }

    render();
});
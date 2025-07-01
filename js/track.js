function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name) || '';
}

async function getTrack(id) {
    const token = await getSpotifyToken();
    const url = `https://api.spotify.com/v1/tracks/${id}`;
    const response = await fetch(url, {
        headers: { Authorization: "Bearer " + token }
    });
    if (!response.ok) return null;
    return await response.json();
}

document.addEventListener('DOMContentLoaded', async () => {
    const id = getQueryParam('id');
    const container = document.getElementById('track-details');
    if (!id) {
        container.innerHTML = `<div class="alert alert-danger">ID brano non fornito</div>`;
        return;
    }
    let track;
    try {
        track = await getTrack(id);
    } catch (e) {
        container.innerHTML = `<div class="alert alert-danger">Errore nel recupero del brano</div>`;
        return;
    }
    if (!track) {
        container.innerHTML = `<div class="alert alert-danger">Brano non trovato</div>`;
        return;
    }

    // Recupera utente loggato e playlist dal localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    let user = users.find(u => u.userID === sessionStorage.getItem('logged'));
    if (!user) {
        container.innerHTML = `<div class="alert alert-warning">Devi essere loggato per aggiungere brani alle playlist</div>`;
        return;
    }
    if (!user.playlist) user.playlist = [];
    const playlists = user.playlist;

    let albumImage = '';
    if (track.album.images && track.album.images.length > 0) {
        albumImage = track.album.images[1]?.url || track.album.images[0]?.url || '';
    }

    container.innerHTML = `
        <div class="card shadow-lg border-0 rounded-4 overflow-hidden" style="background:#181818;">
            <div class="row g-0">
                <div class="col-md-4 d-flex align-items-center justify-content-center bg-black">
                    <img src="${albumImage}" class="img-fluid rounded-3 w-100" alt="${track.name}">
                </div>
                <div class="col-md-8 p-4 text-white">
                    <div class="card-body">
                        <h2 class="card-title fw-bold mb-3" style="color:#1ed760;">${track.name}</h2>
                        <p class="card-text mb-2"><strong>Artista:</strong> ${track.artists.map(a => `<a href="artist.html?id=${a.id}" class="link-light link-underline-opacity-0">${a.name}</a>`).join(', ')}</p>
                        <p class="card-text mb-2"><strong>Album:</strong> <a href="album.html?id=${track.album.id}" class="link-light link-underline-opacity-0">${track.album.name}</a></p>
                        <p class="card-text mb-2"><strong>Durata:</strong> ${(track.duration_ms/60000).toFixed(2)} min</p>
                        <audio controls src="${track.preview_url || ''}" style="width:100%;margin-bottom:10px;" ${track.preview_url ? '' : 'hidden'}></audio>
                        <a href="${track.external_urls.spotify}" target="_blank" class="btn btn-spotify mb-3 w-100">
                            <i class="fab fa-spotify me-2"></i>Apri su Spotify
                        </a>
                        <hr class="my-3" style="border-top:2px solid #1ed760;opacity:.5;">
                        <div id="playlist-section">
                            <h5 class="mb-3" style="color:#1ed760;">Aggiungi a playlist</h5>
                            <form id="add-to-playlist-form" class="mb-2">
                                <div class="mb-2">
                                    <label for="playlist-select" class="form-label">Scegli playlist:</label>
                                    <select id="playlist-select" class="form-select mb-2" name="playlist">
                                        <option value="">-- Nuova playlist --</option>
                                        ${playlists.map(p => `<option value="${p.nome}">${p.nome}</option>`).join('')}
                                    </select>
                                </div>
                                <div id="new-playlist-div">
                                    <input type="text" class="form-control mb-2" id="new-playlist-name" placeholder="Nome nuova playlist">
                                </div>
                                <button type="submit" class="btn btn-spotify w-100">Aggiungi</button>
                                <div id="playlist-msg" class="mt-2"></div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Funzionalità aggiunta a playlist
    const addForm = document.getElementById('add-to-playlist-form');
    const playlistSelect = document.getElementById('playlist-select');
    const newPlaylistDiv = document.getElementById('new-playlist-div');
    const newPlaylistName = document.getElementById('new-playlist-name');
    const playlistMsg = document.getElementById('playlist-msg');

    playlistSelect.addEventListener('change', function() {
        if (this.value === "") {
            newPlaylistDiv.style.display = "block";
        } else {
            newPlaylistDiv.style.display = "none";
        }
    });

    addForm.addEventListener('submit', function(e) {
        e.preventDefault();
        let selected = playlistSelect.value;
        let playlistNome = selected;
        if (selected === "") {
            playlistNome = newPlaylistName.value.trim();
            if (!playlistNome) {
                playlistMsg.innerHTML = `<span class="text-danger">Inserisci un nome per la nuova playlist</span>`;
                return;
            }
            // Crea nuova playlist
            if (user.playlist.some(p => p.nome === playlistNome)) {
                playlistMsg.innerHTML = `<span class="text-danger">Hai già una playlist con questo nome</span>`;
                return;
            }
            user.playlist.push({
                nome: playlistNome,
                tracks: [{
                    id: track.id,
                    name: track.name,
                    artists: track.artists.map(a => a.name).join(', '),
                    album: track.album.name,
                    albumId: track.album.id,
                    image: albumImage,
                    duration_ms: track.duration_ms
                }]
            });
        } else {
            // Aggiungi a playlist esistente
            let pl = user.playlist.find(p => p.nome === playlistNome);
            if (!pl) {
                playlistMsg.innerHTML = `<span class="text-danger">Playlist non trovata</span>`;
                return;
            }
            if (pl.tracks.some(t => t.id === track.id)) {
                playlistMsg.innerHTML = `<span class="text-warning">Questo brano è già nella playlist</span>`;
                return;
            }
            pl.tracks.push({
                id: track.id,
                name: track.name,
                artists: track.artists.map(a => a.name).join(', '),
                album: track.album.name,
                albumId: track.album.id,
                image: albumImage,
                duration_ms: track.duration_ms
            });
        }
        // Salva su localStorage
        let idx = users.findIndex(u => u.userID === user.userID);
        users[idx] = user;
        localStorage.setItem('users', JSON.stringify(users));
        Swal.fire({
            icon: 'success',
            title: 'Fatto!',
            text: 'Brano aggiunto alla playlist',
            timer: 1500,
            background: 'black',
            color: 'white',
            showConfirmButton: false,
            customClass: {
                popup: 'swal2-rounded'
            }
        });
        addForm.reset();
        if (playlistSelect.value === "") {
            newPlaylistDiv.style.display = "block";
        } else {
            newPlaylistDiv.style.display = "none";
        }
    });
});
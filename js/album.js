//Prende i parametri dal url
function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name) || ''; 
}

//Usa le API di Spotify per ottenere i dati dell'album con id specificato
async function getAlbum(id) {
    const token = await getSpotifyToken();
    const url = `https://api.spotify.com/v1/albums/${id}`;
    const response = await fetch(url, {
        headers: { Authorization: "Bearer " + token }
    });
    if (!response.ok) return null;
    return await response.json();
}

document.addEventListener('DOMContentLoaded', async () => {
    const id = getQueryParam('id');
    const container = document.getElementById('album-details');
    if (!id) {
        container.innerHTML = `<div class="alert alert-danger">ID album non fornito.</div>`;
        return;
    }

    // Recupera l'album usando l'ID fornito
    const album = await getAlbum(id);
    if (!album) {
        container.innerHTML = `<div class="alert alert-danger">Album non trovato.</div>`;
        return;
    }

    //scrive il formato della pagina con i dati dell'album
    container.innerHTML = `
    <div class="card mb-4 shadow-lg border-0 rounded-4 overflow-hidden">
        <div class="row g-0">
            <div class="col-md-4 bg-black d-flex align-items-center justify-content-center">
                <img src="${album.images[1]?.url || album.images[0]?.url || ''}" class="img-fluid rounded-start w-100" alt="${album.name}">
            </div>
            <div class="col-md-8 p-4 bg-dark text-white">
                <div class="card-body">
                    <h3 class="card-title fw-bold mb-3">${album.name}</h3>
                    <p class="card-text mb-2">
                        <strong>Artista:</strong> ${album.artists.map(a => `
                            <a href="artist.html?id=${a.id}" class="text-success text-decoration-none">${a.name}</a>
                        `).join(', ')}
                    </p>
                    <p class="card-text mb-1"><strong>Data di rilascio:</strong> ${album.release_date}</p>
                    <p class="card-text mb-4"><strong>Numero tracce:</strong> ${album.total_tracks}</p>
                    <a href="${album.external_urls.spotify}" target="_blank" class="btn btn-success rounded-pill px-4">
                        <i class="fab fa-spotify me-2"></i>Apri su Spotify
                    </a>
                </div>
            </div>
        </div>
    </div>

    <h4 class="text-white mt-5 mb-3">Tracce</h4>
    <ol class="list-group list-group-numbered mb-5">
        ${album.tracks.items.map(track => `
            <li class="list-group-item d-flex justify-content-between align-items-center bg-light-subtle">
                <a href="track.html?id=${track.id}" class="text-decoration-none text-dark">${track.name}</a>
                <span class="badge bg-secondary rounded-pill">${(track.duration_ms / 60000).toFixed(2)} min</span>
            </li>
        `).join('')}
    </ol>
`;
});
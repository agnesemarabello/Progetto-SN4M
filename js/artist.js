function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name) || '';
}

async function getArtist(id) {
    const token = await getSpotifyToken();
    const url = `https://api.spotify.com/v1/artists/${id}`;
    const response = await fetch(url, {
        headers: { Authorization: "Bearer " + token }
    });
    if (!response.ok) return null;
    return await response.json();
}


async function getArtistTopTracks(id) {
    const token = await getSpotifyToken();
    const url = `https://api.spotify.com/v1/artists/${id}/top-tracks?market=IT`;
    const response = await fetch(url, {
        headers: { Authorization: "Bearer " + token }
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.tracks || [];
}

async function getArtistAlbums(id) {
    const token = await getSpotifyToken();
    const url = `https://api.spotify.com/v1/artists/${id}/albums?market=IT&limit=5`;
    const response = await fetch(url, {
        headers: { Authorization: "Bearer " + token }
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.items || [];
}

document.addEventListener('DOMContentLoaded', async () => {
    const id = getQueryParam('id');
    const container = document.getElementById('artist-details');
    if (!id) {
        container.innerHTML = `<div class="alert alert-danger">ID artista non fornito.</div>`;
        return;
    }
    const artist = await getArtist(id);
    if (!artist) {
        container.innerHTML = `<div class="alert alert-danger">Artista non trovato.</div>`;
        return;
    }
    const topTracks = await getArtistTopTracks(id);
    const albums = await getArtistAlbums(id);

    container.innerHTML = `
    <div class="card mb-4 shadow-lg border-0 rounded-4 overflow-hidden">
        <div class="row g-0">
            <div class="col-md-4 bg-black d-flex align-items-center justify-content-center">
                <img src="${artist.images[1]?.url || artist.images[0]?.url || ''}" class="img-fluid rounded-start w-100" alt="${artist.name}">
            </div>
            <div class="col-md-8 p-4 bg-dark text-white">
                <div class="card-body">
                    <h3 class="card-title fw-bold mb-3">${artist.name}</h3>
                    <p class="card-text mb-2"><strong>Generi:</strong> ${artist.genres.join(', ') || 'N/A'}</p>
                    <p class="card-text mb-4"><strong>Followers:</strong> ${artist.followers.total.toLocaleString()}</p>
                    <a href="${artist.external_urls.spotify}" target="_blank" class="btn btn-success rounded-pill px-4">
                        <i class="fab fa-spotify me-2"></i>Apri su Spotify
                    </a>
                </div>
            </div>
        </div>
    </div>

    <h4 class="text-white mt-5 mb-3">Top Brani</h4>
    <ol class="list-group list-group-numbered mb-5">
        ${topTracks.map(track => `
            <li class="list-group-item d-flex justify-content-between align-items-center bg-light-subtle">
                <a href="track.html?id=${track.id}" class="text-decoration-none text-dark">${track.name}</a>
                <span class="badge bg-secondary rounded-pill">${(track.duration_ms / 60000).toFixed(2)} min</span>
            </li>
        `).join('')}
    </ol>

    <h4 class="text-white mt-5 mb-3">Album Recenti</h4>
    <div class="row">
        ${albums.map(album => `
            <div class="col-md-3 mb-4">
                <div class="card h-100 shadow-sm border-0">
                    <img src="${album.images[1]?.url || album.images[0]?.url || ''}" class="card-img-top" alt="${album.name}">
                    <div class="card-body d-flex flex-column">
                        <h6 class="card-title mb-1">
                            <a href="album.html?id=${album.id}" class="text-decoration-none text-white">${album.name}</a>
                        </h6>
                        <small class="text-white">${album.release_date}</small>
                    </div>
                </div>
            </div>
        `).join('')}
    </div>
    `;
});
async function searchSpotify(query) {
    const token = await getSpotifyToken();
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track,artist,album&limit=10`;
    const response = await fetch(url, {
        headers: { Authorization: "Bearer " + token }
    });
    if (!response.ok) return { tracks: [], artists: [], albums: [] };
    const data = await response.json();
    return {
        tracks: (data.tracks && data.tracks.items) ? data.tracks.items : [],
        artists: (data.artists && data.artists.items) ? data.artists.items : [],
        albums: (data.albums && data.albums.items) ? data.albums.items : []
    };
}

function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name) || '';
}

document.addEventListener('DOMContentLoaded', async () => {
    const query = getQueryParam('q');
    document.getElementById('search-query').textContent = query;
    const results = await searchSpotify(query);
    const container = document.getElementById('search-results');
    let html = '';

    const imgStyle = 'width:40px;height:40px;object-fit:cover;margin-right:10px;border-radius:5px;';
    const itemClass = 'list-group-item list-group-item-action bg-dark text-white d-flex align-items-center';

    if (results.tracks.length > 0) {
        html += `<h4 class="text-white">Brani</h4><div class="list-group mb-4">`;
        html += results.tracks.map(track => `
            <a href="track.html?id=${track.id}" class="${itemClass}">
                <img src="${track.album.images[2]?.url || ''}" alt="" style="${imgStyle}">
                <div>
                    <strong>${track.name}</strong><br>
                    <span class="text-light-emphasis small">di ${track.artists.map(a => a.name).join(', ')}</span>
                </div>
            </a>`).join('');
        html += `</div>`;
    }

    if (results.artists.length > 0) {
        html += `<h4 class="text-white">Artisti</h4><div class="list-group mb-4">`;
        html += results.artists.map(artist => `
            <a href="artist.html?id=${artist.id}" class="${itemClass}">
                <img src="${artist.images[2]?.url || artist.images[0]?.url || ''}" alt="" style="${imgStyle}">
                <strong>${artist.name}</strong>
            </a>`).join('');
        html += `</div>`;
    }

    if (results.albums.length > 0) {
        html += `<h4 class="text-white">Album</h4><div class="list-group mb-4">`;
        html += results.albums.map(album => `
            <a href="album.html?id=${album.id}" class="${itemClass}">
                <img src="${album.images[2]?.url || ''}" alt="" style="${imgStyle}">
                <div>
                    <strong>${album.name}</strong><br>
                    <span class="text-light-emphasis small">di ${album.artists.map(a => a.name).join(', ')}</span>
                </div>
            </a>`).join('');
        html += `</div>`;
    }

    if (!html) {
        html = `<div class="alert alert-warning">Nessun risultato trovato.</div>`;
    }

    container.innerHTML = html;
});
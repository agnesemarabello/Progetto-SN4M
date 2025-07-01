async function searchSpotify(query) {
    const token = await getSpotifyToken();
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track,artist&limit=5`;
    const response = await fetch(url, {
        headers: { Authorization: "Bearer " + token }
    });
    if (!response.ok) return { tracks: [], artists: [] };
    const data = await response.json();
    return {
        tracks: (data.tracks && data.tracks.items) ? data.tracks.items : [],
        artists: (data.artists && data.artists.items) ? data.artists.items : []
    };
}

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('searchInput');
    const preview = document.getElementById('search-preview');
    const form = document.getElementById('search-form');
    preview.classList.add("scroll-container");
    preview.style.height = '400px';
    preview.style.overflowY = 'auto';

    let lastQuery = "";
    let debounceTimeout = null;

    input.addEventListener('input', function () {
        const query = input.value.trim();
        if (debounceTimeout) clearTimeout(debounceTimeout);
        if (query.length < 2) {
            preview.style.display = 'none';
            preview.innerHTML = '';
            return;
        }
        debounceTimeout = setTimeout(async () => {
            lastQuery = query;
            preview.innerHTML = `<div class="list-group-item">Caricamento...</div>`;
            preview.style.display = 'block';
            const results = await searchSpotify(query);
            // Se l'utente ha cambiato query nel frattempo, ignora questi risultati
            if (input.value.trim() !== lastQuery) return;
            let html = '';
            if (results.tracks.length > 0) {
                html += `<div class="list-group-item active">Brani</div>`;
                html += results.tracks.map(track =>
                    `<a href="track.html?id=${track.id}" class="list-group-item list-group-item-action">
                        <img src="${track.album.images[2]?.url || track.album.images[0]?.url || ''}" alt="" style="width:32px;height:32px;object-fit:cover;margin-right:8px;">
                        <strong>${track.name}</strong> <span class="text-muted small">di ${track.artists.map(a => a.name).join(', ')}</span>
                    </a>`
                ).join('');
            }
            if (results.artists.length > 0) {
                html += `<div class="list-group-item active">Artisti</div>`;
                html += results.artists.map(artist =>
                    `<a href="artist.html?id=${artist.id}" class="list-group-item list-group-item-action">
                        <img src="${artist.images[2]?.url || artist.images[0]?.url || ''}" alt="" style="width:32px;height:32px;object-fit:cover;margin-right:8px;">
                        <div>
                            <strong>${artist.name}</strong>
                            ${artist.genres && artist.genres.length > 0 ? `<div class="text-muted small">Generi: ${artist.genres.slice(0, 2).join(', ')}</div>` : ''}
                        </div>
                    </a>`
                ).join('');
            }
            if (!html) html = `<div class="list-group-item">Nessun risultato</div>`;
            preview.innerHTML = html;
            preview.style.display = 'block';
        }, 300);
    });

    // Nascondi preview quando si clicca fuori
    document.addEventListener('click', function (e) {
        if (!preview.contains(e.target) && e.target !== input) {
            preview.style.display = 'none';
        }
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const query = input.value.trim();
        if (query.length >= 2) {
            window.location.href = `search.html?q=${encodeURIComponent(query)}`;
        }
        preview.style.display = 'none';
    });
});
function getCommunities() {
    return JSON.parse(localStorage.getItem('communities') || '[]');
}
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}
function getLoggedUser() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const logged = sessionStorage.getItem('logged');
    return users.find(u => u.userID === logged);
}

function searchSharedPlaylists(userID, searchTag = "", searchSong = "") {
    const communities = getCommunities();
    const myCommunities = communities.filter(c => c.membri.includes(userID));
    let results = [];
    myCommunities.forEach(c => {
        (c.sharedPlaylists || []).forEach(pl => {
            const matchTag = !searchTag || (pl.tags && pl.tags.some(tag => tag.toLowerCase().includes(searchTag.toLowerCase())));
            const matchSong = !searchSong || pl.tracks.some(t => t.name.toLowerCase().includes(searchSong.toLowerCase()));
            if (matchTag && matchSong) results.push({ ...pl, community: c.titolo });
        });
    });
    return results;
}

document.addEventListener('DOMContentLoaded', () => {
    const sharedList = document.getElementById('shared-playlist-list');
    const searchForm = document.getElementById('search-shared-form');
    const tagInput = document.getElementById('shared-tag');
    const songInput = document.getElementById('shared-song');
    const user = getLoggedUser();

    function renderSharedPlaylists() {
        const tag = tagInput.value.trim();
        const song = songInput.value.trim();
        const results = searchSharedPlaylists(user.userID, tag, song);
        if (results.length === 0) {
            sharedList.innerHTML = `<div class="alert alert-info">Nessuna playlist trovata</div>`;
            return;
        }
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        sharedList.innerHTML = results.map((pl, idx) => {
            const owner = users.find(u => u.userID === pl.userID);
            return `
                <div class="card card-shared mb-4">
                    <div class="card-body">
                        <h5 class="card-title mb-2">${pl.nome} <span class="badge badge-spotify ms-2">${pl.community}</span></h5>
                        <p class="card-text mb-1">${pl.descrizione || ''}</p>
                        <div class="mb-2">
                            ${pl.tags.map(tag => `<span class="badge badge-spotify me-1">${tag}</span>`).join('')}
                        </div>
                        <p class="mb-2"><span class="playlist-owner">Condivisa da:</span> <a href="user.html?user=${encodeURIComponent(pl.userID)}" class="playlist-owner">${owner ? owner.userID : pl.userID}</a></p>
                        <ul class="list-group mb-3">
                            ${pl.tracks.slice(0, 5).map(t => `<li class="list-group-item">${t.name} <span class="text-muted small">(${t.artists})</span></li>`).join('')}
                        </ul>
                        <button class="btn btn-spotify btn-sm import-btn" data-idx="${idx}">Importa nel mio profilo</button>
                    </div>
                </div>
            `;
        }).join('');
        // Importazione playlist
        document.querySelectorAll('.import-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-idx'));
                const pl = results[idx];
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const userObj = users.find(u => u.userID === user.userID);
                if (!userObj.playlist) userObj.playlist = [];
                // Evita doppioni
                if (userObj.playlist.some(p => p.nome === pl.nome)) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Playlist già importata!',
                        showConfirmButton: false,
                        timer: 1500
                    });
                    return;
                }
                userObj.playlist.push({
                    nome: pl.nome,
                    tracks: pl.tracks,
                    tags: pl.tags,
                    descrizione: pl.descrizione
                });
                saveUsers(users);
                Swal.fire({
                    icon: 'success',
                    title: 'Playlist importata!',
                    showConfirmButton: false,
                    timer: 1500
                });
            });
        });
    }

    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        renderSharedPlaylists();
    });

    renderSharedPlaylists();
});
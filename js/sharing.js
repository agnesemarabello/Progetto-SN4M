function getCommunities() {
    return JSON.parse(localStorage.getItem('communities') || '[]');
}
function saveCommunities(communities) {
    localStorage.setItem('communities', JSON.stringify(communities));
}
function getLoggedUser() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const logged = sessionStorage.getItem('logged');
    return users.find(u => u.userID === logged);
}

document.addEventListener('DOMContentLoaded', () => {
    const playlistSelect = document.getElementById('playlist-select');
    const communitySelect = document.getElementById('community-select');
    const shareForm = document.getElementById('share-form');
    const shareMsg = document.getElementById('share-msg');
    const shareWrapper = document.getElementById('share-wrapper');

    const user = getLoggedUser();
    if (!user) {
    if (shareWrapper) {
        shareWrapper.innerHTML = `
            <div class="alert alert-warning text-center p-4">
                <h5 class="mb-3"><i class="fas fa-exclamation-triangle me-2"></i>Accesso richiesto</h5>
                <p>Devi essere loggato per condividere una playlist con una comunità.</p>
                <a href="login.html" class="btn btn-spotify mt-2">Accedi</a>
            </div>`;
    }
    return;
}

    // Popola le playlist dell'utente
    (user.playlist || []).forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.nome;
        opt.textContent = p.nome;
        playlistSelect.appendChild(opt);
    });

    // Popola le community dove è iscritto
    const communities = getCommunities().filter(c => c.membri.includes(user.userID));
    communities.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.titolo;
        communitySelect.appendChild(opt);
    });

    shareForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const playlistName = playlistSelect.value;
        const communityId = communitySelect.value;
        const tags = document.getElementById('share-tags').value.split(',').map(t => t.trim()).filter(Boolean);
        const descrizione = document.getElementById('share-desc').value.trim();
        if (!playlistName || !communityId) {
            shareMsg.innerHTML = `<span class="text-danger">Seleziona playlist e comunità</span>`;
            return;
        }

        let sharedPlaylist = JSON.parse(localStorage.getItem('sharedPlaylist') || '[]');
        const playlist = (user.playlist || []).find(p => p.nome === playlistName);
        const communitiesAll = getCommunities();
        const community = communitiesAll.find(c => c.id === communityId);
        if (!playlist || !community) {
            shareMsg.innerHTML = `<span class="text-danger">Errore nella selezione</span>`;
            return;
        }
        
        if (sharedPlaylist.some(pl => pl.nome === playlist.nome && pl.userID === user.userID && pl.communityId === communityId)) {
            shareMsg.innerHTML = `<span class="text-warning">Hai già condiviso questa playlist in questa comunità</span>`;
            return;
        }

        sharedPlaylist.push({
            nome: playlist.nome,
            userID: user.userID,
            tracks: playlist.tracks,
            tags,
            descrizione,
            communityId 
        });

        localStorage.setItem('sharedPlaylist', JSON.stringify(sharedPlaylist));

        Swal.fire({
            icon: 'success',
            title: 'Playlist condivisa!',
            showConfirmButton: false,
            timer: 1500
        });
        shareForm.reset();
    });
});
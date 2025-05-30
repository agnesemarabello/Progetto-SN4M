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
    const communityList = document.getElementById('community-list');
    const searchInput = document.getElementById('community-search');
    const createForm = document.getElementById('create-community-form');
    const createMsg = document.getElementById('community-create-msg');

    function renderCommunities(filter = "") {
        const communities = getCommunities();
        const user = getLoggedUser();
        let filtered = communities;
        // Filtraggio per ricerca
        if (filter) {
            const f = filter.toLowerCase();
            filtered = communities.filter(c =>
                c.titolo.toLowerCase().includes(f) ||
                c.descrizione.toLowerCase().includes(f) ||
                (c.tags && c.tags.some(tag => tag.toLowerCase().includes(f)))
            );
        }
        if (filtered.length === 0) {
            communityList.innerHTML = `<div class="alert alert-info">Nessuna comunità trovata</div>`;
            return;
        }
        communityList.innerHTML = filtered.map(c => `
    <div class="card card-community mb-4">
        <div class="card-body">
            <h5 class="card-title mb-2">${c.titolo}</h5>
            <p class="card-text mb-1">${c.descrizione}</p>
            <div class="mb-2">
                ${c.tags.map(tag => `<span class="badge badge-spotify me-1">${tag}</span>`).join('')}
            </div>
            <p class="card-text mb-2"><i class="fas fa-users me-1"></i> <strong>${c.membri.length}</strong> membri</p>
            ${user && c.membri.includes(user.userID) ?
                `<span class="badge bg-success">Sei iscritto</span>` :
                `<button class="btn btn-spotify btn-sm join-btn" data-id="${c.id}"><i class="fas fa-user-plus me-1"></i>Unisciti</button>`
            }
        </div>
    </div>
`).join('');
        // Gestione join
        document.querySelectorAll('.join-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const communities = getCommunities();
                const c = communities.find(c => c.id === id);
                const user = getLoggedUser();
                if (c && user && !c.membri.includes(user.userID)) {
                    c.membri.push(user.userID);
                    saveCommunities(communities);
                    renderCommunities(searchInput.value.trim());
                }
            });
        });
    }

    // Ricerca
    searchInput.addEventListener('input', () => {
        renderCommunities(searchInput.value.trim());
    });

    // Creazione
    createForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const titolo = document.getElementById('community-title').value.trim();
        const descrizione = document.getElementById('community-desc').value.trim();
        const tags = document.getElementById('community-tags').value.split(',').map(t => t.trim()).filter(Boolean);
        if (!titolo || !descrizione || tags.length === 0) {
            createMsg.innerHTML = `<span class="text-danger">Compila tutti i campi.</span>`;
            return;
        }
        const communities = getCommunities();
        const user = getLoggedUser();
        const newCommunity = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            titolo, descrizione, tags, membri: [user.userID], sharedPlaylists: []
        };
        communities.push(newCommunity);
        saveCommunities(communities);
        createMsg.innerHTML = `<span class="text-success">Comunità creata!</span>`;
        createForm.reset();
        renderCommunities();
    });

    renderCommunities();
});
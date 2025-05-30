document.addEventListener('DOMContentLoaded', () => {
    const signupBtn = document.getElementById('signup-btn');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const dashboard = document.getElementById('dashboard');
    const authSection = document.getElementById('auth-section');
    const playlistList = document.getElementById('playlist-list');
    const usernameSpan = document.getElementById('username');
    

    // Gestione visibilità pulsanti
    const isLogged = sessionStorage.getItem('logged') !== null;
    signupBtn.classList.toggle('d-none', isLogged);
    loginBtn.classList.toggle('d-none', isLogged);
    logoutBtn.classList.toggle('d-none', !isLogged);


    signupBtn.addEventListener('click', () => window.location.href = 'signup.html');
    loginBtn.addEventListener('click', () => window.location.href = 'login.html');
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('logged');
        window.location.href = 'index.html';
    });

    // Mostra dashboard e playlist solo se loggato
    if (isLogged) {
        if (dashboard) dashboard.style.display = '';
        if (authSection) authSection.style.display = 'none';

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.userID === sessionStorage.getItem('logged'));
        if (usernameSpan && user) usernameSpan.textContent = user.nome;

        const playlists = user?.playlist || [];
        if (playlistList) {
            if (playlists.length === 0) {
                playlistList.innerHTML = `<div class="col"><div class="alert alert-info">Nessuna playlist trovata</div></div>`;
            } else {
                playlistList.className = "row row-cols-1 row-cols-md-3 g-4";
                playlistList.innerHTML = playlists.map(p => {
                    let img = "https://via.placeholder.com/300?text=Playlist";
                    if (p.tracks && p.tracks.length > 0 && p.tracks[0].image) {
                        img = p.tracks[0].image;
                    }
                    return `
                    <div class="col">
                        <div class="card h-100 shadow-sm playlist-card" style="cursor:pointer;" onclick="window.location.href='playlist.html?name=${encodeURIComponent(p.nome)}'">
                            <div style="width:100%;aspect-ratio:1/1;overflow:hidden;">
                                <img src="${img}" class="card-img-top" alt="Copertina playlist" style="object-fit:cover;width:100%;height:100%;">
                            </div>
                            <div class="card-body d-flex align-items-center justify-content-center">
                                <h5 class="card-title text-center w-100 mb-0">${p.nome}</h5>
                            </div>
                        </div>
                    </div>
                    `;
                }).join('');
            }
        }
    } else {
        if (dashboard) dashboard.style.display = 'none';
        if (authSection) authSection.style.display = '';
        if (playlistList) playlistList.innerHTML = '';
    }
});
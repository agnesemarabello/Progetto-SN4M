const client_id = "8b82c62c20f44ee29af7aefc0f01eb02";
const client_secret = "1a00534fb0454998902df640f2f12948";
const token_url = "https://accounts.spotify.com/api/token";

let spotifyToken = null;

async function getSpotifyToken() {
    // Recupera dal localStorage e controlla se è un oggetto valido
    const tokenStr = localStorage.getItem("access_token");
    if (tokenStr) {
        try {
            const tokenData = JSON.parse(tokenStr);
            if (tokenData.expires > Date.now()) {
                return tokenData.token;
            }
        } catch (e) {
            // Se non è JSON valido, ignora e prosegui
        }
    }
    // Richiedi nuovo token
    const response = await fetch(token_url, {
        method: "POST",
        headers: {
            Authorization: "Basic " + btoa(`${client_id}:${client_secret}`),
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ grant_type: "client_credentials" }),
    });
    const data = await response.json();
    const tokenData = {
        token: data.access_token,
        expires: Date.now() + (data.expires_in - 60) * 1000
    };
    localStorage.setItem("access_token", JSON.stringify(tokenData));
    return tokenData.token;
}
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const btnSearch = document.getElementById('btn-search');
    const resultsContainer = document.getElementById('results-container');
    
    const playerBar = document.getElementById('player-bar');
    const playerTitle = document.getElementById('player-title');
    const audioPlayer = document.getElementById('audio-player');
    const btnClosePlayer = document.getElementById('btn-close-player');

    // REGISTRO DE SERVICE WORKER (PWA)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(() => console.log('DJ Flow Service Worker: Ativo'))
            .catch(err => console.error('SW Error:', err));
    }

    const API_URL = window.location.origin;

    async function doSearch() {
        const query = searchInput.value.trim();
        if (!query) return;

        // Limpar e mostrar loading
        resultsContainer.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="empty-state">Pesquisando as melhores fontes...</div>
        `;
        
        try {
            const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            
            if (data.results && data.results.length > 0) {
                renderResults(data.results);
            } else {
                resultsContainer.innerHTML = '<div class="empty-state">Nenhum resultado encontrado. Tente outros termos.</div>';
            }
        } catch (e) {
            console.error(e);
            resultsContainer.innerHTML = '<div class="empty-state">❌ Erro de conexão.<br>Verifique se o servidor está online.</div>';
        }
    }

    function renderResults(tracks) {
        resultsContainer.innerHTML = '';
        tracks.forEach((track, index) => {
            const card = document.createElement('div');
            card.className = 'track-card';
            card.style.animationDelay = `${index * 0.1}s`; // Efeito cascata
            card.innerHTML = `
                <div class="track-thumb" style="background-image: url(${track.thumbnail})"></div>
                <div class="track-info">
                    <div class="track-title">${track.title}</div>
                    <div class="track-meta">⏱ ${track.duration}</div>
                    <div class="track-actions">
                        <button class="btn-sm btn-listen" data-url="${track.url}" data-title="${track.title}">🎧 Ouvir</button>
                        <button class="btn-sm btn-download" data-url="${track.url}" data-title="${track.title}">⬇ Baixar</button>
                    </div>
                </div>
            `;
            resultsContainer.appendChild(card);
        });

        // Event listeners re-ativados
        document.querySelectorAll('.btn-listen').forEach(btn => {
            btn.addEventListener('click', () => {
                const url = btn.getAttribute('data-url');
                const title = btn.getAttribute('data-title');
                startStream(url, title);
            });
        });

        document.querySelectorAll('.btn-download').forEach(btn => {
            btn.addEventListener('click', () => {
                const url = btn.getAttribute('data-url');
                const title = btn.getAttribute('data-title');
                startDownload(url, title);
            });
        });
    }

    function startStream(url, title) {
        playerTitle.textContent = title;
        playerBar.classList.remove('hidden');
        audioPlayer.src = `${API_URL}/stream?url=${encodeURIComponent(url)}`;
        audioPlayer.play();

        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: title,
                artist: 'DJ Flow Mobile',
                album: 'YouTube Cloud'
            });
        }
    }

    function startDownload(url, title) {
        const downloadUrl = `${API_URL}/download?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
        window.location.href = downloadUrl;
    }

    btnSearch.addEventListener('click', doSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            doSearch();
            searchInput.blur(); // Esconde o teclado no celular
        }
    });

    btnClosePlayer.addEventListener('click', () => {
        playerBar.classList.add('hidden');
        audioPlayer.pause();
        audioPlayer.src = '';
    });
});

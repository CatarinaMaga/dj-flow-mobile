const express = require('express');
const cors = require('cors');
const youtubedl = require('youtube-dl-exec');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001; // Diferente da porta 3000 do desktop local

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Para servir o frontend

// Helper para limpar a URL
function getCleanUrl(url) {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        return url.split('&')[0];
    }
    return url;
}

// 1. ROTA DE BUSCA (Search) - Top 5
app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Consulta vazia' });

    console.log(`🔍 Pesquisando: ${query}`);
    
    try {
        // Pesquisa os 5 melhores resultados no YouTube
        const results = await youtubedl(`ytsearch5:${query}`, {
            dumpJson: true,
            flatPlaylist: true,
            noWarnings: true
        });

        const formattedResults = (results.entries || []).map(entry => ({
            id: entry.id,
            title: entry.title,
            duration: entry.duration_string || 'N/A',
            thumbnail: entry.thumbnails?.[1]?.url || entry.thumbnail || '',
            url: `https://www.youtube.com/watch?v=${entry.id}`
        }));

        res.json({ success: true, results: formattedResults });
    } catch (err) {
        console.error('Erro na busca:', err);
        res.status(500).json({ error: 'Erro ao realizar pesquisa.' });
    }
});

// 2. ROTA DE STREAM (Ouviar)
app.get('/stream', (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).send('URL faltando');

    console.log(`🎧 Streaming: ${videoUrl}`);

    try {
        const subprocess = youtubedl.exec(videoUrl, {
            output: '-',
            format: 'bestaudio',
            noWarnings: true
        });

        res.header('Content-Type', 'audio/mpeg');
        subprocess.stdout.pipe(res);

        subprocess.on('error', (err) => {
            console.error('Erro no stream:', err);
        });
        
        req.on('close', () => {
            subprocess.kill();
        });

    } catch (err) {
        console.error('Erro ao processar stream:', err);
        res.status(500).send('Erro no servidor');
    }
});

// 3. ROTA DE DOWNLOAD (Baixar)
app.get('/download', (req, res) => {
    const videoUrl = req.query.url;
    const title = req.query.title || 'audio';
    
    if (!videoUrl) return res.status(400).send('URL faltando');

    console.log(`⬇ Baixando: ${videoUrl}`);

    try {
        res.header('Content-Disposition', `attachment; filename="${encodeURIComponent(title)}.m4a"`);
        res.header('Content-Type', 'audio/mp4');

        const subprocess = youtubedl.exec(videoUrl, {
            output: '-',
            format: 'bestaudio[ext=m4a]',
            noWarnings: true
        });

        subprocess.stdout.pipe(res);

        subprocess.on('error', (err) => {
            console.error('Erro no download:', err);
        });

    } catch (err) {
        console.error('Erro ao processar download:', err);
        res.status(500).send('Erro no servidor');
    }
});

app.listen(PORT, () => {
    console.log(`🚀 DJ Flow Mobile Engine ON: porta ${PORT}`);
});

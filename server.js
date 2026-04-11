const express = require('express');
const cors = require('cors');
const searchApi = require('youtube-search-api');
const { Innertube } = require('youtubei.js');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Singleton para o YouTubei
let youtube;
async function getYouTube() {
    if (!youtube) {
        youtube = await Innertube.create();
    }
    return youtube;
}

// 1. ROTA DE BUSCA (Search) - Top 5
app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Consulta vazia' });

    console.log(`🔍 Pesquisando via API Estável: "${query}"...`);
    
    try {
        const results = await searchApi.GetListByKeyword(query, false, 5);
        const formattedResults = (results.items || []).map(entry => ({
            id: entry.id,
            title: entry.title,
            duration: entry.lengthText || 'N/A',
            thumbnail: entry.thumbnail?.thumbnails?.[0]?.url || '',
            url: `https://www.youtube.com/watch?v=${entry.id}`
        }));
        res.json({ success: true, results: formattedResults });
    } catch (err) {
        console.error('ERRO NA BUSCA:', err.message);
        res.status(500).json({ error: 'Erro ao realizar pesquisa.' });
    }
});

// 2. ROTA DE STREAM (Ouvir)
app.get('/stream', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).send('URL faltando');

    try {
        const videoId = videoUrl.includes('v=') ? videoUrl.split('v=')[1].split('&')[0] : videoUrl.split('/').pop();
        console.log(`🎧 Streaming Camuflado: ${videoId}`);

        const yt = await getYouTube();
        const stream = await yt.download(videoId, {
            type: 'audio',
            quality: 'best',
            format: 'mp4'
        });

        res.header('Content-Type', 'audio/mp4');
        
        const reader = stream.getReader();
        
        // Loop para ler o stream do YouTubei e passar para o Express
        async function read() {
            const { done, value } = await reader.read();
            if (done) {
                res.end();
                return;
            }
            res.write(value);
            read();
        }
        
        read();

    } catch (err) {
        console.error('ERRO NO STREAM CAMUFLADO:', err.message);
        res.status(500).send('Erro no servidor de áudio (Nuvem em Manutenção)');
    }
});

// 3. ROTA DE DOWNLOAD (Baixar)
app.get('/download', async (req, res) => {
    const videoUrl = req.query.url;
    const title = req.query.title || 'audio';
    if (!videoUrl) return res.status(400).send('URL faltando');

    try {
        const videoId = videoUrl.includes('v=') ? videoUrl.split('v=')[1].split('&')[0] : videoUrl.split('/').pop();
        console.log(`⬇ Baixando Camuflado: ${videoId}`);

        res.header('Content-Disposition', `attachment; filename="${encodeURIComponent(title)}.m4a"`);
        res.header('Content-Type', 'audio/mp4');

        const yt = await getYouTube();
        const stream = await yt.download(videoId, {
            type: 'audio',
            quality: 'best',
            format: 'mp4'
        });

        const reader = stream.getReader();
        async function read() {
            const { done, value } = await reader.read();
            if (done) {
                res.end();
                return;
            }
            res.write(value);
            read();
        }
        read();

    } catch (err) {
        console.error('ERRO NO DOWNLOAD CAMUFLADO:', err.message);
        res.status(500).send('Erro no download');
    }
});

app.listen(PORT, () => {
    console.log(`🚀 DJ Flow Mobile Engine ON: porta ${PORT}`);
});

app.listen(PORT, () => {
    console.log(`🚀 DJ Flow Mobile Engine ON: porta ${PORT}`);
});

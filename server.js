const express = require('express');
const cors = require('cors');
const youtubedl = require('youtube-dl-exec');
const searchApi = require('youtube-search-api');
const ytdl = require('@distube/ytdl-core');
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

    console.log(`🔍 Pesquisando via API Leve: "${query}"...`);
    
    try {
        // Usando a API leve para busca de texto no YouTube
        const results = await searchApi.GetListByKeyword(query, false, 5);
        
        console.log(`Resultados via API: ${results.items ? results.items.length : 0}`);

        const formattedResults = (results.items || []).map(entry => {
            // Converter duração de segundos para MM:SS se for número
            let durationStr = entry.lengthText || 'N/A';
            
            return {
                id: entry.id,
                title: entry.title,
                duration: durationStr,
                thumbnail: entry.thumbnail?.thumbnails?.[0]?.url || '',
                url: `https://www.youtube.com/watch?v=${entry.id}`
            };
        });

        res.json({ success: true, results: formattedResults });
    } catch (err) {
        console.error('ERRO CRÍTICO NA BUSCA API:', err.message);
        res.status(500).json({ error: 'Erro ao realizar pesquisa no YouTube Cloud.' });
    }
});

// 2. ROTA DE STREAM (Ouvir)
app.get('/stream', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).send('URL faltando');

    console.log(`🎧 Streaming (Filtro Leve): ${videoUrl}`);

    try {
        // Usando ytdl-core para stream direto (muito mais estável em servidores)
        const stream = ytdl(videoUrl, {
            filter: 'audioonly',
            quality: 'highestaudio',
            highWaterMark: 1 << 25 // Buffer de 32MB para evitar engasgos
        });

        res.header('Content-Type', 'audio/mp4');
        stream.pipe(res);

        stream.on('error', (err) => {
            console.error('Erro no stream ytdl:', err.message);
        });

    } catch (err) {
        console.error('Erro ao processar stream:', err);
        res.status(500).send('Erro no servidor de áudio');
    }
});

// 3. ROTA DE DOWNLOAD (Baixar)
app.get('/download', async (req, res) => {
    const videoUrl = req.query.url;
    const title = req.query.title || 'audio';
    
    if (!videoUrl) return res.status(400).send('URL faltando');

    console.log(`⬇ Baixando (Filtro Leve): ${videoUrl}`);

    try {
        res.header('Content-Disposition', `attachment; filename="${encodeURIComponent(title)}.m4a"`);
        res.header('Content-Type', 'audio/mp4');

        ytdl(videoUrl, {
            filter: 'audioonly',
            quality: 'highestaudio'
        }).pipe(res);

    } catch (err) {
        console.error('Erro ao processar download:', err);
        res.status(500).send('Erro no servidor');
    }
});

app.listen(PORT, () => {
    console.log(`🚀 DJ Flow Mobile Engine ON: porta ${PORT}`);
});

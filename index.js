const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

const MINHA_CHAVE = "4a55a7bee4c840678777337e86f8431a";
const HEADERS = {
    'x-rapidapi-key': MINHA_CHAVE,
    'x-rapidapi-host': 'v3.football.api-sports.io'
};

app.get('/', (req, res) => {
    res.send('<body style="background:#121212;color:white;text-align:center;padding:50px;font-family:sans-serif;"><h1>⚽ SCANNER GLOBAL ATIVO</h1><a href="/jogos" style="color:#00ff00;font-size:20px;text-decoration:none;">CLIQUE AQUI PARA VER TODOS OS JOGOS</a></body>');
});

app.get('/jogos', async (req, res) => {
    try {
        const dataConsulta = req.query.data || new Date().toISOString().split('T')[0];
        
        const response = await axios.get('https://v3.football.api-sports.io/fixtures', {
            params: {
                date: dataConsulta,
                timezone: 'America/Sao_Paulo'
            },
            headers: HEADERS
        });

        // Separando os jogos por categorias para facilitar sua vida
        const jogos = response.data.response.map(item => ({
            id: item.fixture.id,
            liga: item.league.name,
            pais: item.league.country,
            casa: item.teams.home.name,
            fora: item.teams.away.name,
            placar: `${item.goals.home ?? 0}x${item.goals.away ?? 0}`,
            horario: new Date(item.fixture.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: item.fixture.status.short, // NS = Not Started (Pré-jogo), 1H/2H = Ao Vivo, FT = Encerrado
            minutos: item.fixture.status.elapsed
        }));

        // Filtros para o seu Scanner organizar a tela
        const preJogo = jogos.filter(j => j.status === 'NS');
        const aoVivo = jogos.filter(j => ['1H', '2H', 'HT', 'ET', 'P'].includes(j.status));
        const encerrados = jogos.filter(j => j.status === 'FT');

        res.json({
            sucesso: true,
            data: dataConsulta,
            contagem: {
                total: jogos.length,
                ao_vivo: aoVivo.length,
                pre_jogo: preJogo.length,
                encerrados: encerrados.length
            },
            categorias: {
                ao_vivo: aoVivo,
                proximos_jogos: preJogo,
                finalizados: encerrados
            }
        });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.listen(PORT, () => console.log('API Scanner Elite Hunter Online!'));

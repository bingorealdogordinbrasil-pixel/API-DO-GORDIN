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
    res.send('<body style="background:#121212;color:white;text-align:center;padding:50px;"><h1>⚽ SCANNER ELITE ATIVO</h1><a href="/jogos" style="color:#00ff00;font-size:25px;">VER PRÉ-JOGOS E LIVE</a></body>');
});

app.get('/jogos', async (req, res) => {
    try {
        // Mudamos para o endpoint 'fixtures' buscando as próximas 50 partidas garantidas
        const response = await axios.get('https://v3.football.api-sports.io/fixtures', {
            params: {
                next: '50', // Puxa os próximos 50 jogos confirmados no mundo
                timezone: 'America/Sao_Paulo'
            },
            headers: HEADERS
        });

        const listaEncontrada = response.data.response || [];

        const jogos = listaEncontrada.map(item => ({
            id: item.fixture.id,
            liga: item.league.name,
            pais: item.league.country,
            casa: item.teams.home.name,
            fora: item.teams.away.name,
            horario: new Date(item.fixture.date).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
            status: item.fixture.status.long,
            minutos: item.fixture.status.elapsed,
            placar: `${item.goals.home ?? 0}x${item.goals.away ?? 0}`
        }));

        res.json({
            sucesso: true,
            mensagem: "Listando próximos 50 jogos globais",
            total: jogos.length,
            dados: jogos
        });

    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.listen(PORT, () => console.log('Servidor rodando!'));

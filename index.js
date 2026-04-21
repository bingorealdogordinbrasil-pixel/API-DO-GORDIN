const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

const MINHA_CHAVE = "4a55a7bee4c840678777337e86f8431a";

// ISSO RESOLVE O "CANNOT GET /" - Agora a página inicial funciona!
app.get('/', (req, res) => {
    res.send('<h1>API-DO-GORDIN Online</h1><p>Use <b>/jogos</b> para ver as partidas.</p>');
});

app.get('/jogos', async (req, res) => {
    try {
        const dataConsulta = req.query.data || new Date().toISOString().split('T')[0];
        const response = await axios.get('https://v3.football.api-sports.io/fixtures', {
            params: {
                date: dataConsulta,
                timezone: 'America/Sao_Paulo'
            },
            headers: {
                'x-rapidapi-key': MINHA_CHAVE,
                'x-rapidapi-host': 'v3.football.api-sports.io'
            }
        });

        const partidas = response.data.response.map(item => ({
            id: item.fixture.id,
            liga: item.league.name,
            casa: item.teams.home.name,
            fora: item.teams.away.name,
            placar: `${item.goals.home ?? 0}x${item.goals.away ?? 0}`,
            status: item.fixture.status.short,
            horario: new Date(item.fixture.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }));

        res.json({
            sucesso: true,
            total: partidas.length,
            jogos: partidas
        });
    } catch (err) {
        res.status(500).json({ sucesso: false, erro: err.message });
    }
});

app.listen(PORT, () => console.log('Servidor 100% pronto!'));

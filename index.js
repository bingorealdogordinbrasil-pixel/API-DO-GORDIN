const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

const MINHA_CHAVE = "4a55a7bee4c840678777337e86f8431a";

app.get('/jogos', async (req, res) => {
    try {
        // Se você não passar data na URL, ele usa a de hoje
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
            minutos: item.fixture.status.elapsed,
            horario: new Date(item.fixture.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }));

        res.json({
            sucesso: true,
            data_buscada: dataConsulta,
            total: partidas.length,
            jogos: partidas
        });

    } catch (err) {
        res.status(500).json({ sucesso: false, erro: err.message });
    }
});

app.listen(PORT, () => console.log('API-DO-GORDIN atualizada!'));

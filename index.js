const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// Sua chave de acesso
const MINHA_CHAVE = "4a55a7bee4c840678777337e86f8431a";

app.get('/', (req, res) => res.send('API-DO-GORDIN: Online! Use /jogos para ver as partidas de hoje.'));

app.get('/jogos', async (req, res) => {
    try {
        // Pega a data de hoje no formato YYYY-MM-DD
        const hoje = new Date().toISOString().split('T')[0];

        const response = await axios.get('https://v3.football.api-sports.io/fixtures', {
            params: {
                date: hoje,
                timezone: 'America/Sao_Paulo'
            },
            headers: {
                'x-rapidapi-key': MINHA_CHAVE,
                'x-rapidapi-host': 'v3.football.api-sports.io'
            }
        });

        // Organiza os dados para o seu Scanner
        const partidas = response.data.response.map(item => ({
            id: item.fixture.id,
            liga: item.league.name,
            pais: item.league.country,
            casa: item.teams.home.name,
            fora: item.teams.away.name,
            placar: `${item.goals.home ?? 0}x${item.goals.away ?? 0}`,
            status: item.fixture.status.long,
            minutos: item.fixture.status.elapsed,
            horario: new Date(item.fixture.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }));

        res.json({
            sucesso: true,
            data: hoje,
            total_jogos: partidas.length,
            jogos: partidas
        });

    } catch (err) {
        res.status(500).json({ 
            sucesso: false, 
            erro: "Erro ao conectar com o servidor de dados",
            detalhes: err.message 
        });
    }
});

app.listen(PORT, () => console.log(`Servidor API-DO-GORDIN rodando na porta ${PORT}`));

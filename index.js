const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// Sua chave adicionada com sucesso
const MINHA_CHAVE = "4a55a7bee4c840678777337e86f8431a";

app.get('/', (req, res) => res.send('API-DO-GORDIN: Online e recebendo dados!'));

app.get('/jogos', async (req, res) => {
    try {
        const response = await axios.get('https://v3.football.api-sports.io/fixtures', {
            params: {
                live: 'all' // Puxa todos os jogos que estão rolando AGORA
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
            tempo: item.fixture.status.elapsed, // Minutos de jogo
            status: item.fixture.status.short
        }));

        res.json({
            sucesso: true,
            total_ao_vivo: partidas.length,
            jogos: partidas
        });

    } catch (err) {
        res.status(500).json({ 
            sucesso: false, 
            erro: "Erro na comunicação com o servidor de dados",
            detalhes: err.message 
        });
    }
});

app.listen(PORT, () => console.log('Servidor pronto!'));

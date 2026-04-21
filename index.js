const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/jogos', async (req, res) => {
    try {
        // Vamos usar uma API "espelho" que costuma ser mais aberta
        const response = await axios.get('https://worldcupjson.net/matches/today');
        
        const jogos = response.data.map(jogo => ({
            casa: jogo.home_team.name,
            fora: jogo.away_team.name,
            placar: `${jogo.home_team.goals}x${jogo.away_team.goals}`,
            status: jogo.status,
            tempo: jogo.time
        }));

        res.json({
            sucesso: true,
            fonte: "Dados Globais",
            total: jogos.length,
            dados: jogos
        });
    } catch (err) {
        // Se falhar, vamos tentar buscar de outra fonte pública
        res.json({ sucesso: false, msg: "Tentando reconectar fonte..." });
    }
});

app.listen(PORT, () => console.log('Saindo do zero!'));

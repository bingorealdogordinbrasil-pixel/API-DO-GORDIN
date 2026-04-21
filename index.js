const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

const MINHA_CHAVE = "4a55a7bee4c840678777337e86f8431a";
const HEADERS = {
    'x-rapidapi-key': MINHA_CHAVE,
    'x-rapidapi-host': 'v3.football.api-sports.io'
};

// 1. Página Inicial com Menu
app.get('/', (req, res) => {
    res.send(`
        <body style="background: #121212; color: white; font-family: sans-serif; text-align: center; padding-top: 50px;">
            <h1>⚽ API GLOBAL - SCANNER ELITE</h1>
            <p>Monitorando todas as ligas disponíveis</p>
            <hr style="width: 50%; border: 0.5px solid #333;">
            <div style="display: flex; flex-direction: column; gap: 10px; align-items: center;">
                <a href="/jogos" style="color: #00ff00; text-decoration: none; font-size: 20px;">📅 Ver Todos os Jogos de Hoje</a>
                <a href="/live" style="color: #ff0000; text-decoration: none; font-size: 20px;">🔴 Ver Jogos Ao Vivo (Mundo Todo)</a>
            </div>
        </body>
    `);
});

// 2. Rota que puxa TUDO de hoje (Todas as Ligas)
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

        const partidas = response.data.response.map(item => ({
            id: item.fixture.id,
            liga: item.league.name,
            pais: item.league.country, // Adicionei o país para você saber de onde é a liga
            casa: item.teams.home.name,
            fora: item.teams.away.name,
            placar: `${item.goals.home ?? 0}x${item.goals.away ?? 0}`,
            status: item.fixture.status.short,
            horario: new Date(item.fixture.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }));

        res.json({
            sucesso: true,
            total_jogos_encontrados: partidas.length,
            jogos: partidas
        });
    } catch (err) {
        res.status(500).json({ sucesso: false, erro: err.message });
    }
});

// 3. Rota Ao Vivo Global (Todas as Ligas que estão rolando AGORA)
app.get('/live', async (req, res) => {
    try {
        const response = await axios.get('https://v3.football.api-sports.io/fixtures?live=all', { headers: HEADERS });
        
        const monitoramento = response.data.response.map(item => ({
            liga: item.league.name,
            pais: item.league.country,
            confronto: `${item.teams.home.name} x ${item.teams.away.name}`,
            placar: `${item.goals.home}x${item.goals.away}`,
            tempo: item.fixture.status.elapsed + "'",
            // Lógica de alerta simplificada para o Scanner
            alerta: (item.fixture.status.elapsed > 70 && (item.goals.home + item.goals.away) < 2) ? "⚠️ OPORTUNIDADE OVER 1.5" : "Monitorando"
        }));

        res.json({
            status: "LIVE_GLOBAL",
            jogos_ao_vivo: monitoramento.length,
            lista: monitoramento
        });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.listen(PORT, () => console.log('API Global do Gordin Ativa!'));

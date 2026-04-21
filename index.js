const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// Sua chave sem espaços
const MINHA_CHAVE = "4a55a7bee4c840678777337e86f8431a";

app.get('/', (req, res) => {
    res.send('<body style="background:#121212;color:white;text-align:center;padding-top:50px;font-family:sans-serif;"><h1>🚀 SCANNER ELITE V3</h1><p>Clique abaixo para testar os dados:</p><a href="/jogos" style="color:#00ff00;font-size:20px;text-decoration:none;border:1px solid #00ff00;padding:10px;border-radius:5px;">VER JOGOS AO VIVO</a></body>');
});

app.get('/jogos', async (req, res) => {
    try {
        // Tentativa de busca global ao vivo
        const response = await axios.get('https://v3.football.api-sports.io/fixtures?live=all', {
            headers: {
                'x-apisports-key': MINHA_CHAVE, // Padrão da API-Sports
                'x-rapidapi-key': MINHA_CHAVE,  // Padrão RapidAPI
                'x-apisports-token': MINHA_CHAVE // Padrão alternativo
            }
        });

        // Se a API retornar erro de chave dentro do JSON
        if (response.data.errors && Object.keys(response.data.errors).length > 0) {
            return res.json({
                sucesso: false,
                mensagem: "Erro de Autenticação na API",
                detalhes: response.data.errors
            });
        }

        const partidas = response.data.response.map(item => ({
            id: item.fixture.id,
            liga: item.league.name,
            pais: item.league.country,
            confronto: `${item.teams.home.name} x ${item.teams.away.name}`,
            placar: `${item.goals.home}x${item.goals.away}`,
            tempo: item.fixture.status.elapsed + "'",
            status: item.fixture.status.short
        }));

        res.json({
            sucesso: true,
            total_live: partidas.length,
            resultados: partidas
        });

    } catch (err) {
        res.status(500).json({ 
            sucesso: false, 
            erro_conexao: err.message 
        });
    }
});

app.listen(PORT, () => console.log('Servidor rodando com chave atualizada!'));

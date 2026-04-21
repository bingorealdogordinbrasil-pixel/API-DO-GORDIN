const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// Sua chave (Verifique se não há espaços extras nela)
const MINHA_CHAVE = "4a55a7bee4c840678777337e86f8431a";

app.get('/', (req, res) => {
    res.send('<body style="background:#121212;color:white;text-align:center;padding-top:50px;font-family:sans-serif;"><h1>🚀 API SCANNER ATIVA</h1><p>Clique abaixo para ver os dados:</p><a href="/jogos" style="color:#00ff00;font-size:20px;text-decoration:none;border:1px solid #00ff00;padding:10px;border-radius:5px;">ABRIR JOGOS DE HOJE</a></body>');
});

app.get('/jogos', async (req, res) => {
    try {
        // Buscando os jogos de hoje de forma simplificada
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

        // Debug: Se a API oficial mandar erro, a gente vai ver aqui
        if (response.data.errors && Object.keys(response.data.errors).length > 0) {
            return res.json({
                sucesso: false,
                erro_da_api_oficial: response.data.errors
            });
        }

        const partidas = response.data.response.map(item => ({
            liga: item.league.name,
            pais: item.league.country,
            confronto: `${item.teams.home.name} x ${item.teams.away.name}`,
            placar: `${item.goals.home ?? 0}x${item.goals.away ?? 0}`,
            status: item.fixture.status.short,
            hora: new Date(item.fixture.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }));

        res.json({
            sucesso: true,
            total: partidas.length,
            resultados: partidas
        });

    } catch (err) {
        res.status(500).json({ 
            sucesso: false, 
            msg: "Erro de conexão",
            detalhe: err.message 
        });
    }
});

app.listen(PORT, () => console.log('API ligada com sucesso!'));

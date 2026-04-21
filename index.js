const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// Configuração da sua Chave
const MINHA_CHAVE = "4a55a7bee4c840678777337e86f8431a";
const HEADERS = {
    'x-rapidapi-key': MINHA_CHAVE,
    'x-rapidapi-host': 'v3.football.api-sports.io'
};

// --- FUNÇÃO DE LÓGICA DO SCANNER ---
// Aqui você define o que é um "alerta" para você
const calcularAlerta = (jogo) => {
    const tempo = jogo.fixture.status.elapsed;
    const golsC = jogo.goals.home || 0;
    const golsF = jogo.goals.away || 0;
    const totalGols = golsC + golsF;

    // Exemplo: Alerta de Over 0.5 HT se estiver 0x0 entre os minutos 15 e 30
    if (tempo >= 15 && tempo <= 30 && totalGols === 0) {
        return "🔥 PRESSÃO: Possível Over 0.5 HT";
    }
    // Exemplo: Alerta de Over 1.5 se estiver 1x0 ou 0x1 entre os minutos 60 e 75
    if (tempo >= 60 && tempo <= 75 && totalGols === 1) {
        return "✅ SCANNER: Jogo aberto para Over 1.5";
    }
    return "Analizando...";
};

// --- ROTAS DA SUA API ---

// 1. Página Inicial
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1>🚀 API SCANNER ELITE HUNTER</h1>
            <p>Status: <span style="color: green;">ONLINE</span></p>
            <hr>
            <p>Acesse as rotas:</p>
            <p><b>/jogos</b> - Todos os jogos do dia</p>
            <p><b>/live</b> - Apenas jogos AO VIVO com Alertas</p>
            <p><b>/brasil</b> - Jogos das Ligas Brasileiras</p>
        </div>
    `);
});

// 2. Rota de Jogos de Hoje (Geral)
app.get('/jogos', async (req, res) => {
    try {
        const hoje = new Date().toISOString().split('T')[0];
        const response = await axios.get(`https://v3.football.api-sports.io/fixtures?date=${hoje}&timezone=America/Sao_Paulo`, { headers: HEADERS });
        
        const dados = response.data.response.map(item => ({
            id: item.fixture.id,
            liga: item.league.name,
            casa: item.teams.home.name,
            fora: item.teams.away.name,
            placar: `${item.goals.home ?? 0}x${item.goals.away ?? 0}`,
            status: item.fixture.status.short,
            horario: new Date(item.fixture.date).toLocaleTimeString('pt-BR')
        }));

        res.json({ total: dados.length, jogos: dados });
    } catch (err) { res.status(500).json({ erro: err.message }); }
});

// 3. Rota AO VIVO (Com Lógica de Alerta para o Scanner)
app.get('/live', async (req, res) => {
    try {
        const response = await axios.get('https://v3.football.api-sports.io/fixtures?live=all', { headers: HEADERS });
        
        const dados = response.data.response.map(item => ({
            confronto: `${item.teams.home.name} x ${item.teams.away.name}`,
            placar: `${item.goals.home}x${item.goals.away}`,
            tempo: item.fixture.status.elapsed + "'",
            alerta: calcularAlerta(item) // Usa a lógica que criamos acima
        }));

        res.json({ online: dados.length, monitoramento: dados });
    } catch (err) { res.status(500).json({ erro: err.message }); }
});

// 4. Rota Especial Brasil (Série A)
app.get('/brasil', async (req, res) => {
    try {
        const hoje = new Date().toISOString().split('T')[0];
        const response = await axios.get(`https://v3.football.api-sports.io/fixtures?date=${hoje}&league=71&season=2026`, { headers: HEADERS });
        res.json(response.data.response);
    } catch (err) { res.status(500).json({ erro: err.message }); }
});

app.listen(PORT, () => console.log('API do Gordin voando!'));

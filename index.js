const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('API API-DO-GORDIN Ativa!'));

app.get('/jogos', async (req, res) => {
    try {
        // Usando o Flashscore (via simulação de navegador para não ser bloqueado)
        const { data } = await axios.get('https://www.resultados.com/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);
        const partidas = [];

        // Lógica para pegar os nomes dos times
        // Nota: Sites grandes mudam as classes sempre. 
        // Se retornar vazio, precisamos mapear a classe exata do dia.
        $('.event__match').each((i, el) => {
            partidas.push({
                casa: $(el).find('.event__participant--home').text(),
                fora: $(el).find('.event__participant--away').text(),
                placar: $(el).find('.event__score').text()
            });
        });

        res.json({
            sucesso: true,
            timestamp: new Date().toISOString(),
            jogos: partidas
        });

    } catch (err) {
        res.status(500).json({ 
            sucesso: false, 
            erro: "O site bloqueou a conexão ou a URL mudou",
            detalhes: err.message 
        });
    }
});

app.listen(PORT, () => console.log('Servidor ligado!'));

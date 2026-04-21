const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('API Ativa! use /jogos'));

app.get('/jogos', async (req, res) => {
    try {
        // Exemplo: Coletando de um site de resultados
        const { data } = await axios.get('https://www.PLACAR_EXEMPLO.com', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);
        const partidas = [];

        // Lógica de raspagem (ajuste conforme o site)
        $('div.match').each((i, el) => {
            partidas.push({
                casa: $(el).find('.home').text(),
                fora: $(el).find('.away').text()
            });
        });

        res.json(partidas);
    } catch (err) {
        res.json({ erro: "Erro ao buscar dados" });
    }
});

app.listen(PORT, () => console.log('Rodando!'));

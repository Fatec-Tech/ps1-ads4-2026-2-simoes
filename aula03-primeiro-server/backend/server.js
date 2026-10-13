const http = require('http');

// Simulando banco de dados em memória (já com o 4º paciente adicionado)
const pacientes = [
  { id: 1, nome: 'Maria Silva', email: 'maria.silva@email.com', nascimento: '1990-04-12' },
  { id: 2, nome: 'João Pereira', email: 'joao.pereira@email.com', nascimento: '1985-11-30' },
  { id: 3, nome: 'Ana Costa', email: 'ana.costa@email.com', nascimento: '2001-07-08' },
  { id: 4, nome: 'Carlos Souza', email: 'carlos.souza@email.com', nascimento: '1975-02-21' }
];

const servidor = http.createServer((req, res) => {
  // 1. Configuração de Cabeçalhos (Headers) e Liberação de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  // 2. Rota: GET /pacientes (Retorna a lista completa)
  if (req.method === 'GET' && req.url === '/pacientes') {
    res.writeHead(200);
    res.end(JSON.stringify(pacientes));
    return;
  }

  // 3. Rota: GET /pacientes/total (Exercício 1: Retorna a quantidade de pacientes)
  if (req.method === 'GET' && req.url === '/pacientes/total') {
    res.writeHead(200);
    res.end(JSON.stringify({ total: pacientes.length }));
    return;
  }

  // 4. Rota Não Encontrada (404)
  res.writeHead(404);
  res.end(JSON.stringify({ erro: 'Rota não encontrada' }));
});

const PORTA = 3000;
servidor.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
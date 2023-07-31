const { Client } = require('pg');
const axios = require('axios');

// Dados de conexão com o banco de dados
const dbConfig = {
  user: 'consulta_sgp',
  host: '177.23.28.34',
  database: 'dbsgp',
  password: '0CaxbETNeP/zqtpi',
  port: 5432,
};

// Consulta SQL
const sqlQuery = `
SELECT 
admcore_clientecontrato.id as "Contrato",
admcore_pessoa.nome,
admcore_contato.contato
FROM admcore_servicointernet
JOIN admcore_clientecontrato ON admcore_clientecontrato.id = admcore_servicointernet.clientecontrato_id
JOIN admcore_cliente ON admcore_cliente.id = admcore_clientecontrato.cliente_id
JOIN admcore_pessoa ON admcore_pessoa.id = admcore_cliente.pessoa_id
JOIN admcore_clientecontato ON admcore_clientecontato.cliente_id = admcore_cliente.id
JOIN admcore_contato ON admcore_contato.id = admcore_clientecontato.contato_id
JOIN atendimento_ocorrencia ON atendimento_ocorrencia.clientecontrato_id = admcore_clientecontrato.id
WHERE admcore_contato.contato NOT LIKE '%@%'
AND atendimento_ocorrencia.tipo_id IN ('20','34')
AND atendimento_ocorrencia.status = 2
AND atendimento_ocorrencia.data_agendamento >= CURRENT_DATE
AND atendimento_ocorrencia.data_agendamento < CURRENT_DATE + INTERVAL '1 day'
`;

// URL para enviar a mensagem via POST
const postUrl = 'http://localhost:3000/send-message';

// Limite de envios para o mesmo Contrato
const limiteEnvios = 1;

// Objeto para rastrear a contagem de envios para cada Contrato
let contratosEnviados = {};

// Função para limpar o número de telefone e remover caracteres não numéricos
function cleanPhoneNumber(phoneNumber) {
  return phoneNumber.replace(/\D/g, '');
}

// Variável para controlar a primeira verificação do dia
let primeiraVerificacaoDia = true;

// Função para conectar, executar a consulta, enviar as mensagens e tratar os resultados
async function executeQueryAndSendMessages() {
  const now = new Date();

  // Verificar se é domingo (0) para não executar a consulta
  if (now.getDay() === 0) {
    console.log('Hoje é domingo. Não será realizada a consulta.');
    return;
  }

// Verificar se é um novo dia após as 08:00 e redefinir o objeto e a flag de verificação
if (now.getHours() >= 8 && primeiraVerificacaoDia === false) {
  console.log('Novo dia após as 08:00. Zerando contagem de envios para os contratos.');
  contratosEnviados = {};
  primeiraVerificacaoDia = true;
}
  
  // Verificar se está fora do horário permitido para a consulta (depois das 19:00h e antes das 08:00h)
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentSecond = now.getSeconds();

if (currentHour >= 19 || (currentHour === 8 && currentMinute >= 1) || currentHour < 8) {
  console.log('Fora do horário permitido para a consulta (depois das 19:00h e antes das 08:00h).');
  return;
}

  const client = new Client(dbConfig);

  try {
    await client.connect();

    const result = await client.query(sqlQuery);

    // Exibir o resultado no terminal
    console.log(result.rows);

    // Enviar mensagens via POST para cada resultado da consulta
    for (const row of result.rows) {
      const { Contrato, nome, contato } = row;

      // Verificar se o Contrato já atingiu o limite de envios
      if (contratosEnviados[Contrato] && contratosEnviados[Contrato] >= limiteEnvios) {
        console.log(`Limite de envios atingido para Contrato ${Contrato}. Não enviando mais.`);
        continue;
      }

      // Limpar o número de telefone
      const cleanedPhoneNumber = cleanPhoneNumber(contato);

      // Corpo da mensagem a ser enviado via POST
      const messageData = {
        number: cleanedPhoneNumber,
        message: `Olá ${nome}! 🎉\n\nSeja bem-vindo(a) à família Tríade Fibra! Estamos empolgados por tê-lo(a) como nosso novo cliente. 😊\n\nPreparamos um passo a passo para você acompanhar a instalação do técnico. Isso *EVITARÁ TRANSTORNOS* na qualidade de sua conexão referente a instalação.🧐 \n\nAssim que o técnico iniciar a instalação, clique no link abaixo ou copie e cole em seu navegador do celular.👇\n\nhttps://triadefibra.com/qualidade/\n\nUtilize o código de segurança quando for solicitado: *${Contrato}* \ne não compartilhe este código! Qualquer dúvida entre em contato com nosso Suporte. 31985554661\n\nAgradecemos por escolher a Tríade Fibra. ❤🤝\n\nAtenciosamente,\nEquipe Tríade Fibra`,
      };

      try {
        // Enviar a mensagem via POST
        const response = await axios.post(postUrl, messageData);

        // Verificar se a mensagem foi enviada com sucesso
        if (response.status === 200) {
          console.log(`Mensagem enviada com sucesso para Contrato ${Contrato}`);
          
          // Incrementar o contador de envios para o Contrato
          contratosEnviados[Contrato] = (contratosEnviados[Contrato] || 0) + 1;
        } else {
          console.log(`Falha ao enviar mensagem para Contrato ${Contrato}`);
        }
      } catch (error) {
        console.error(`Erro ao enviar mensagem para Contrato ${Contrato}:`, error.message);
      }
    }

  } catch (error) {
    console.error('Ocorreu um erro durante a consulta:', error);

  } finally {
    // Fechar a conexão após a consulta
    await client.end();
  }
}

// Definir um intervalo de 5 minutos para executar a função periodicamente
setInterval(executeQueryAndSendMessages, 300000); // 10000 ms = 10 segundos

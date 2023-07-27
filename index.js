const venom = require('venom-bot');
const express = require('express');

const app = express();
const port = 3000;

app.use(express.json());

venom
  .create(
    'sessionName',
    (base64Qr, asciiQR, attempts, urlCode) => {
      console.log('Terminal QR code:\n', asciiQR);
      console.log('URL code:', urlCode);
      console.log('URL da imagem do QR Code:', urlCode.replace('qrcode', 'qrsession'));
      // Opção para exibir o QRCode em algum lugar, como enviar por email, salvar em arquivo, etc.
      // console.log('Base64 QR code image:\n', base64Qr);
    },
    undefined,
    { logQR: false, createPathFileToken: true }
  )
  .then((client) => {
    console.log('WhatsApp Bot conectado com sucesso');

    // Configurar as funcionalidades e manipulação de mensagens aqui

    app.post('/send-message', (req, res) => {
      const { number, message } = req.body;
      client
        .sendText(`${number}@c.us`, message)
        .then(() => {
          res.status(200).json({ success: true, message: 'Mensagem enviada com sucesso' });
        })
        .catch((error) => {
          res.status(500).json({ success: false, message: 'Erro ao enviar mensagem', error });
        });
    });

    app.listen(port, () => {
      console.log(`API está rodando em http://localhost:${port}`);
    });
  })
  .catch((error) => console.error('Erro ao iniciar o WhatsApp Bot', error));
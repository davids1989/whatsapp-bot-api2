const venom = require('venom-bot');
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3010;

app.use(express.json());

// Habilitar CORS
app.use(cors());

let qrCodeUrl = '';

venom
  .create(
    'sessionName',
    (base64Qr, asciiQR, attempts, urlCode) => {
      console.log('Terminal QR code:\n', asciiQR);
      // Opção para exibir o QRCode em algum lugar, como enviar por email, salvar em arquivo, etc.
      //console.log('Base64 QR code image:\n', base64Qr);
      //qrCodeUrl = urlCode.replace('qrcode', 'qrsession');
      //console.log('URL do QR Code:', qrCodeUrl);
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

    app.post('/send-image', async (req, res) => {
      const { number, imagePath, imageName, caption } = req.body;
      await client
        .sendImage(`${number}@c.us`, imagePath, imageName, caption)
        .then(() =>{
          res.status(200).json({ success: true, message: 'Imagem enviada com sucesso' });
        })
        .catch ((error) => {
          res.status(500).json({ success: false, message: 'Erro ao enviar imagem', error });
        });
    });

    app.listen(port, () => {
      console.log(`API está rodando em http://localhost:${port}`);
    });
  })
  .catch((error) => console.error('Erro ao iniciar o WhatsApp Bot', error));

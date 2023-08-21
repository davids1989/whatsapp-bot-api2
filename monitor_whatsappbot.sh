#!/bin/bash

# Verifica se o arquivo "informado.txt" existe, indicando que o e-mail já foi enviado
if [ -e /var/www/whatsapp-bot-api2/informado.txt ]; then
    exit 0  # Saímos do script sem enviar novo e-mail
fi


# Verifica se o processo com o PID ? está em execução -- Aqui toda vez que o PID mudar atualizar abaixo
if ! ps -p 481927 >/dev/null; then
    # Envia um e-mail de notificação
   echo -e "Subject: ALERTA!! API WHATSAPP PAROU\n\nA aplicação WHATSAPP API parou de funcionar! PID: 481927" | sudo ssmtp -v suporteti@triadefibra.com.br

    # Cria o arquivo "informado.txt" para indicar que o e-mail foi enviado
    touch /var/www/whatsapp-bot-api2/informado.txt

fi

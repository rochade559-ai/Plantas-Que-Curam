const express = require('express');
const mercadopago = require('mercadopago');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Configurar Mercado Pago
mercadopago.configure({
    access_token: process.env.ACCESS_TOKEN
});

// Rota para criar pagamento PIX
app.post('/api/create-pix', (req, res) => {
    const { nome, email, transaction_amount } = req.body;
    
    const payment_data = {
        transaction_amount: parseFloat(transaction_amount),
        description: 'Protocolo Saude em Dia',
        payment_method_id: 'pix',
        payer: {
            email: email,
            first_name: nome.split(' ')[0]
        }
    };
    
    mercadopago.payment.create(payment_data).then(payment => {
        res.json({
            success: true,
            qr_code: payment.body.point_of_interaction.transaction_data.qr_code,
            qr_code_base64: payment.body.point_of_interaction.transaction_data.qr_code_base64,
            payment_id: payment.body.id
        });
    }).catch(error => {
        console.error(error);
        res.status(400).json({ success: false, error: error.message });
    });
});

// Rota para verificar status
app.get('/api/payment-status/:id', (req, res) => {
    mercadopago.payment.findById(req.params.id).then(payment => {
        res.json({ status: payment.body.status });
    }).catch(error => {
        res.status(400).json({ error: error.message });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log('Servidor rodando na porta ' + PORT);
});

import { ACCESS_TOKEN } from "../config.json";

export const createCardToken = async (cardData) => {
  try {
    const response = await fetch('https://api.mercadopago.com/v1/card_tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify(cardData),
    });

    if (!response.ok) {
      throw new Error('Erro ao gerar o card_token_id');
    }

    const data = await response.json();
    return data.id; // Retorna o card_token_id
  } catch (error) {
    console.error('Erro ao criar o card_token_id:', error);
    throw error;
  }
};

export const handleIntegrationMP = async (userEmail, cardTokenId) => {
  const preapprovalData = {
    "preapproval_plan_id": "2c93808493b072d70193be7c14b30582",
    "reason": "Pagamento de Plano",
    "external_reference": `REF-${new Date().getTime()}`, // Exemplo de referência única
    "payer_email": userEmail,
    "card_token_id": cardTokenId,
    "auto_recurring": {
      "frequency": 1,
      "frequency_type": "months",
      "start_date": new Date().toISOString(),
      "end_date": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
      "transaction_amount": 85,
      "currency_id": "BRL",
    },
    "back_url": "myapp://callback",
    "status": "authorized",
  };

  try {
    const response = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preapprovalData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erro no pagamento');
    }

    return data;
  } catch (error) {
    console.error('Erro ao criar preapproval:', error);
    throw error;
  }
};

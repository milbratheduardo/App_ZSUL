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

export const handleIntegrationMP = async (userEmail, cardTokenId, planId) => {
  const preapprovalData = {
    preapproval_plan_id: planId,
    reason: "Plano Escolinha de Futebol São Paulo RS",
    external_reference: `REF-${new Date().getTime()}`,
    payer_email: userEmail,
    card_token_id: cardTokenId,
    back_url: "myapp://callback",
    status: "authorized",
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

export const handlePixPaymentMP = async (userEmail, userCPF, userNome) => {
  try {
    const idempotencyKey = `key-${new Date().getTime()}`; // Geração do X-Idempotency-Key

    const pixPaymentData = {
      transaction_amount: 100, // Valor do plano
      description: 'Pagamento do Plano Mensal',
      payment_method_id: 'pix',
      payer: {
        email: userEmail,
        first_name: userNome,
        identification: { type: 'CPF', number: userCPF },
      },
    };

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(pixPaymentData),
    });

    const data = await response.json();
    console.log('Resposta completa da API Mercado Pago:', data);

    if (data.id && data.point_of_interaction?.transaction_data?.ticket_url) {
      return data; 
    } else {
      throw new Error('Erro: Resposta não contém ID da transação ou ticket_url.');
    }
  } catch (error) {
    console.error('Erro ao processar pagamento com Pix:', error.message);
    throw error;
  }
};


export const handlePixPaymentMP2 = async (userEmail, userCPF, userNome) => {
  try {
    const idempotencyKey = `key-${new Date().getTime()}`; // Geração do X-Idempotency-Key

    const pixPaymentData = {
      transaction_amount: 50, // Valor do plano
      description: 'Pagamento do Plano Mensal - 50%',
      payment_method_id: 'pix',
      payer: {
        email: userEmail,
        first_name: userNome,
        identification: { type: 'CPF', number: userCPF },
      },
    };

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(pixPaymentData),
    });

    const data = await response.json();
    console.log('Resposta completa da API Mercado Pago:', data);

    if (data.id && data.point_of_interaction?.transaction_data?.ticket_url) {
      return data; 
    } else {
      throw new Error('Erro: Resposta não contém ID da transação ou ticket_url.');
    }
  } catch (error) {
    console.error('Erro ao processar pagamento com Pix:', error.message);
    throw error;
  }
};

export const handlePixPaymentMP3 = async (userEmail, userCPF, userNome) => {
  try {
    const idempotencyKey = `key-${new Date().getTime()}`; // Geração do X-Idempotency-Key

    const pixPaymentData = {
      transaction_amount: 80, // Valor do plano
      description: 'Pagamento do Plano Mensal - Irmãos',
      payment_method_id: 'pix',
      payer: {
        email: userEmail,
        first_name: userNome,
        identification: { type: 'CPF', number: userCPF },
      },
    };

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(pixPaymentData),
    });

    const data = await response.json();
    console.log('Resposta completa da API Mercado Pago:', data);

    if (data.id && data.point_of_interaction?.transaction_data?.ticket_url) {
      return data; 
    } else {
      throw new Error('Erro: Resposta não contém ID da transação ou ticket_url.');
    }
  } catch (error) {
    console.error('Erro ao processar pagamento com Pix:', error.message);
    throw error;
  }
};




// stripe.js
const Stripe = require('stripe');
const stripe = new Stripe('sk_test_51Q7MGVKiDdI5fpVwTj3cObfbBCfaenanBRTsu6iSsrzpLNKGTnvMq1KF9FTWqmVMVkrS41N1YKkKDhHvMc8BVaMY00QkkIw3Rk'); // Substitua pela sua chave secreta

const createCustomer = async (username, email, cpf) => {
  try {
    const customer = await stripe.customers.create({
      name: username,
      email: email,
      metadata: {
        cpf: cpf
      }
    });
    return customer.id;
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    throw error;
  }
};

const createInvoice = async (customerId, amount, dueDate) => {
  try {
    const invoiceItem = await stripe.invoiceItems.create({
      customer: customerId,
      amount: amount, // Valor em centavos, ex: R$100,00 = 10000
      currency: 'brl',
      description: 'Cobrança referente ao plano contratado'
    });

    const invoice = await stripe.invoices.create({
      customer: customerId,
      collection_method: 'send_invoice',
      due_date: dueDate,
      auto_advance: true,
    });

    return invoice;
  } catch (error) {
    console.error('Erro ao criar fatura:', error);
    throw error;
  }
};

const createInvoicesForContract = async (customerId, tipoContrato, diaCobranca) => {
  try {
    const today = new Date();
    let invoices = [];

    if (tipoContrato === 'mensal') {
      for (let i = 0; i < 2; i++) {
        const dueDate = new Date(today.getFullYear(), today.getMonth() + i, diaCobranca).getTime() / 1000;
        const invoice = await createInvoice(customerId, 10000, dueDate); // Valor exemplo de R$ 100,00
        invoices.push(invoice);
      }
    } else if (tipoContrato === 'semestral') {
      for (let i = 0; i < 6; i++) {
        const dueDate = new Date(today.getFullYear(), today.getMonth() + i, diaCobranca).getTime() / 1000;
        const invoice = await createInvoice(customerId, 10000, dueDate);
        invoices.push(invoice);
      }
    } else if (tipoContrato === 'anual') {
      for (let i = 0; i < 12; i++) {
        const dueDate = new Date(today.getFullYear(), today.getMonth() + i, diaCobranca).getTime() / 1000;
        const invoice = await createInvoice(customerId, 10000, dueDate);
        invoices.push(invoice);
      }
    }

    return invoices;
  } catch (error) {
    console.error('Erro ao criar faturas para o contrato:', error);
    throw error;
  }
};

module.exports = {
  createCustomer,
  createInvoicesForContract,
};

import { View, Text, TextInput, Alert, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { useStripe } from '@stripe/stripe-react-native';
import CustomButton from './CustomButton';

const Payment = () => {
    const [name, setName] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [customers, setCustomers] = useState([]);
    const stripe = useStripe();

    const subscribe = async () => {
        try {
            const response = await fetch('https://1b80-2804-d51-a451-700-88de-6221-ac7a-9b54.ngrok-free.app/pagamento', {
                method: 'POST',
                body: JSON.stringify({ name }),
                headers: {
                    "Content-Type": "application/json"
                }
            });
            const data = await response.json();
            if (!response.ok) return Alert.alert(data.message);
            const clientSecret = data.clientSecret;
            const initSheet = await stripe.initPaymentSheet({
                paymentIntentClientSecret: clientSecret,
                merchantDisplayName: 'TESTE'
            });
            if (initSheet.error) return Alert.alert(initSheet.error.message);
            const presentSheet = await stripe.presentPaymentSheet({
                clientSecret
            });
            if (presentSheet.error) return Alert.alert(presentSheet.error.message);
            Alert.alert('Pagamento Completo!');
        } catch (err) {
            console.error(err);
            Alert.alert("Algo deu errado");
        }
    };

    const fetchTransactions = async () => {
        try {
            const response = await fetch('https://1b80-2804-d51-a451-700-88de-6221-ac7a-9b54.ngrok-free.app/transacoes');
            const data = await response.json();
            if (!response.ok) return Alert.alert('Erro ao buscar transações');
            setTransactions(data.transacoes.slice(0, 100)); // Limitando a 100 itens
        } catch (err) {
            console.error(err);
            Alert.alert('Erro ao buscar transações');
        }
    };

    const fetchCustomers = async () => {
        try {
            const response = await fetch('https://1b80-2804-d51-a451-700-88de-6221-ac7a-9b54.ngrok-free.app/clientes');
            const data = await response.json();
            if (!response.ok) return Alert.alert('Erro ao buscar clientes');
            setCustomers(data.clientes.slice(0, 100)); // Limitando a 100 itens
        } catch (err) {
            console.error(err);
            Alert.alert('Erro ao buscar clientes');
        }
    };

    return (
        <View style={{ padding: 20 }}>
            <TextInput
                value={name} onChangeText={(text) => setName(text)}
                placeholder='Nome'
                style={{
                    width: 300,
                    fontSize: 20,
                    padding: 10,
                    borderWidth: 1,
                    marginBottom: 20
                }}
            />
            <CustomButton
                title="Teste Checkout"
                handlePress={subscribe}
                containerStyles="p-3 mt-10"
            />

            <CustomButton
                title="Listar Transações"
                handlePress={fetchTransactions}
                containerStyles="p-3 mt-10"
            />

            <CustomButton
                title="Listar Clientes"
                handlePress={fetchCustomers}
                containerStyles="p-3 mt-10"
            />

            <ScrollView style={{ marginTop: 20, maxHeight: 400 }}>
                {transactions.length > 0 && (
                    <View>
                        <Text style={{ fontSize: 20, marginBottom: 10 }}>Transações:</Text>
                        {transactions.map((transaction, index) => (
                            <View key={index} style={{ marginBottom: 10 }}>
                                <Text>Valor: R$ {transaction.amount}</Text>
                                <Text>Descrição: {transaction.description}</Text>
                                <Text>Cliente: {transaction.client}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {customers.length > 0 && (
                    <View>
                        <Text style={{ fontSize: 20, marginBottom: 10 }}>Clientes:</Text>
                        {customers.map((customer, index) => (
                            <View key={index} style={{ marginBottom: 10 }}>
                                <Text>Nome: {customer.name}</Text>
                                <Text>Email: {customer.email}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default Payment;

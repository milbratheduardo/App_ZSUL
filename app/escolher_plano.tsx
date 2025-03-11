import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGlobalContext } from '@/context/GlobalProvider';
import { getAllFaturas, savePlano, getAlunosById } from '@/lib/appwrite';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import 'moment/locale/pt-br';

moment.locale('pt-br');

const planosBase = [
    { nome: 'Mensal', id: '2c93808493b073170193d2317ddb0ac2' },
    { nome: 'Semestral', id: '2c93808493b072d70193d233e9eb0b23' },
    { nome: 'Anual', id: '2c93808493b072d80193d234fe0e0b24' },
  ];
  
  const planosIrmaos = {
    1: {
      Mensal: '2c9380849469a4a101946ae6d35700aa',
      Semestral: '2c9380849469a43201946ae4a44100a4',
      Anual: '2c9380849469a43201946add8ee300a0',
    },
    2: {
      Mensal: '2c938084954560f50195499e713a0295',
      Semestral: '2c938084954560f50195499e713a0294',
      Anual: '2c938084954560f50195499e713a0293',
    },
  };

  
  const EscolherPlano = () => {
    const { user } = useGlobalContext();
    const params = useLocalSearchParams();
    const router = useRouter();
  
    const [planoSelecionado, setPlanoSelecionado] = useState(null);
    const [diaCobranca, setDiaCobranca] = useState('');
    const [quantidadeAtletas, setQuantidadeAtletas] = useState(0);
    const [modalMessage, setModalMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [planosDisponiveis, setPlanosDisponiveis] = useState(planosBase);
    const [mensagemPlano, setMensagemPlano] = useState('');
    
    useEffect(() => {
        const fetchFaturas = async () => {
            try {
                const faturas = await getAllFaturas();
                const atletasUnicos = new Set(
                    faturas.filter((fatura) => fatura.responsavelId === user.userId).map((fatura) => fatura.atletaId)
                );
                setQuantidadeAtletas(atletasUnicos.size);
            } catch (error) {
                console.error('Erro ao buscar faturas:', error);
            }
        };

        const verificarAluno = async () => {
            try {
                const aluno = await getAlunosById(params.alunoId);
                if (aluno.off === '50Off') {
                    setPlanosDisponiveis([{ nome: 'Mensal', id: '2c9380849469a43201946ae827c500a9' }]);
                }
            } catch (error) {
                console.error('Erro ao buscar aluno:', error);
            }
        };

        fetchFaturas();
        verificarAluno();
    }, [user.userId, params.alunoId]);

  
    const handleSelecionarPlano = (plano) => {
      let selectedPlanId = plano.id;
  
      if (planosDisponiveis.length === 1 && planosDisponiveis[0].id === '2c9380849469a43201946ae827c500a9') {
          selectedPlanId = '2c9380849469a43201946ae827c500a9';
      } else if (quantidadeAtletas > 0 && quantidadeAtletas <= 2) {
          selectedPlanId = planosIrmaos[quantidadeAtletas]?.[plano.nome] || plano.id;
      }
  
      setPlanoSelecionado({ nome: plano.nome, id: selectedPlanId });
  
      switch (plano.nome) {
          case 'Mensal':
              setMensagemPlano('Este plano é ideal para quem deseja flexibilidade, com renovação mensal.');
              break;
          case 'Semestral':
              setMensagemPlano('Este plano oferece um contrato único com validade de 6 meses, sem possibilidade de cancelamento.');
              break;
          case 'Anual':
              setMensagemPlano('Este plano oferece um contrato único com validade de 1 ano, sem possibilidade de cancelamento.');
              break;
          default:
              setMensagemPlano('');
      }
  };
    
    const handleSalvarPlano = async () => {
        if (!planoSelecionado || !diaCobranca) {
            alert('Selecione um plano e insira o dia da cobrança');
            return;
        }
    
        setLoading(true);
        const anoAtual = moment().year();
        const mesAtual = moment().month();
        let faturas = [];
    
        if (planoSelecionado.nome === 'Mensal') {
            for (let i = 1; i <= 12; i++) {
                let novoMes = (mesAtual + i) % 12;
                let novoAno = anoAtual + Math.floor((mesAtual + i) / 12);
                const dataFutura = moment().month(novoMes).year(novoAno);
                faturas.push({ 
                    dia: diaCobranca, 
                    mes_cobranca: dataFutura.format('MMMM/YY') 
                });
            }
        } else if (planoSelecionado.nome === 'Semestral') {
            for (let i = 1; i <= 6; i++) {  // Gera 6 faturas separadas
                let novoMes = (mesAtual + i) % 12;
                let novoAno = anoAtual + Math.floor((mesAtual + i) / 12);
                const dataFutura = moment().month(novoMes).year(novoAno);
                faturas.push({ 
                    dia: diaCobranca, 
                    mes_cobranca: dataFutura.format('MMMM/YY') 
                });
            }
        } else if (planoSelecionado.nome === 'Anual') {
            for (let i = 1; i <= 12; i++) {  // Gera 12 faturas separadas
                let novoMes = (mesAtual + i) % 12;
                let novoAno = anoAtual + Math.floor((mesAtual + i) / 12);
                const dataFutura = moment().month(novoMes).year(novoAno);
                faturas.push({ 
                    dia: diaCobranca, 
                    mes_cobranca: dataFutura.format('MMMM/YY') 
                });
            }
        }
    
        try {
            for (let fatura of faturas) {
                await savePlano({
                    responsavelId: user.userId,
                    atletaId: params.alunoId,
                    plano: planoSelecionado.nome,
                    planoId: planoSelecionado.id,
                    dia_cobranca: diaCobranca,
                    mes_cobranca: fatura.mes_cobranca,
                });
            }
            setModalMessage('Plano escolhido com sucesso!');
        } catch (error) {
            setModalMessage(`Erro ao salvar plano: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };  

    const precosPlanos = [
      { id: '2c93808493b073170193d2317ddb0ac2', price: 100 },
      { id: '2c93808493b072d70193d233e9eb0b23', price: 90 },
      { id: '2c93808493b072d80193d234fe0e0b24', price: 80 },
      { id: '2c9380849469a4a101946ae6d35700aa', price: 50 },
      { id: '2c9380849469a43201946ae4a44100a4', price: 45 }, 
      { id: '2c9380849469a43201946add8ee300a0', price: 40 },
      { id: '2c9380849563a16501957c04c9b90c2c', price: 25 },
      { id: '2c938084955cc48001957c03e73a0f95', price: 25 },
      { id: '2c938084954560f50195499e713a0293', price: 25 },
      { id: '2c9380849469a43201946ae827c500a9', price: 50 },
  ];
  
  const getPlanoPreco = (plano) => {
    const planoId = planosIrmaos[quantidadeAtletas]?.[plano.nome] || plano.id;
    
    const planoEncontrado = precosPlanos.find(p => p.id === planoId);
    return planoEncontrado ? planoEncontrado.price : 'N/A';
};
    
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Escolher Plano: {params.alunoNome}</Text>
        <Text style={styles.subtitle}>Selecione um plano e defina o dia da cobrança</Text>

        <Modal visible={!!modalMessage} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <MaterialCommunityIcons name={modalMessage.includes('Erro') ? 'alert-circle' : 'check-circle'} size={48} color="white" />
            <Text style={styles.modalText}>{modalMessage}</Text>
            <TouchableOpacity onPress={() => { setModalMessage(''); router.push('/planos_atletas'); }}>
              <Text style={styles.modalButton}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
  
      <View style={styles.planosContainer}>
          {planosDisponiveis.map((plano) => {
              const preco = getPlanoPreco(plano); 

              return (
                  <TouchableOpacity
                      key={plano.id}
                      style={[
                          styles.planoCard,
                          planoSelecionado?.id === (planosIrmaos[quantidadeAtletas]?.[plano.nome] || plano.id) && styles.planoSelecionado
                      ]}
                      onPress={() => handleSelecionarPlano(plano)}
                  >
                      <Text style={[
                          styles.planoText,
                          planoSelecionado?.id === (planosIrmaos[quantidadeAtletas]?.[plano.nome] || plano.id) && styles.planoTextSelecionado
                      ]}>
                          {plano.nome} - R$ {preco},00
                      </Text>
                  </TouchableOpacity>
              );
          })}
      </View>
  
        <TextInput
          style={styles.input}
          placeholder="Digite o dia da cobrança"
          keyboardType="numeric"
          maxLength={2}
          value={diaCobranca}
          onChangeText={setDiaCobranca}
        />
  
        <TouchableOpacity style={styles.salvarButton} onPress={handleSalvarPlano} disabled={loading}>
            {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
            <Text style={styles.salvarButtonText}>Salvar Plano</Text>
            )}
        </TouchableOpacity>
        {mensagemPlano !== '' && (
            <Text style={styles.mensagemPlano}>{mensagemPlano}</Text>
        )}
      </SafeAreaView>
    );
  };
  
  export default EscolherPlano;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  mensagemPlano: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#126046',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  planosContainer: {
    width: '100%',
    marginBottom: 20,
  },
  planoCard: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planoSelecionado: {
    backgroundColor: '#126046',
  },
  planoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  planoTextSelecionado: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
    textAlign: 'center',
  },
  salvarButton: {
    backgroundColor: '#126046',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  salvarButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#126046',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    color: '#126046',
    fontWeight: 'bold',
    textAlign: 'center',
  }
});

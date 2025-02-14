import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Modal, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { getAllAlunos, updateStatusPagamento2 } from '@/lib/appwrite';
import { format } from 'date-fns';

const PagamentosAtuais = () => {
  const [alunos, setAlunos] = useState([]);
  const [filteredAlunos, setFilteredAlunos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Contadores das categorias
  const [counts, setCounts] = useState({
    pix: 0,
    dinheiro: 0,
    cartao: 0,
    pendente: 0,
  });

  useEffect(() => {
    const fetchFinanceiro = async () => {
      try {
        setLoading(true);

        const allAlunos = await getAllAlunos();

        const alunosComFaturas = allAlunos.map((aluno) => {
          let plano;
          switch (aluno.status_pagamento) {
            case '2c93808493b072d70193d233e9eb0b23':
              plano = 'Plano Semestral';
              break;
            case '2c93808493b073170193d2317ddb0ac2':
              plano = 'Plano Mensal';
              break;
            case '2c93808493b072d80193d234fe0e0b24':
              plano = 'Plano Anual';
              break;
            default:
              plano = aluno.status_pagamento;
          }

          // Formatar a data de vencimento
          const formattedEndDate = aluno.end_date
            ? format(new Date(aluno.end_date), 'dd/MM/yyyy')
            : 'N/A';

          return {
            ...aluno,
            plano,
            formattedEndDate,
          };
        });

        setAlunos(alunosComFaturas);
        setFilteredAlunos(alunosComFaturas); // Exibe todos inicialmente

        // Contar as categorias
        const pixCount = alunosComFaturas.filter(
          (aluno) => aluno.plano && aluno.plano.toLowerCase().includes('pix')
        ).length;
        const dinheiroCount = alunosComFaturas.filter(
          (aluno) => aluno.plano && aluno.plano.toLowerCase().includes('dinheiro')
        ).length;
        const cartaoCount = alunosComFaturas.filter(
          (aluno) =>
            aluno.plano === 'Plano Mensal' ||
            aluno.plano === 'Plano Semestral' ||
            aluno.plano === 'Plano Anual'
        ).length;
        const pendenteCount = alunosComFaturas.filter(
          (aluno) => !aluno.plano || aluno.plano.trim() === ''
        ).length;

        setCounts({
          pix: pixCount,
          dinheiro: dinheiroCount,
          cartao: cartaoCount,
          pendente: pendenteCount,
        });
      } catch (error) {
        setErrorMessage(`Não foi possível carregar os dados financeiros.`);
        setShowErrorModal(true);
      } finally {
        setLoading(false);
      }
    };

    fetchFinanceiro();
  }, []);

  const handleFilter = (filter) => {
    setSelectedFilter(filter);

    let filtered;

    if (filter === 'Pix') {
      filtered = alunos.filter(
        (aluno) => aluno.plano && aluno.plano.toLowerCase().includes('pix')
      );
    } else if (filter === 'Dinheiro') {
      filtered = alunos.filter(
        (aluno) => aluno.plano && aluno.plano.toLowerCase().includes('dinheiro')
      );
    } else if (filter === 'Cartão de Crédito') {
      filtered = alunos.filter(
        (aluno) =>
          aluno.plano === 'Plano Mensal' ||
          aluno.plano === 'Plano Semestral' ||
          aluno.plano === 'Plano Anual'
      );
    } else if (filter === 'Pendentes') {
      filtered = alunos.filter(
        (aluno) =>
          !(
            (aluno.plano && aluno.plano.toLowerCase().includes('pix')) ||
            (aluno.plano && aluno.plano.toLowerCase().includes('dinheiro')) ||
            aluno.plano === 'Plano Mensal' ||
            aluno.plano === 'Plano Semestral' ||
            aluno.plano === 'Plano Anual'
          )
      );
    }

    setFilteredAlunos(filtered);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = alunos.filter((aluno) =>
      aluno.nome.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredAlunos(filtered);
  };

  const togglePagamentoStatus = async (alunoId, statusAtual) => {
    
    try {
      if (!statusAtual) throw new Error('Status do pagamento inválido.');
  
      const novoStatus = statusAtual.includes('Pendente')
        ? statusAtual.replace('Pendente', 'Pago')
        : statusAtual.replace('Pago', 'Pendente');
      
      // Atualizar o status no banco de dados
      await updateStatusPagamento2(alunoId, novoStatus);
  
      // Atualizar o estado local
      const updatedAlunos = alunos.map((aluno) =>
        aluno.userId === alunoId ? { ...aluno, status_pagamento: novoStatus } : aluno
      );
  
      setAlunos(updatedAlunos);
      setFilteredAlunos(updatedAlunos);
    } catch (error) {
      console.error('Erro ao atualizar o status:', error);  // Ajuda na depuração
      setErrorMessage(error.message || 'Erro ao atualizar o status do pagamento.');
      setShowErrorModal(true);
    }
  };

  

  const renderAluno = ({ item }) => (
    <View style={styles.userCard}>
      <Text style={styles.userName}>Nome do Atleta: {item.nome}</Text>
      <Text style={styles.userInfo}>Data de Vencimento: {item.formattedEndDate}</Text>
      <Text style={styles.userInfo}>Status do Pagamento: {item.status_pagamento}</Text>
  
      {item.plano && item.plano.toLowerCase().includes('dinheiro') && item.status_pagamento && (
        item.status_pagamento.includes('Pendente') || item.status_pagamento.includes('Pago') ? (
          <TouchableOpacity
            style={[
              styles.paymentButton,
              { backgroundColor: item.status_pagamento.includes('Pendente') ? '#126046' : '#FFC107' }
            ]}
            onPress={() => togglePagamentoStatus(item.userId, item.status_pagamento)}
          >
            <Text style={styles.paymentButtonText}>
              {item.status_pagamento.includes('Pendente') ? 'Confirmar Pagamento' : 'Marcar como Pendente'}
            </Text>
          </TouchableOpacity>
        ) : null
      )}
    </View>
  ); 
  
  

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerText}>Controle de Faturamento</Text>

      <TextInput
        style={styles.searchBar}
        placeholder="Buscar por nome do atleta"
        value={searchQuery}
        onChangeText={handleSearch}
      />

      <View style={styles.filterContainer}>
        {[
          { filter: 'Pix', icon: 'qrcode', label: 'Pix', count: counts.pix },
          { filter: 'Dinheiro', icon: 'money-bill-wave', label: 'Dinheiro', count: counts.dinheiro },
          { filter: 'Cartão de Crédito', icon: 'credit-card', label: 'Cartão de Crédito', count: counts.cartao },
          { filter: 'Pendentes', icon: 'exclamation-circle', label: 'Pendentes', count: counts.pendente },
        ].map(({ filter, icon, label, count }) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterCard, selectedFilter === filter && styles.selectedCard]}
            onPress={() => handleFilter(filter)}
          >
            <Icon name={icon} size={24} color="#126046" />
            <Text style={styles.filterCount}>{count}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedFilter && (
        <Text style={[styles.filterHeader, { textAlign: 'center' }]}>{selectedFilter}</Text>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#126046" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredAlunos}
          renderItem={renderAluno}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={styles.userList}
          ListEmptyComponent={() => (
            <Text style={styles.emptyText}>
              {selectedFilter || searchQuery
                ? `Nenhum aluno encontrado para a pesquisa ou filtro.`
                : 'Selecione um filtro para exibir os dados.'}
            </Text>
          )}
        />
      )}

      <Modal
        visible={showErrorModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.errorModal}>
            <Text style={styles.modalMessage}>{errorMessage}</Text>
            <TouchableOpacity onPress={() => setShowErrorModal(false)}>
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PagamentosAtuais;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
  },
  paymentButton: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  paymentButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#126046',
    marginVertical: 16,
  },
  searchBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  filterCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#126046',
  },
  filterCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#126046',
    marginTop: 4,
  },
  filterHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
    textAlign: 'center', // Garante que o texto ficará centralizado
  },
  userList: {
    paddingBottom: 16,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  userInfo: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  loader: {
    marginTop: 50,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  errorModal: {
    backgroundColor: 'red',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  modalMessage: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
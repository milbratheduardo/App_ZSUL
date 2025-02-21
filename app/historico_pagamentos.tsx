import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Modal, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { getAllAlunos, getAllHistoricoPagamentos} from '@/lib/appwrite';
import { format } from 'date-fns';

const HistoricoPagamentos = () => {
    const [historico, setHistorico] = useState([]);
    const [filteredHistorico, setFilteredHistorico] = useState([]);
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
      const fetchHistorico = async () => {
        try {
          setLoading(true);
    
          const allHistorico = await getAllHistoricoPagamentos();
    
          // Ordenar pelo $createdAt (mais novo primeiro)
          const historicoOrdenado = allHistorico.sort(
            (a, b) => new Date(b.$createdAt) - new Date(a.$createdAt)
          );
    
          const historicoFormatado = historicoOrdenado.map((pagamento) => {
            // Formatar o campo `end_date`
            const formattedEndDate = pagamento.end_date
              ? format(new Date(pagamento.end_date), 'dd/MM/yyyy')
              : 'N/A';
    
            return {
              ...pagamento,
              formattedEndDate,
            };
          });
    
          setHistorico(historicoFormatado);
          setFilteredHistorico(historicoFormatado); // Exibe todos inicialmente
    
          // Contar as categorias
          const pixCount = historicoFormatado.filter(
            (pagamento) =>
              pagamento.status_pagamento &&
              pagamento.status_pagamento.toLowerCase().includes('pix')
          ).length;
          const dinheiroCount = historicoFormatado.filter(
            (pagamento) =>
              pagamento.status_pagamento &&
              pagamento.status_pagamento.toLowerCase().includes('dinheiro')
          ).length;
          const cartaoCount = historicoFormatado.filter(
            (pagamento) =>
              pagamento.status_pagamento === "2c93808493b073170193d2317ddb0ac2" ||
              pagamento.status_pagamento === "2c93808493b072d70193d233e9eb0b23" ||
              pagamento.status_pagamento === "2c93808493b072d80193d234fe0e0b24" ||
              pagamento.status_pagamento === "2c9380849469a4a101946ae6d35700aa" ||
              pagamento.status_pagamento === "2c9380849469a43201946ae4a44100a4" ||
              pagamento.status_pagamento === "2c9380849469a43201946add8ee300a0"
          ).length;
          const pendenteCount = historicoFormatado.filter(
            (pagamento) =>
              !pagamento.status_pagamento || pagamento.status_pagamento.trim() === ''
          ).length;
    
          setCounts({
            pix: pixCount,
            dinheiro: dinheiroCount,
            cartao: cartaoCount,
            pendente: pendenteCount,
          });
        } catch (error) {
          setErrorMessage(`Não foi possível carregar o histórico de pagamentos.`);
          setShowErrorModal(true);
        } finally {
          setLoading(false);
        }
      };
    
      fetchHistorico();
    }, []);
    
  
    const handleFilter = (filter) => {
      setSelectedFilter(filter);
    
      let filtered;
    
      if (filter === 'Pix') {
        filtered = historico.filter(
          (pagamento) =>
            pagamento.status_pagamento &&
            pagamento.status_pagamento.toLowerCase().includes('pix')
        );
      } else if (filter === 'Dinheiro') {
        filtered = historico.filter(
          (pagamento) =>
            pagamento.status_pagamento &&
            pagamento.status_pagamento.toLowerCase().includes('dinheiro')
        );
      } else if (filter === 'Cartão de Crédito') {
        filtered = historico.filter(
          (pagamento) =>
            pagamento.status_pagamento === "2c93808493b073170193d2317ddb0ac2" ||
            pagamento.status_pagamento === "2c93808493b072d70193d233e9eb0b23" ||
            pagamento.status_pagamento === "2c93808493b072d80193d234fe0e0b24" ||
            pagamento.status_pagamento === "2c9380849469a4a101946ae6d35700aa" ||
            pagamento.status_pagamento === "2c9380849469a43201946ae4a44100a4" ||
            pagamento.status_pagamento === "2c9380849469a43201946add8ee300a0"
        );
      } else if (filter === 'Pendente') {
        filtered = historico.filter(
          (pagamento) => !pagamento.status_pagamento || pagamento.status_pagamento.trim() === ''
        );
      }
    
      setFilteredHistorico(filtered);
    };
    
  
    const handleSearch = (text) => {
      setSearchQuery(text);
      const filtered = historico.filter((pagamento) =>
        pagamento.nome.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredHistorico(filtered);
    };

    const getPlanoNome = (status_pagamento) => {
      const planos = {
        "2c93808493b073170193d2317ddb0ac2": "Plano Mensal - Pago",
        "2c93808493b072d70193d233e9eb0b23": "Plano Semestral - Pago",
        "2c93808493b072d80193d234fe0e0b24": "Plano Anual - Pago",
        "2c9380849469a4a101946ae6d35700aa": "Plano Irmãos Mensal - Pago",
        "2c9380849469a43201946ae4a44100a4": "Plano Irmãos Semestral - Pago",
        "2c9380849469a43201946add8ee300a0": "Plano Irmãos Anual - Pago"
      };
    
      return planos[status_pagamento] || status_pagamento; // Se não estiver no mapeamento, mantém o valor original
    };
  
    const renderPagamento = ({ item }) => (
      <View style={styles.userCard}>
        <Text style={styles.userName}>Nome do Atleta: {item.nome}</Text>

        <Text style={styles.userInfo}>
          Data do Pagamento: 
          {(!item.status_pagamento || item.status_pagamento === "" || item.status_pagamento.includes("Pendente")) 
            ? " Pendente" 
            : new Date(item.$createdAt).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
        </Text>

        <Text style={styles.userInfo}>Próxima Fatura: {item.formattedEndDate}</Text>

        <Text style={styles.userInfo}>
          Detalhes do Pagamento: {item.status_pagamento ? getPlanoNome(item.status_pagamento) : "Pendente"}
        </Text>
      </View>
    );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerText}>Histórico de Pagamentos</Text>

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
          data={filteredHistorico}
          renderItem={renderPagamento}
          keyExtractor={(item, index) => `${item.$id}-${index}`}
          contentContainerStyle={styles.userList}
          ListEmptyComponent={() => (
            <Text style={styles.emptyText}>
              {selectedFilter || searchQuery
                ? `Nenhum pagamento encontrado para a pesquisa ou filtro.`
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

export default HistoricoPagamentos;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
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
  filterText: {
    fontSize: 14,
    marginTop: 8,
    color: '#333',
  },
  filterCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#126046',
    marginTop: 4,
  },
  userList: {
    paddingBottom: 16,
  },
  filterHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
    textAlign: 'center', // Garante que o texto ficará centralizado
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

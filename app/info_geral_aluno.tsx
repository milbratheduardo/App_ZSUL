import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Modal, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getAlunosById } from '../lib/appwrite'; // Altere para o caminho correto

const InfoGeralAluno = () => {
  const { alunoId } = useLocalSearchParams();
  const [aluno, setAluno] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    fetchAluno();
  }, [alunoId]);

  const fetchAluno = async () => {
    try {
      const alunoData = await getAlunosById(alunoId);
      setAluno(alunoData);
    } catch (error) {
      setErrorMessage('Erro ao buscar informações do aluno.');
      setShowErrorModal(true);
    }
  };

  const renderAlunoDetails = (aluno) => (
    <View style={styles.detailsContainer}>
      <Text style={styles.detailsTitle}>Detalhes do Aluno</Text>
      <ScrollView style={styles.infoContainer} contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Nome</Text>
          <Text style={styles.value}>{aluno.nome}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.label}>CPF</Text>
          <Text style={styles.value}>{aluno.cpf}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.label}>WhatsApp</Text>
          <Text style={styles.value}>{aluno.whatsapp}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Posição</Text>
          <Text style={styles.value}>{aluno.posicao}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Pé Dominante</Text>
          <Text style={styles.value}>{aluno.peDominante}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Altura</Text>
          <Text style={styles.value}>{aluno.altura} cm</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Peso</Text>
          <Text style={styles.value}>{aluno.peso} kg</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Objetivo</Text>
          <Text style={styles.value}>{aluno.objetivo}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Data de Nascimento</Text>
          <Text style={styles.value}>{aluno.birthDate}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Alergias</Text>
          <Text style={styles.value}>{aluno.alergias || 'Nenhuma'}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Condições Médicas</Text>
          <Text style={styles.value}>{aluno.condicoesMedicas || 'Nenhuma'}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Lesões Anteriores</Text>
          <Text style={styles.value}>{aluno.lesoesAnteriores || 'Nenhuma'}</Text>
        </View>
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.screenContent}>
        <Text style={styles.pageTitle}>Informações do Aluno</Text>
        {aluno ? renderAlunoDetails(aluno) : <Text>Carregando...</Text>}
      </ScrollView>

      <Modal
        visible={showErrorModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Erro</Text>
            <Text style={styles.modalMessage}>{errorMessage}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowErrorModal(false)}>
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default InfoGeralAluno;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FA',
  },
  screenContent: {
    padding: 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#126046',
    marginTop: 20,
  },
  detailsContainer: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#126046',
    marginBottom: 10,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  value: {
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'red',
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
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  modalMessage: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'red',
    fontWeight: 'bold',
  },
});

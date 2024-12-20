import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getAlunosById, updateAlunoStats } from '@/lib/appwrite';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const EditarAluno = () => {
  const { alunoId } = useLocalSearchParams();
  const router = useRouter();

  const [aluno, setAluno] = useState(null);
  const [pique, setPique] = useState('');
  const [forca, setForca] = useState('');
  const [passe, setPasse] = useState('');
  const [geral, setGeral] = useState('');
  const [finalizacao, setFinalizacao] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); 
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchAluno();
  }, [alunoId]);

  const fetchAluno = async () => {
    try {
      const alunoData = await getAlunosById(alunoId);
      setAluno(alunoData);
      setPique(alunoData.pique || '');
      setForca(alunoData.forca || '');
      setPasse(alunoData.passe || '');
      setGeral(alunoData.geral || '');
      setFinalizacao(alunoData.finalizacao || '');
    } catch (error) {
      setErrorMessage(`Não ao buscar o alunos.`);
      setShowErrorModal(true);
    }
  };

  const handleSave = async () => {
    try {
      const updatedData = {
        pique,
        forca,
        passe,
        finalizacao,
        geral
      };
  
      await updateAlunoStats(alunoId, updatedData);
  
      Alert.alert('Sucesso', 'Atributos atualizados com sucesso!', [
        { text: 'OK', onPress: () => router.push(`/detalhesAluno?alunoId=${alunoId}`) },
      ]);
    } catch (error) {
      setErrorMessage(`Não foi possível atualizar os atributos.`);
      setShowErrorModal(true);
    }
  };

  if (!aluno) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Atributos</Text>
      <TextInput
        style={styles.input}
        value={pique}
        onChangeText={setPique}
        placeholder="Pique"
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        value={forca}
        onChangeText={setForca}
        placeholder="Força"
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        value={passe}
        onChangeText={setPasse}
        placeholder="Passe"
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        value={finalizacao}
        onChangeText={setFinalizacao}
        placeholder="Finalização"
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        value={geral}
        onChangeText={setGeral}
        placeholder="Overall"
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Salvar</Text>
      </TouchableOpacity>
             <Modal
                visible={showErrorModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowErrorModal(false)}
              >
                <View style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}>
                  <View style={{
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
                  }}>
                    <MaterialCommunityIcons name="alert-circle" size={48} color="white" />
                    <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginVertical: 10 }}>
                      Erro
                    </Text>
                    <Text style={{ color: 'white', textAlign: 'center', marginBottom: 20 }}>
                      {errorMessage}
                    </Text>
                    <TouchableOpacity
                      style={{
                        backgroundColor: 'white',
                        paddingHorizontal: 20,
                        paddingVertical: 10,
                        borderRadius: 5,
                      }}
                      onPress={() => setShowErrorModal(false)}
                    >
                      <Text style={{ color: 'red', fontWeight: 'bold' }}>Fechar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
    </View>
  );
};

export default EditarAluno;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  saveButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#004225',
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

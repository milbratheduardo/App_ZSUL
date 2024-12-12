import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getAlunosById, updateAlunoStats } from '@/lib/appwrite';

const EditarAluno = () => {
  const { alunoId } = useLocalSearchParams();
  const router = useRouter();

  const [aluno, setAluno] = useState(null);
  const [pique, setPique] = useState('');
  const [forca, setForca] = useState('');
  const [passe, setPasse] = useState('');
  const [geral, setGeral] = useState('');
  const [finalizacao, setFinalizacao] = useState('');

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
      console.error('Erro ao buscar aluno:', error.message);
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
      Alert.alert('Erro', 'Não foi possível atualizar os atributos. Tente novamente.');
      console.error('Erro ao atualizar atributos:', error.message);
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

import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Modal, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalContext } from '@/context/GlobalProvider';
import Icon from 'react-native-vector-icons/FontAwesome';
import emailjs from 'emailjs-com';

const InformacoesPessoais = () => {
  const { user } = useGlobalContext();
  const firstName = user?.nome?.split(' ')[0] || 'Usuário';
  const profileImageUrl = user?.profileImageUrl || 'https://example.com/default-profile.png';

  const userInfoArray = user.role === 'responsavel' 
  ? [
    { label: 'CPF', value: user.cpf, icon: 'id-card' },
    { label: 'Email', value: user.email, icon: 'envelope' },
    { label: 'WhatsApp', value: user.whatsapp, icon: 'whatsapp' },
  ]
  :[
    { label: 'CPF', value: user.cpf, icon: 'id-card' },
    { label: 'Email', value: user.email, icon: 'envelope' },
    { label: 'Modalidade', value: user.modalidade, icon: 'futbol-o' },
    { label: 'Faixa Etária de Atuação', value: user.faixa_etaria, icon: 'group' },
    { label: 'Profissão', value: user.profissao, icon: 'briefcase' },
    { label: 'WhatsApp', value: user.whats, icon: 'whatsapp' },

  ];

  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportText, setReportText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleReportSubmit = () => {
    const templateParams = {
      assunto: selectedCategory,
      descricao: reportText,
      nome: user.nome,
      role: user.role,
    };

    emailjs.send('service_gciw5lm', 'template_le4ktiu', templateParams, 'ypSN4onrJ_W04LRlr')
      .then((response) => {
        console.log('Email enviado com sucesso!', response.status, response.text);
        setSelectedCategory('');
        setReportText('');
        setReportModalVisible(false);
      })
      .catch((error) => {
        console.error('Erro ao enviar o email:', error);
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.profileDetails}>
            <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
            <View style={styles.headerText}>
              <Text style={styles.greeting}>Olá, {firstName}</Text>
              <Text style={styles.userInfo}>{user?.nome || 'Usuário'}</Text>
              <Text style={styles.userInfo}>Informações Pessoais</Text>
            </View>
          </View>
          <Icon name="shield" size={50} color="#126046" style={styles.teamLogo} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.infoContainer}>
  {userInfoArray.map((item, index) => (
    <View key={index} style={styles.infoCard}>
      <Icon name={item.icon} size={24} color="#126046" style={styles.icon} />
      <View style={styles.textContainer}>
        <Text style={styles.label}>{item.label}</Text>
        <Text style={styles.value}>
          {item.value === user.faixa_etaria ? `${item.value} anos` : item.value}
        </Text>
      </View>
    </View>
  ))}
</ScrollView>

      {/* Botão para Suporte */}
      <TouchableOpacity style={styles.reportButton} onPress={() => setReportModalVisible(true)}>
        <Text style={styles.reportButtonText}>Suporte</Text>
      </TouchableOpacity>

      {/* Modal de Relato de Problema */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={reportModalVisible}
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Solicitação de Suporte</Text>

            <Text style={styles.label}>Escolha um assunto</Text>
            <View style={styles.pickerContainer}>
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  selectedCategory === 'Erro de Sistema' && styles.selectedCategoryButton
                ]}
                onPress={() => setSelectedCategory('Erro de Sistema')}
              >
                <Text style={selectedCategory === 'Erro de Sistema' ? styles.selectedText : styles.categoryText}>Erro de Sistema</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  selectedCategory === 'Dúvida' && styles.selectedCategoryButton
                ]}
                onPress={() => setSelectedCategory('Dúvida')}
              >
                <Text style={selectedCategory === 'Dúvida' ? styles.selectedText : styles.categoryText}>Dúvida</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  selectedCategory === 'Sugestão' && styles.selectedCategoryButton
                ]}
                onPress={() => setSelectedCategory('Sugestão')}
              >
                <Text style={selectedCategory === 'Sugestão' ? styles.selectedText : styles.categoryText}>Sugestão</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.textInput, { height: 100 }]}
              placeholder="Descreva o problema..."
              multiline
              value={reportText}
              onChangeText={setReportText}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setReportModalVisible(false)}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleReportSubmit}>
                <Text style={styles.buttonText}>Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default InformacoesPessoais;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#126046',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  headerText: {
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userInfo: {
    fontSize: 14,
    color: '#D1FAE5',
    marginTop: 4,
  },
  teamLogo: {
    marginLeft: 16,
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  reportButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#FF6347',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    elevation: 5,
  },
  reportButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  selectedCategoryButton: {
    backgroundColor: '#126046', // Verde escuro igual ao botão Enviar
  },  
  categoryButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#E8E8E8',
    marginHorizontal: 5,
    alignItems: 'center',
  },
  categoryText: {
    color: '#333',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '700',
  },
  textInput: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#F9FAFB',
    color: '#333',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#CCCCCC',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: '#126046',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

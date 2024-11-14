import { View, Text, ScrollView, Alert, TouchableOpacity, Button, Modal, Switch, ActivityIndicator, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import FormField from '@/components/FormField';
import CustomButton from '@/components/CustomButton';
import { router } from 'expo-router';
import { createUserProfessor, createUserResponsavel, createUserAtleta} from '../../lib/appwrite';
import { useGlobalContext } from "../../context/GlobalProvider";
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { images } from '../../constants';
import DatePicker from 'react-native-date-picker';
import { TextInputMask } from 'react-native-masked-text';
import { getPdfUrl } from "@/lib/appwrite";
import * as Linking from 'expo-linking';
import { useLocalSearchParams } from 'expo-router'; // Para pegar a data passada como parâmetro


const SignUp = () => {
  const { setUser, setIsLoggedIn } = useGlobalContext();

  const { role } = useLocalSearchParams();
  const [form, setForm] = useState({
    username: '',
    cpf: '',
    rg: '',
    email: '',
    password: '',
    confirmPassword: '',
    endereco: '',
    bairro: '',
    whatsapp: '',
    contatoalternativo: '',  //Novo campo adicionado para contato alternativo
    birthDate: '', // Data de nascimento
    horarios: [], // Horários de trabalho
    faixa_etaria: '', // Faixa etária de trabalho
    modalidades: '', // Modalidade esportiva
    profession: '', // Profissão
    parentesco: '' // Parentesco, no caso de responsável
  });

  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const minAge = 7;
  const [maxAge, setMaxAge] = useState(65);
  const [currentDay, setCurrentDay] = useState('');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [startTime, setStartTime] = useState(new Date(2024, 1, 1, 15, 0));
  const [endTime, setEndTime] = useState(new Date(2024, 1, 1, 17, 0));
  const [loadingIconIndex, setLoadingIconIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false); // Aceitação dos termos de compromisso

  useEffect(() => {
    let iconInterval;
    if (isSubmitting) {
      iconInterval = setInterval(() => {
        setLoadingIconIndex((prevIndex) => (prevIndex + 1) % loadingIcons.length);
      }, 300);
    }
    return () => clearInterval(iconInterval);
  }, [isSubmitting]);

  const loadingIcons = [
    <FontAwesome name="soccer-ball-o" size={48} color="#126046" />,
    <MaterialCommunityIcons name="tshirt-crew" size={48} color="#126046" />,
    <MaterialCommunityIcons name="soccer-field" size={48} color="#126046" />
  ];

  const handleAgeChange = (value) => {
    setMaxAge(Math.floor(value));
    setForm({ ...form, faixa_etaria: `${minAge}-${Math.floor(value)}` });
  };

  const handleAddHorario = () => {
    if (currentDay && startTime && endTime) {
      const newHorario = {
        dia: currentDay,
        start: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        end: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setForm({ ...form, horarios: [...form.horarios, newHorario] });
    }
  };

  const submitProfessor = async () => {
    if (
      form.username === '' ||
      form.cpf === '' ||
      form.email === '' ||
      form.password === '' ||
      form.whatsapp === '' ||
      form.profession === '' ||
      form.modalidades === '' ||
      form.faixa_etaria === ''
    ) {
      setErrorMessage('Por favor, preencha todos os campos');
      setShowErrorModal(true);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setErrorMessage('As senhas não coincidem');
      setShowErrorModal(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createUserProfessor(
        form.email,
        form.password,
        form.username,
        form.cpf,
        form.whatsapp,
        form.profession,
        form.modalidades,
        form.faixa_etaria,
        form.horarios
      );

      setUser(result);
      setIsLoggedIn(true);

      router.replace('/signin');
    } catch (error) {
      setErrorMessage(error.message);
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };


const submitAtleta = async () => {
    if (
      form.username === '' ||
      form.cpf === '' ||
      form.rg === '' ||
      form.birthDate === '' ||
      form.endereco === '' ||
      form.posicao === '' ||
      form.peDominante === '' ||
      form.altura === '' ||
      form.peso === '' ||
      form.objetivo === '' ||
      form.alergias === '' ||
      form.condicoesMedicas === '' ||
      form.lesoesAnteriores === '' ||
      form.nomeResponsavel === '' ||
      form.primeiraEscola === '' ||
      form.anoEscolar === '' ||
      form.whatsapp === '' ||
      form.password === '' ||
      form.confirmPassword === ''
    ) {
      setErrorMessage('Por favor, preencha todos os campos');
      setShowErrorModal(true);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setErrorMessage('As senhas não coincidem');
      setShowErrorModal(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createUserAtleta(
        form.email,
        form.password,
        form.username,
        form.cpf,
        form.whatsapp,
        form.rg,                // RG
        form.endereco,          // Endereço
        form.nomeResponsavel,    // Nome do responsável
        form.posicao,            // Posição
        form.peDominante,        // Pé Dominante
        form.altura,             // Altura
        form.peso,               // Peso
        form.objetivo,           // Objetivo
        form.birthDate,          // Data de Nascimento
        form.alergias,           // Alergias ou Restrições
        form.condicoesMedicas,   // Condições Médicas
        form.lesoesAnteriores,   // Lesões Anteriores
        form.primeiraEscola,     // Primeira Escola de Futebol (Sim/Não)
        form.anoEscolar          // Ano Escolar
      );
      setUser(result);
      setIsLoggedIn(true);

      router.replace('/signin');
    } catch (error) {
      setErrorMessage(error.message);
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenTerms = async () => {
    try {
      const pdfUrl = await getPdfUrl("671ab31a002242cb4a49");
      Linking.openURL(pdfUrl);
      if (!pdfUrl) {
        Alert.alert('Erro', 'Não foi possível carregar o contrato.');
        return;
      }
    } catch (error) {
      console.error("Erro ao abrir os termos de compromisso", error);
    }
  };

  const commonInputStyle = {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    marginBottom: 20,
  };

  const submitResponsavel = async () => {
    if (
      form.username === '' ||
      form.cpf === '' ||
      form.rg === '' ||
      form.email === '' ||
      form.password === '' ||
      form.endereco === '' ||
      form.bairro === '' ||
      form.whatsapp === '' 
    ) {
      setErrorMessage('Por favor, preencha todos os campos');
      setShowErrorModal(true);
      return;
    }

    if (!isAccepted) {
      setErrorMessage('Você precisa aceitar os termos de compromisso antes de continuar.');
      setShowErrorModal(true);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setErrorMessage('As senhas não coincidem');
      setShowErrorModal(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createUserResponsavel(
        form.email,
        form.password,
        form.username,
        form.cpf,
        form.endereco,
        form.bairro,
        form.rg,
        form.whatsapp,
        form.birthDate,
        form.parentesco,
      );

      setUser(result);
      setIsLoggedIn(true);

      router.replace('/signin');
    } catch (error) {
      setErrorMessage(error.message);
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = () => {
    if (role === 'professor') {
      submitProfessor();
    } else if (role === 'responsavel') {
      submitResponsavel();
    } else if (role === 'atleta'){
      submitAtleta();
    }else{
      setErrorMessage('Por favor, selecione uma opção: Sou Professor ou Sou Responsável');
      setShowErrorModal(true);
    }
  };

  const professions = [
    "Treinador de Futebol", "Preparador Físico", "Fisioterapeuta Esportivo", "Nutricionista Esportivo",
    "Analista de Desempenho", "Psicólogo Esportivo", "Massagista Esportivo", "Coordenador Técnico",
    "Médico Esportivo", "Auxiliar Técnico", "Estagiário", "Preparador de Goleiro"
  ];

  const dias = [
    "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira",
    "Sexta-feira", "Sábado", "Domingo",
  ];

  const modalidades = [
    "Futebol"
  ];

  const parentesco = [
    "Pai", "Mãe", "Tio", "Tia", "Irmão", "Irmã", "Avó", "Avô", "Madrasta", "Padrasto", "Outro",
  ];

  const renderFormFields = () => {
    return (
      <>
        {/* Campos comuns */}
        <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">Nome Completo</Text>
        <FormField 
          title='Nome Completo'
          value={form.username}
          handleChangeText={(e) => setForm({ ...form, username: e })}
        />

        <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">CPF</Text>
        <FormField 
          title='CPF'
          value={form.cpf}
          handleChangeText={(e) => setForm({ ...form, cpf: e })}
          maskType={'cpf'}
        />

        {role === 'responsavel' && (
          <>
            <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">RG</Text>
            <FormField 
              title='RG'
              value={form.rg}
              handleChangeText={(e) => {
                // Remove qualquer caractere que não seja número
                const onlyNumbers = e.replace(/[^0-9]/g, '');
                setForm({ ...form, rg: onlyNumbers });
              }}
              keyboardType="numeric" // Abre o teclado numérico no celular
            />


            <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">Data de Nascimento</Text>
            <View style={commonInputStyle}>
              <TextInputMask
                type={'datetime'}
                options={{ format: 'DD/MM/YYYY' }}
                value={form.birthDate}
                onChangeText={(e) => setForm({ ...form, birthDate: e })}
                placeholder="DD/MM/YYYY"
              />
            </View>

            <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">Endereço</Text>
            <FormField 
              title='Endereço'
              value={form.endereco}
              handleChangeText={(e) => setForm({ ...form, endereco: e })}
            />

            <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">Bairro</Text>
            <FormField 
              title='Bairro'
              value={form.bairro}
              handleChangeText={(e) => setForm({ ...form, bairro: e })}
            />

            <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">Parentesco</Text>
            <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 10, marginBottom: 20 }}>
              <Picker
                selectedValue={form.parentesco}
                onValueChange={(itemValue) => setForm({ ...form, parentesco: itemValue })}
                style={{ height: 50, width: '100%', padding: 10 }}
              >
                <Picker.Item label="Selecione" value="" />
                {parentesco.map((parentesco, index) => (
                  <Picker.Item key={index} label={parentesco} value={parentesco} />
                ))}
              </Picker>
            </View>
          </>
        )}

        {role === 'atleta' && (
          <>
            <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">RG</Text>
            <FormField 
              title='RG'
              value={form.rg}
              handleChangeText={(e) => {
                const onlyNumbers = e.replace(/[^0-9]/g, '');
                setForm({ ...form, rg: onlyNumbers });
              }}
              keyboardType="numeric" // Abre o teclado numérico no celular
            />


            <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">Data de Nascimento</Text>
            <View style={commonInputStyle}>
              <TextInputMask
                type={'datetime'}
                options={{ format: 'DD/MM/YYYY' }}
                value={form.birthDate}
                onChangeText={(e) => setForm({ ...form, birthDate: e })}
                placeholder="DD/MM/YYYY"
              />
            </View>

            <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">Endereço</Text>
            <FormField 
              title='Endereço'
              value={form.endereco}
              handleChangeText={(e) => setForm({ ...form, endereco: e })}
            />

            {/* Informações Esportivas */}
            <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">Posição</Text>
            <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 10, marginBottom: 20 }}>
              <Picker
              selectedValue={form.posicao}
              onValueChange={(itemValue) => setForm({ ...form, posicao: itemValue })}
              style={{ height: 50, width: '100%', padding: 10 }}
              >
                <Picker.Item label="Selecione" value="" />
                <Picker.Item label="Goleiro" value="goleiro" />
                <Picker.Item label="Zagueiro Central" value="zagueiro-central" />
                <Picker.Item label="Lateral Direito" value="lateral-direito" />
                <Picker.Item label="Lateral Esquerdo" value="lateral-esquerdo" />
                <Picker.Item label="Volante" value="volante" />
                <Picker.Item label="Meia Central" value="meia-central" />
                <Picker.Item label="Meia Ofensivo" value="meia-ofensivo" />
                <Picker.Item label="Ponta Direita" value="ponta-direita" />
                <Picker.Item label="Ponta Esquerda" value="ponta-esquerda" />                
                <Picker.Item label="Centroavante" value="centroavante" />
              </Picker>
            </View>

            <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">Pé Dominante</Text>
            <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 10, marginBottom: 20 }}>
              <Picker
                selectedValue={form.peDominante}
                onValueChange={(itemValue) => setForm({ ...form, peDominante: itemValue })}
                style={{ height: 50, width: '100%', padding: 10 }}
              >
                <Picker.Item label="Selecione" value="" />
                <Picker.Item label="Direito" value="direito" />
                <Picker.Item label="Esquerdo" value="esquerdo" />
                <Picker.Item label="Ambidestro" value="ambidestro" />
              </Picker>
            </View>

            <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">Altura (em cm)</Text>
            <FormField 
              title='Altura'
              value={form.altura}
              handleChangeText={(e) => {
                // Remove qualquer caractere que não seja número e limita a 3 dígitos
                const onlyNumbers = e.replace(/[^0-9]/g, '').slice(0, 3);
                setForm({ ...form, altura: onlyNumbers });
              }}
              keyboardType='numeric' // Abre o teclado numérico no celular
            />

            <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">Peso (em kg)</Text>
            <FormField 
              title='Peso'
              value={form.peso}
              handleChangeText={(e) => {
                // Remove qualquer caractere que não seja número e limita a 3 dígitos
                const onlyNumbers = e.replace(/[^0-9]/g, '').slice(0, 3);
                setForm({ ...form, peso: onlyNumbers });
              }}
              keyboardType='numeric' // Abre o teclado numérico no celular
            />


            <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">Objetivo</Text>
            <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 10, marginBottom: 20 }}>
              <Picker
                selectedValue={form.objetivo}
                onValueChange={(itemValue) => setForm({ ...form, objetivo: itemValue })}
                style={{ height: 50, width: '100%', padding: 10 }}
              >
                <Picker.Item label="Nenhum" value="Nenhum" />
                <Picker.Item label="Desenvolvimento Pessoal" value="desenvolvimento-pessoal" />
                <Picker.Item label="Competir em Campeonatos Locais" value="campeonatos-locais" />
                <Picker.Item label="Tornar-se Jogador Profissional" value="jogador-profissional" />
                <Picker.Item label="Melhorar Condicionamento Físico" value="condicionamento-fisico" />
                <Picker.Item label="Aprimorar Habilidades Técnicas" value="habilidades-tecnicas" />
                <Picker.Item label="Socializar e Fazer Amigos" value="socializar" />
                <Picker.Item label="Ganhar Bolsa Esportiva" value="bolsa-esportiva" />
                <Picker.Item label="Aprimorar Consciência Tática" value="consciencia-tatica" />
              </Picker>
            </View>


            {/* Informações de Saúde */}
            <Text className="text-black-900 text-lg font-bold mb-4 mt-6">Informações de Saúde</Text>

            <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">Alergias ou Restrições</Text>
            <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 10, marginBottom: 20 }}>  
              <Picker
                selectedValue={form.alergias}
                onValueChange={(itemValue) => setForm({ ...form, alergias: itemValue })}
                style={{ height: 50, width: '100%', padding: 10 }}
              >
                <Picker.Item label="Nenhuma" value="Nenhuma" />
                <Picker.Item label="Glúten" value="gluten" />
                <Picker.Item label="Lactose" value="lactose" />
                <Picker.Item label="Amendoim" value="amendoim" />
                <Picker.Item label="Frutos do Mar" value="frutos_do_mar" />
                <Picker.Item label="Ovos" value="ovos" />
                <Picker.Item label="Nozes" value="nozes" />
                <Picker.Item label="Pólen" value="polen" />
                <Picker.Item label="Soja" value="soja" />
                <Picker.Item label="Medicamentos" value="medicamentos" />
                <Picker.Item label="Picadas de insetos" value="picadas_insetos" />
                <Picker.Item label="Vegetariano" value="vegetariano" />
                <Picker.Item label="Vegano" value="vegano" />
                <Picker.Item label="Baixo teor de sódio" value="baixo_sodio" />
                <Picker.Item label="Sem açúcar" value="sem_acucar" />
                <Picker.Item label="Sem carne vermelha" value="sem_carne_vermelha" />
                <Picker.Item label="Dieta cetogênica" value="cetogenica" />
                <Picker.Item label="Dieta baixa em carboidratos" value="baixo_carboidrato" />
              </Picker>
            </View>

            <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">Condições Médicas</Text>
            <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 10, marginBottom: 20 }}>
              <Picker
                selectedValue={form.condicoesMedicas}
                onValueChange={(itemValue) => setForm({ ...form, condicoesMedicas: itemValue })}
                style={{ height: 50, width: '100%', padding: 10 }}
              >
                <Picker.Item label="Nenhuma" value="nenhuma" />
                <Picker.Item label="Asma" value="asma" />
                <Picker.Item label="Diabetes" value="diabetes" />
                <Picker.Item label="Hipertensão" value="hipertensao" />
                <Picker.Item label="Problemas Cardíacos" value="problemas-cardiacos" />
                <Picker.Item label="Alergias Severas" value="alergias-severas" />
                <Picker.Item label="Deficiência Visual" value="deficiencia-visual" />
                <Picker.Item label="Deficiência Auditiva" value="deficiencia-auditiva" />
                <Picker.Item label="Distúrbios Musculoesqueléticos" value="disturbios-musculoesqueleticos" />
                <Picker.Item label="Autista" value="Autista" />
              </Picker>
            </View>

            <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">Lesões Anteriores</Text>
            <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 10, marginBottom: 20 }}>
              <Picker
                selectedValue={form.lesoesAnteriores}
                onValueChange={(itemValue) => setForm({ ...form, lesoesAnteriores: itemValue })}
                style={{ height: 50, width: '100%', padding: 10 }}
              >
                <Picker.Item label="Nenhuma" value="nenhuma" />
                <Picker.Item label="Entorse de Tornozelo" value="entorse-tornozelo" />
                <Picker.Item label="Ruptura de Ligamento (Joelho)" value="ruptura-ligamento-joelho" />
                <Picker.Item label="Fratura Óssea" value="fratura-ossea" />
                <Picker.Item label="Lesão Muscular" value="lesao-muscular" />
                <Picker.Item label="Hérnia de Disco" value="hernia-de-disco" />
                <Picker.Item label="Tendinite" value="tendinite" />
                <Picker.Item label="Lesão no Menisco" value="lesao-menisco" />
                <Picker.Item label="Concussão (Traumatismo Craniano)" value="concussao" />
                <Picker.Item label="Luxação" value="luxacao" />
                <Picker.Item label="Distensão Muscular" value="distensao-muscular" />
                <Picker.Item label="Pubalgia" value="pubalgia" />
              </Picker>
            </View>


            {/* Informações Educacionais e Familiares */}
            <Text className="text-black-900 text-lg font-bold mb-4 mt-6">Informações Educacionais e Familiares</Text>

            <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">CPF do Responsável</Text>
            <FormField 
              title='Nome do Responsável'
              value={form.nomeResponsavel}
              handleChangeText={(e) => setForm({ ...form, nomeResponsavel: e })}
              maskType={'cpf'}
            />

            <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">Primeira Escola de Futebol?</Text>
            <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 10, marginBottom: 20 }}>
              <Picker
                selectedValue={form.primeiraEscola}
                onValueChange={(itemValue) => setForm({ ...form, primeiraEscola: itemValue })}
                style={{ height: 50, width: '100%', padding: 10 }}
              >
                <Picker.Item label="Selecione" value="" />
                <Picker.Item label="Sim" value="sim" />
                <Picker.Item label="Não" value="nao" />
              </Picker>
            </View>

            <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">Ano Escolar</Text>
            <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 10, marginBottom: 20 }}>
              <Picker
                selectedValue={form.anoEscolar}
                onValueChange={(itemValue) => setForm({ ...form, anoEscolar: itemValue })}
                style={{ height: 50, width: '100%', padding: 10 }}
              >
                <Picker.Item label="Selecione" value="" />
                <Picker.Item label="Fundamental - 1º Ano" value="fundamental-1ano" />
                <Picker.Item label="Fundamental - 2º Ano" value="fundamental-2ano" />
                <Picker.Item label="Fundamental - 3º Ano" value="fundamental-3ano" />
                <Picker.Item label="Fundamental - 4º Ano" value="fundamental-4ano" />
                <Picker.Item label="Fundamental - 5º Ano" value="fundamental-5ano" />
                <Picker.Item label="Fundamental - 6º Ano" value="fundamental-6ano" />
                <Picker.Item label="Fundamental - 7º Ano" value="fundamental-7ano" />
                <Picker.Item label="Fundamental - 8º Ano" value="fundamental-8ano" />
                <Picker.Item label="Fundamental - 9º Ano" value="fundamental-9ano" />
                <Picker.Item label="Ensino Médio - 1º Ano" value="ensino-medio-1ano" />
                <Picker.Item label="Ensino Médio - 2º Ano" value="ensino-medio-2ano" />
                <Picker.Item label="Ensino Médio - 3º Ano" value="ensino-medio-3ano" />
              </Picker>
            </View>
          </>
        )}


        {role === 'professor' && (
          <>
            <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">Modalidade</Text>
            <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 10, marginBottom: 20 }}>
              <Picker
                selectedValue={form.modalidades}
                onValueChange={(itemValue) => setForm({ ...form, modalidades: itemValue })}
                style={{ height: 50, width: '100%', padding: 10 }}
              >
                <Picker.Item label="Selecione" value="" />
                {modalidades.map((modalidade, index) => (
                  <Picker.Item key={index} label={modalidade} value={modalidade} />
                ))}
              </Picker>
            </View>

            <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">Profissão</Text>
            <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 10, marginBottom: 20 }}>
              <Picker
                selectedValue={form.profession}
                onValueChange={(itemValue) => setForm({ ...form, profession: itemValue })}
                style={{ height: 50, width: '100%', padding: 10 }}
              >
                <Picker.Item label="Selecione" value="" />
                {professions.map((profession, index) => (
                  <Picker.Item key={index} label={profession} value={profession} />
                ))}
              </Picker>
            </View>

            <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">Faixa Etária de Trabalho</Text>
            <View style={{ marginBottom: 20 }}>
              <Text>Idade Mínima: {minAge}</Text>
              <Text>Idade Máxima: {maxAge}</Text>
              <Slider
                value={maxAge}
                onValueChange={handleAgeChange}
                minimumValue={minAge}
                maximumValue={65}
                step={1}
                minimumTrackTintColor="#126046"
                maximumTrackTintColor="#ccc"
                thumbTintColor="#126046"
              />
            </View>
            <Text className='mb-3'>Faixa Etária Selecionada: {form.faixa_etaria}</Text>

            <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">Dias da Semana de Trabalho</Text>
            <View style={{ flexDirection: 'row', marginBottom: 10, alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Picker
                  selectedValue={currentDay}
                  onValueChange={(itemValue) => setCurrentDay(itemValue)}
                  style={{ height: 50, width: '100%', padding: 10 }}
                >
                  <Picker.Item label="Dia" value="" />
                  {dias.map((dia, index) => (
                    <Picker.Item key={index} label={dia} value={dia} />
                  ))}
                </Picker>
              </View>

              <View style={{ flex: 1, flexDirection: 'row', marginLeft: 30, justifyContent: 'space-between' }}>
                <TouchableOpacity
                  style={{ backgroundColor: '#1E3A8A', padding: 10, borderRadius: 5, flex: 1, marginRight: 5 }}
                  onPress={() => setShowStartPicker(true)}
                >
                  <Text style={{ color: 'white', textAlign: 'center' }}>
                    {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </TouchableOpacity>

                {showStartPicker && (
                  <DateTimePicker
                    value={startTime}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowStartPicker(false);
                      if (selectedDate) {
                        setStartTime(selectedDate);
                      }
                    }}
                  />
                )}

                <TouchableOpacity
                  style={{ backgroundColor: '#1E3A8A', padding: 10, borderRadius: 5, flex: 1, marginLeft: 5 }}
                  onPress={() => setShowEndPicker(true)}
                >
                  <Text style={{ color: 'white', textAlign: 'center' }}>
                    {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </TouchableOpacity>

                {showEndPicker && (
                  <DateTimePicker
                    value={endTime}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowEndPicker(false);
                      if (selectedDate) {
                        setEndTime(selectedDate);
                      }
                    }}
                  />
                )}
              </View>
            </View>

            <TouchableOpacity
              onPress={handleAddHorario}
              style={{ backgroundColor: '#126046', padding: 10, marginVertical: 10, borderRadius: 5 }}
            >
              <Text style={{ color: 'white', textAlign: 'center' }}>Adicionar Horário</Text>
            </TouchableOpacity>

            <View>
              <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">Horários Adicionados</Text>
              {form.horarios.length > 0 ? (
                form.horarios.map((horario, index) => (
                  <View key={index} style={{ marginBottom: 10 }}>
                    <Text>{horario.dia}: {horario.start} - {horario.end}</Text>
                  </View>
                ))
              ) : (
                <Text className='text-black-700 text-sm font-pregular mb-3 mt-3'>Nenhum horário adicionado</Text>
              )}
            </View>
          </>
        )}

        {/* Campo de WhatsApp */}
        <Text className="text-black-700 text-sm font-pbold mb-2">Whatsapp</Text>
        <FormField 
          title='Whatsapp'
          value={form.whatsapp}
          handleChangeText={(e) => setForm({ ...form, whatsapp: e })}
          maskType={'cel-phone'}
          options={{
            maskType: 'BRL',
            withDDD: true,
            dddMask: '(99) '
          }}
        />

        {/* Campo de Email e Senha */}
        
        
        <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">Email</Text>
        <FormField 
          title='Email'
          value={form.email}
          handleChangeText={(e) => setForm({ ...form, email: e })}
          keyboardType='email-address'
        />
        

        <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">Senha</Text>
        <FormField 
          title='Senha'
          placeholder={'Insira no mínimo 8 caracteres'}
          value={form.password}
          handleChangeText={(e) => setForm({ ...form, password: e })}
        />

        <Text className="text-black-700 text-sm font-pbold mb-2 mt-3">Confirmar Senha</Text>
        <FormField 
          title='Confirmar Senha'
          value={form.confirmPassword}
          handleChangeText={(e) => setForm({ ...form, confirmPassword: e })}
          secureTextEntry
        />

        {/* Termos de compromisso */}
        {role === "responsavel" && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <Switch
              value={isAccepted}
              onValueChange={(value) => setIsAccepted(value)}
              thumbColor={isAccepted ? "#fff" : "#fff"}
              trackColor={{ false: "#333", true: "#1e5f49" }}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
              <Text>Eu li e aceito os </Text>
              <TouchableOpacity onPress={handleOpenTerms}>
                <Text style={{ color: 'blue', textDecorationLine: 'underline' }}>
                  Termos de Compromisso
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </>
    );
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <ScrollView>
        <View className='w-full justify-center min-h-[85vh] px-4 my-6'>
          <Text className='text-2xl text-black text-semibold font-psemibold'>
            Cadastre-se
          </Text>

          {renderFormFields()}

          <View className='w-full justify-center items-center mt-5'>
            <CustomButton 
              title='Cadastrar'
              handlePress={handleSubmit}
              containerStyles='px-6 py-2 rounded-lg w-[180px] h-[40px]'
              isLoading={isSubmitting}
            />
          </View>

          <View className="flex-row items-center my-6 w-full">
            <View className="flex-1 h-[1px] bg-gray-300" />
            <Text className="px-4 text-gray-500">ou</Text>
            <View className="flex-1 h-[1px] bg-gray-300" />
          </View>

          <View className= 'flex-row justify-between w-full items-center pt-4 gap-2'>
            <Text className='text-sm text-black-100 font-pregular'>
              Já possui uma conta?
            </Text>              
            <TouchableOpacity
              onPress={() => router.push('/signin')} 
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-lg w-[150px] h-[40px] ${isSubmitting ? 'bg-blue-700' : 'bg-blue-900'}`}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" /> 
              ) : (
                <Text className="text-white text-center font-pbold">Login</Text> 
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

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
    </SafeAreaView>
  );
};

export default SignUp;

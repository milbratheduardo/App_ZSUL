import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGlobalContext } from '@/context/GlobalProvider'; 
import { images } from '@/constants'; 
import { AntDesign, FontAwesome } from '@expo/vector-icons'; 

import * as Linking from 'expo-linking'; 

const History = () => {
  const { user } = useGlobalContext();
  const firstName = user?.username.split(' ')[0];

  // Função para abrir a página do Instagram
  const openInstagram = () => {
    Linking.openURL('https://www.instagram.com/sua_pagina');
  };

  // Função para abrir a página do Facebook
  const openFacebook = () => {
    Linking.openURL('https://www.facebook.com/sua_pagina');
  };

  const openWhatsApp = () => {
    const phoneNumber = '555391329635'; 
    Linking.openURL(`https://wa.me/${phoneNumber}`);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Header com saudação e logo */}
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Text className="font-pmedium text-sm text-primary">Bem Vindo</Text>
            <Text className="text-2xl font-psemibold text-verde">{firstName}</Text>
          </View>
          <Image source={images.escola_sp_transparente} style={styles.logo} />
        </View>
      </View>

      {/* Conteúdo rolável */}
      <ScrollView style={{ padding: 16 }}>
        <Text style={styles.title}>Escolinha de Futebol – Núcleos Cassino e Saraiva</Text>

        <Text style={styles.text}>
          Nossa escolinha de futebol é destinada a crianças e adolescentes de 7 a 16 anos, com dois núcleos de atendimento: Cassino e Saraiva. Aqui, buscamos muito mais do que ensinar apenas o esporte. Nosso objetivo é proporcionar um aprendizado completo, englobando todas as competências do futebol: técnica, tática, física e emocional.
        </Text>

        <Text style={styles.title}>Objetivos da Escolinha:</Text>

        <Text style={styles.text}>
          <Text style={styles.bold}>Ensino Completo do Futebol:</Text> Focamos no desenvolvimento integral dos alunos, abrangendo desde os aspectos técnicos e táticos até a preparação física e emocional necessária para o esporte.
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Desenvolvimento Integral:</Text> Além das habilidades motoras e cognitivas, também trabalhamos as capacidades sociais dos alunos, incentivando a interação e o respeito mútuo.
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Formação de Cidadãos:</Text> Nosso objetivo não é apenas formar atletas, mas cidadãos. Aqui, desenvolvemos a criatividade, a habilidade e o espírito esportivo, sempre com foco no trabalho coletivo e nos valores de cooperação e respeito.
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Saúde e Bem-estar:</Text> Através da prática esportiva, promovemos a melhora da saúde física e mental dos alunos, criando uma base sólida para uma vida saudável.
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Preparação para Competições:</Text> Ao longo do tempo, desenvolvemos o nível técnico dos alunos, preparando-os para competições regionais e estaduais, proporcionando experiências competitivas que estimulam o crescimento pessoal e esportivo.
        </Text>

        <Text style={styles.title}>Metodologia:</Text>
        <Text style={styles.textfinal}>
          Nossa metodologia é dividida em três etapas principais: Iniciação, Transição e Competitivo. Cada uma dessas fases tem objetivos específicos e abordagens distintas, garantindo o desenvolvimento gradual dos alunos em todas as dimensões do futebol. Valorizamos não apenas o desempenho técnico e tático, mas também a promoção dos valores fundamentais do esporte, como amizade, igualdade, cooperação e fair play (jogo limpo).
        </Text>
        <Text style={styles.author}>Aplicativo Desenvolvido por: Eduardo Milbrath</Text>
      </ScrollView>

      {/* Botões flutuantes */}
      <View style={styles.floatingButtons}>
        <TouchableOpacity onPress={openInstagram} style={styles.floatingButton}>
          <AntDesign name="instagram" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={openFacebook} style={styles.floatingButton}>
          <AntDesign name="facebook-square" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={openWhatsApp} style={styles.floatingButton}>
          <FontAwesome name="whatsapp" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default History;

const styles = StyleSheet.create({
  logo: {
    width: 115,
    height: 90,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 22,
  },
  textfinal: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 22,
  },
  bold: {
    fontWeight: 'bold',
  },
  author: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
    marginBottom:350,
    color: '#666',
  },
  floatingButtons: {
    position: 'absolute',
    bottom: 60,
    right: 20,
    flexDirection: 'column',
  },
  floatingButton: {
    backgroundColor: '#126046',
    borderRadius: 50,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
});

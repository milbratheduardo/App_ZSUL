import { StyleSheet, Text, View } from 'react-native'
import { useEffect} from 'react'
import { SplashScreen, Stack } from 'expo-router'
import { useFonts } from 'expo-font'
import GlobalProvider from '@/context/GlobalProvider';

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
  });
  
  useEffect(() => {
    if (error) throw error;
  
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);
  
  if (!fontsLoaded && !error) {
    return null;
  }
  return (
    <GlobalProvider>
      <Stack>
        <Stack.Screen name="index" options={{headerShown: false}} />
        <Stack.Screen name="(auth)" options={{headerShown: false}} />
        <Stack.Screen name="(tabs)" options={{headerShown: false}} />
        <Stack.Screen name="cadastro_atleta" options={{headerShown: false}} />
        <Stack.Screen name="cadastro_turma" options={{headerShown: false}} />
        <Stack.Screen name="cadastro_eventos" options={{headerShown: false}} />
        <Stack.Screen name="selecionar_alunos" options={{headerShown: false}} />
        <Stack.Screen name="eventos_dia" options={{headerShown: false}} />
        <Stack.Screen name="ver_relacionados" options={{headerShown: false}} />
        <Stack.Screen name="turma_alunos" options={{headerShown: false}} />
        <Stack.Screen name="cadastrar_alunos" options={{headerShown: false}} />
        <Stack.Screen name="turma_chamadas" options={{headerShown: false}} />
        <Stack.Screen name="ver_chamadas" options={{headerShown: false}} />
        <Stack.Screen name="editar_chamadas" options={{headerShown: false}} />
        <Stack.Screen name="enviar_imagem" options={{headerShown: false}} />
        <Stack.Screen name="ver_confirmados" options={{headerShown: false}} />
        <Stack.Screen name="aprovar_pagamentos" options={{headerShown: false}} />
        <Stack.Screen name="controle_turmas" options={{headerShown: false}} />
        <Stack.Screen name="relatorios" options={{headerShown: false}} />
        <Stack.Screen name="enviar_fotoTreino" options={{headerShown: false}} />
        <Stack.Screen name="notifica" options={{headerShown: false}} />
        <Stack.Screen name="escolherAtleta" options={{headerShown: false}} />
        <Stack.Screen name="detalhesAluno" options={{headerShown: false}} />
        <Stack.Screen name="metodologia" options={{headerShown: false}} />
        <Stack.Screen name="informacoes_pessoais" options={{headerShown: false}} />
        <Stack.Screen name="dashboard" options={{headerShown: false}} />
        <Stack.Screen name="comunidade" options={{headerShown: false}} />
        <Stack.Screen name="students" options={{headerShown: false}} />
        <Stack.Screen name="personalize_training" options={{headerShown: false}} />
        <Stack.Screen name="methodologies" options={{headerShown: false}} />
        <Stack.Screen name="athletes_group" options={{headerShown: false}} />
        <Stack.Screen name="mensagens_alunos" options={{headerShown: false}} />
        <Stack.Screen name="parents_group" options={{headerShown: false}} />
        <Stack.Screen name="mensagens_responsaveis" options={{headerShown: false}} />
        <Stack.Screen name="responsaveis" options={{headerShown: false}} />
        <Stack.Screen name="all_turmas" options={{headerShown: false}} />
        <Stack.Screen name="pagamento" options={{headerShown: false}} />
        <Stack.Screen name="seu_atleta" options={{headerShown: false}} />
        <Stack.Screen name="all_relatorios" options={{headerShown: false}} />
        <Stack.Screen name="responsaveis_contact" options={{headerShown: false}} />
        <Stack.Screen name="lista_eventos" options={{headerShown: false}} />
        <Stack.Screen name="profissionais_contact" options={{headerShown: false}} />
        <Stack.Screen name="dash_treinos" options={{headerShown: false}} />
        <Stack.Screen name="news_comunidade" options={{headerShown: false}} />
        <Stack.Screen name="dash_treinos2" options={{headerShown: false}} />
        <Stack.Screen name="alunos_stats" options={{headerShown: false}} />
        <Stack.Screen name="admin_profile" options={{headerShown: false}} />
        <Stack.Screen name="vincular_prof" options={{headerShown: false}} />
        <Stack.Screen name="gerenciar_usuarios" options={{headerShown: false}} />
        <Stack.Screen name="financeiro" options={{headerShown: false}} />
        <Stack.Screen name="edit_card_aluno" options={{headerShown: false}} />



        
        
        {/*<Stack.Screen name="/search/[query]" options={{headerShown: false}} />*/}
      </Stack>
    </GlobalProvider>
  )
} 

export default RootLayout

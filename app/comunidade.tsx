import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRouter } from 'expo-router';

const Community = () => {
  const router = useRouter();
    const communityTopics = [
      { id: '1', title: 'Responsáveis', icon: 'comments', description: 'Canal de avisos e mensagens com pais e responsáveis', route: '/responsaveis' },
      { id: '2', title: 'Grupo de Atletas', icon: 'soccer-ball-o', description: 'Conecte-se com outros atletas e saiba das novidades.', route: '/athletes_group' },
      { id: '3', title: 'Grupo de Pais', icon: 'users', description: 'Grupo dedicado aos pais e responsáveis.', route: '/parents_group' },
      { id: '4', title: 'Novidades na Comunidade', icon: 'newspaper-o', description: 'Fique por dentro das novidades e eventos.', route: '/community-news' },
    ];
    
  

  const renderTopic = ({ item }) => (
    <TouchableOpacity style={styles.topicContainer} onPress={() => router.push(item.route)}>
      <Icon name={item.icon} size={24} color="#126046" style={styles.topicIcon} />
      <View style={styles.topicTextContainer}>
        <Text style={styles.topicTitle}>{item.title}</Text>
        <Text style={styles.topicDescription}>{item.description}</Text>
      </View>
      <Icon name="angle-right" size={20} color="#888" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Comunidade</Text>
        <Text style={styles.subHeaderText}>Explore e conecte-se com a comunidade</Text>
      </View>

      <FlatList
        data={communityTopics}
        renderItem={renderTopic}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

export default Community;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#126046',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subHeaderText: {
    fontSize: 16,
    color: '#D1FAE5',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  topicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topicIcon: {
    marginRight: 16,
  },
  topicTextContainer: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  topicDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

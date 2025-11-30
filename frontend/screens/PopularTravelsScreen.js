import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Navbar from '../components/Navbar';
import TravelCard from '../components/TravelCard';

export default function PopularTravelsScreen() {
  const navigation = useNavigation();

  // Dados fake de pacotes populares
  const popularPackages = [
    {
      id: '1',
      title: 'Pacote Romântico em Gramado',
      destination: 'Gramado, RS',
      dateIn: '2024-12-20',
      dateOut: '2024-12-27',
      budget: 3200,
      totalCost: 2899,
      adults: 2,
      children: 0,
      isPublic: true,
      summary: {
        accommodation: 'Hotel Boutique',
        activitiesCount: 5,
        foodCount: 3
      },
      image: 'https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd',
      createdAt: '2024-11-15T10:00:00Z'
    },
    {
      id: '2',
      title: 'Aventura nas Praias do Nordeste',
      destination: 'Porto de Galinhas, PE',
      dateIn: '2024-11-25',
      dateOut: '2024-12-02',
      budget: 2800,
      totalCost: 2450,
      adults: 2,
      children: 1,
      isPublic: true,
      summary: {
        accommodation: 'Resort All Inclusive',
        activitiesCount: 8,
        foodCount: 5
      },
      image: 'https://images.unsplash.com/photo-1551524164-6ca5e3aa1c04',
      createdAt: '2024-11-10T14:30:00Z'
    },
    {
      id: '3',
      title: 'Cultural no Rio de Janeiro',
      destination: 'Rio de Janeiro, RJ',
      dateIn: '2024-12-10',
      dateOut: '2024-12-15',
      budget: 2200,
      totalCost: 1950,
      adults: 1,
      children: 0,
      isPublic: true,
      summary: {
        accommodation: 'Hotel Copacabana',
        activitiesCount: 6,
        foodCount: 4
      },
      image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325',
      createdAt: '2024-11-12T09:15:00Z'
    }
  ];

const handleCardPress = (travelPackage) => {
  navigation.navigate("ReadyPackage", { 
    package: travelPackage 
  });
};

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Pacotes Populares</Text>
          <Text style={styles.subtitle}>
            Descubra os destinos mais amados pelos viajantes
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          {popularPackages.map((travelPackage) => (
            <TravelCard
              key={travelPackage.id}
              travel={travelPackage}
              onPress={() => handleCardPress(travelPackage)}
            />
          ))}
        </View>
      </ScrollView>
      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7f9',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1D4780',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 22,
  },
  cardsContainer: {
    marginBottom: 20,
  },
});
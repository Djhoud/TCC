import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// onDestinationSelect recebe (nome, minBudget, maxBudget)
const DestinationSearchInput = ({ API_BASE_URL, onDestinationSelect }) => {
 const [destinationInput, setDestinationInput] = useState('');
 const [destinationSuggestions, setDestinationSuggestions] = useState([]);
 const [loadingSuggestions, setLoadingSuggestions] = useState(false);
 const [showSuggestions, setShowSuggestions] = useState(false);
 // Indica se estamos buscando detalhes, incluindo orçamento
 const [isFetchingDetails, setIsFetchingDetails] = useState(false); 

 // 1. useEffect: Busca sugestões enquanto o usuário digita.
 useEffect(() => {
 const fetchSuggestions = async () => {
  if (destinationInput.length < 3) {
  setDestinationSuggestions([]);
  return;
  }

  setLoadingSuggestions(true);

  try {
  const response = await fetch(`${API_BASE_URL}/api/cities/suggestions?search=${destinationInput}`);
  if (!response.ok) {
   throw new Error(`Erro na API de sugestões: ${response.status}`);
  }
  const data = await response.json();
  setDestinationSuggestions(data);
  } catch (error) {
  console.error('Erro ao buscar sugestões de destino:', error);
  setDestinationSuggestions([]);
  } finally {
  setLoadingSuggestions(false);
  }
 };

 const handler = setTimeout(() => {
  fetchSuggestions();
 }, 500);

 return () => clearTimeout(handler);
 }, [destinationInput, API_BASE_URL]);


 // 2. handleDestinationSelect: Chamado ao selecionar uma cidade. Busca o orçamento e atualiza o pai.
 const handleDestinationSelect = async (selectedDestination) => {
  setDestinationInput(selectedDestination);
  setShowSuggestions(false);
  setIsFetchingDetails(true); 

  let userToken = null;
  try {
   userToken = await AsyncStorage.getItem('userToken');
  } catch (e) {
   console.error("Erro ao recuperar token do AsyncStorage:", e);
   Alert.alert("Erro", "Não foi possível buscar seu token de sessão.");
   setIsFetchingDetails(false);
   return;
  }

  // === BUSCA DO ORÇAMENTO USANDO O NOVO ENDPOINT ===
  try {
   // Utilizamos o endpoint GET /api/cities/details?cityName=...
   const detailsResponse = await fetch(`${API_BASE_URL}/api/cities/details?cityName=${encodeURIComponent(selectedDestination)}`, {
    headers: { Authorization: `Bearer ${userToken}` },
   });

   if (!detailsResponse.ok) {
    const errorData = await detailsResponse.json();
    throw new Error(errorData.message || `Erro ao buscar detalhes da cidade: ${detailsResponse.status}`);
   }
   
   const cityDetails = await detailsResponse.json();
   
   // Usa valores padrão de 0 e 5000 se os dados estiverem faltando
   const minBudget = cityDetails.minBudget || 0;
   const maxBudget = cityDetails.maxBudget || 5000;
   
   // Chama a prop do componente pai, passando o orçamento encontrado
   onDestinationSelect(selectedDestination, minBudget, maxBudget);

  } catch (error) {
   console.error('Erro ao buscar detalhes do orçamento:', error);
   Alert.alert("Erro", error.message || "Não foi possível carregar o orçamento para este destino. Usando o padrão.");
  
   // Notifica o componente pai com valores padrão em caso de erro
   onDestinationSelect(selectedDestination, 0, 5000); 

  } finally {
   setIsFetchingDetails(false); 
  }
 };
 
 return (
 <View>
  <Text style={styles.label}>Destino:</Text>
  <TextInput
  style={styles.input}
  placeholder="Digite o destino (ex: São Paulo)"
  value={destinationInput}
  onChangeText={(text) => {
   setDestinationInput(text);
   setShowSuggestions(true);
  }}
  onFocus={() => {
   if (destinationSuggestions.length > 0) {
   setShowSuggestions(true);
   }
  }}
  />
  {/* Mostra o indicador de carregamento enquanto busca sugestões OU detalhes (orçamento) */}
  {loadingSuggestions || isFetchingDetails ? (
  <ActivityIndicator size="small" color="#007bff" style={{ marginTop: 5 }} />
  ) : null}
  {showSuggestions && destinationSuggestions.length > 0 && (
  <View style={styles.suggestionsContainer}>
   {destinationSuggestions.map((item, index) => (
   <TouchableOpacity
    key={index}
    style={styles.suggestionItem}
    onPress={() => handleDestinationSelect(item.nome)}
   >
    <Text style={styles.suggestionText}>{item.nome}</Text>
   </TouchableOpacity>
   ))}
  </View>
  )}
 </View>
 );
};

const styles = StyleSheet.create({
 label: {
 fontSize: 16,
 fontWeight: '600',
 color: '#495057',
 marginBottom: 8,
 marginTop: 15,
 },
 input: {
 backgroundColor: '#fff',
 borderWidth: 1,
 borderColor: '#ced4da',
 borderRadius: 8,
 padding: 12,
 fontSize: 16,
 color: '#343a40',
 },
 suggestionsContainer: {
 backgroundColor: '#fff',
 borderColor: '#ced4da',
 borderWidth: 1,
 borderRadius: 8,
 marginTop: 5,
 maxHeight: 200,
 },
 suggestionItem: {
 padding: 12,
 borderBottomWidth: 1,
 borderBottomColor: '#e9ecef',
 },
 suggestionText: {
 fontSize: 16,
 color: '#495057',
 },
});

export default DestinationSearchInput;
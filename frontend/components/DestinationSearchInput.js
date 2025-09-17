// frontend/app/components/DestinationSearchInput.js
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

const DestinationSearchInput = ({ API_BASE_URL, onDestinationSelect, onBudgetRangeUpdate }) => {
  const [destinationInput, setDestinationInput] = useState('');
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [fetchingBudgetRange, setFetchingBudgetRange] = useState(false);

  useEffect(() => {
    const fetchSuggestionsAndBudget = async () => {
      if (destinationInput.length < 3) {
        setDestinationSuggestions([]);
        return;
      }

      setLoadingSuggestions(true);
      setFetchingBudgetRange(true);

      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
        if (!userToken) {
          console.warn("Token de usuário não encontrado para buscar sugestões e range de orçamento.");
          return;
        }
      } catch (e) {
        console.error("Erro ao recuperar token do AsyncStorage:", e);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/cities/suggestions?search=${destinationInput}`);
        if (!response.ok) {
          throw new Error(`Erro na API de sugestões: ${response.status}`);
        }
        const data = await response.json();
        setDestinationSuggestions(data);
      } catch (error) {
        console.error('Erro ao buscar sugestões de destino:', error);
      } finally {
        setLoadingSuggestions(false);
      }

      try {
        const budgetRangeResponse = await fetch(`${API_BASE_URL}/api/preferences/budget-range?destinationName=${encodeURIComponent(destinationInput)}`, {
          headers: { Authorization: `Bearer ${userToken}` },
        });

        if (!budgetRangeResponse.ok) {
          const errorData = await budgetRangeResponse.json();
          if (errorData.message.includes('Destino não encontrado no banco de dados')) {
            console.warn("Destino não encontrado no DB. Resetando o slider de orçamento.");
            onBudgetRangeUpdate(0, 5000, 1000);
            return;
          }
          throw new Error(errorData.message || `Erro na API de range de orçamento: ${budgetRangeResponse.status}`);
        }
        const budgetRangeData = await budgetRangeResponse.json();
        const newMin = parseFloat(budgetRangeData.minBudget);
        const newMax = parseFloat(budgetRangeData.maxBudget);

        onBudgetRangeUpdate(newMin > 0 ? newMin : 100, newMax > newMin ? newMax : 5000, newMin > 0 ? newMin : 100);

      } catch (error) {
        console.error('Erro ao buscar range de orçamento:', error);
        Alert.alert("Erro", error.message || "Não foi possível carregar o orçamento para este destino.");
      } finally {
        setFetchingBudgetRange(false);
      }
    };

    const handler = setTimeout(() => {
      fetchSuggestionsAndBudget();
    }, 500);

    return () => clearTimeout(handler);
  }, [destinationInput, API_BASE_URL]);

  const handleDestinationSelect = (selectedDestination) => {
    setDestinationInput(selectedDestination);
    onDestinationSelect(selectedDestination);
    setShowSuggestions(false);
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
      {loadingSuggestions || fetchingBudgetRange ? (
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
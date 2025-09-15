// frontend/app/screens/TravelBudgetScreen.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import BudgetSlider from '../components/BudgetSlider';

// Importe suas imagens se ainda as usar para sugestões de imagem
import rioImage from '../assets/images/component/rio.png';
import spImage from '../assets/images/component/saopaulo.png';
// Adicione mais se precisar, ou remova se for usar URLs do backend

export default function TravelBudgetScreen() {
  const navigation = useNavigation();
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

  const [destination, setDestination] = useState('');
  const [budget, setBudget] = useState(1000);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [dateIn, setDateIn] = useState('');
  const [dateOut, setDateOut] = useState('');
  const [showDateInPicker, setShowDateInPicker] = useState(false);
  const [showDateOutPicker, setShowDateOutPicker] = useState(false);

  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [loadingNavigation, setLoadingNavigation] = useState(false);

  const [minBudgetSlider, setMinBudgetSlider] = useState(0);
  const [maxBudgetSlider, setMaxBudgetSlider] = useState(5000);
  const [fetchingBudgetRange, setFetchingBudgetRange] = useState(false);

  // --- Funções Auxiliares (mantidas ou ajustadas se necessário) ---
  const getDestinationImage = (dest) => {
    // Implemente sua lógica de imagem aqui, se ainda usar.
    // Exemplo:
    if (dest.includes('Rio')) return rioImage;
    if (dest.includes('São Paulo')) return spImage;
    return null;
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2); // Pega os últimos 2 dígitos do ano
    return `${day}/${month}/${year}`;
  };

  const handleDateInChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowDateInPicker(false);
    setDateIn(formatDate(currentDate));

    // Se a data de saída for anterior à nova data de entrada, ajusta a data de saída
    if (dateOut && new Date(dateOut.split('/').reverse().join('-')) < currentDate) {
      setDateOut(formatDate(currentDate));
    }
  };

  const handleDateOutChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowDateOutPicker(false);
    setDateOut(formatDate(currentDate));
  };


  // Efeito para buscar sugestões de destino E AGORA O RANGE DO ORÇAMENTO
  useEffect(() => {
    const fetchDestinationSuggestionsAndBudgetRange = async () => {
      if (destination.length < 3) {
        setDestinationSuggestions([]);
        setMinBudgetSlider(0);
        setMaxBudgetSlider(5000);
        setBudget(1000);
        return;
      }

      setLoadingSuggestions(true);
      setFetchingBudgetRange(true);

      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem('userToken');
        if (!userToken) {
          console.warn("Token de usuário não encontrado para buscar sugestões e range de orçamento.");
          Alert.alert("Erro de Autenticação", "Não foi possível carregar dados. Faça login novamente.");
          return;
        }
      } catch (e) {
        console.error("Erro ao recuperar token do AsyncStorage:", e);
        return;
      }

      // 1. Buscar sugestões de destino
      try {
        const response = await fetch(`${API_BASE_URL}/api/cities/suggestions?search=${destination}`);
        if (!response.ok) {
          throw new Error(`Erro na API de sugestões: ${response.status}`);
        }
        const data = await response.json();
        setDestinationSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Erro ao buscar sugestões de destino:', error);
      } finally {
        setLoadingSuggestions(false);
      }

      // 2. Buscar range de orçamento
      try {
        const budgetRangeResponse = await fetch(`${API_BASE_URL}/api/preferences/budget-range?destinationName=${encodeURIComponent(destination)}`, {
          headers: { Authorization: `Bearer ${userToken}` },
        });

        if (!budgetRangeResponse.ok) {
          const errorData = await budgetRangeResponse.json();
          throw new Error(errorData.message || `Erro na API de range de orçamento: ${budgetRangeResponse.status}`);
        }
        const budgetRangeData = await budgetRangeResponse.json();
        console.log("Range de Orçamento Recebido:", budgetRangeData);

        const newMin = parseFloat(budgetRangeData.minBudget);
        const newMax = parseFloat(budgetRangeData.maxBudget);

        setMinBudgetSlider(newMin > 0 ? newMin : 100);
        setMaxBudgetSlider(newMax > newMin ? newMax : 5000);
        setBudget(newMin > 0 ? newMin : 100);

      } catch (error) {
        console.error('Erro ao buscar range de orçamento:', error);
        setMinBudgetSlider(0);
        setMaxBudgetSlider(5000);
        setBudget(1000);
      } finally {
        setFetchingBudgetRange(false);
      }
    };

    const handler = setTimeout(() => {
      fetchDestinationSuggestionsAndBudgetRange();
    }, 500);

    return () => clearTimeout(handler);
  }, [destination, API_BASE_URL]);


  const handleDestinationSelect = (selectedDestination) => {
    setDestination(selectedDestination);
    setShowSuggestions(false);
  };

  const handleConcluir = async () => {
    if (!destination || !budget || !dateIn || !dateOut) {
      Alert.alert("Campos Obrigatórios", "Por favor, preencha todos os campos.");
      return;
    }

    if (adults === 0 && children === 0) {
      Alert.alert("Número de Pessoas", "Pelo menos um adulto ou criança deve ser selecionado.");
      return;
    }

    const dateInObj = new Date(dateIn.split('/').reverse().join('-'));
    const dateOutObj = new Date(dateOut.split('/').reverse().join('-'));

    if (dateOutObj < dateInObj) {
      Alert.alert("Datas Inválidas", "A data de volta não pode ser anterior à data de ida.");
      return;
    }

    setLoadingNavigation(true);

    const packageParams = {
      orcamento: budget,
      destino: destination,
      adults: adults,
      children: children,
      dateIn: dateIn,
      dateOut: dateOut,
    };

    let userToken = null;
    try {
      userToken = await AsyncStorage.getItem('userToken');
      console.log("Token recuperado do AsyncStorage:", userToken ? "Token presente" : "Token AUSENTE!");
      if (!userToken) {
        Alert.alert("Erro de Autenticação", "Você precisa estar logado para gerar um pacote. Por favor, faça login novamente.");
        setLoadingNavigation(false);
        return;
      }
    } catch (e) {
      console.error("Erro ao recuperar token do AsyncStorage:", e);
      Alert.alert("Erro", "Não foi possível acessar seus dados de sessão. Tente novamente.");
      setLoadingNavigation(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/packages/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify(packageParams),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro do servidor: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Pacote gerado pelo backend (Resposta API):', responseData.package);

      navigation.navigate("Confirmation", { packageData: responseData.package });

    } catch (error) {
      console.error("Erro ao gerar pacote de viagem:", error);
      Alert.alert("Erro", error.message || "Não foi possível gerar o pacote de viagem. Tente novamente.");
    } finally {
      setLoadingNavigation(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Planeje sua Viagem</Text>

      <Text style={styles.label}>Destino:</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o destino (ex: São Paulo)"
        value={destination}
        onChangeText={(text) => {
          setDestination(text);
        }}
        onFocus={() => destination.length >= 3 && destinationSuggestions.length > 0 && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />
      {loadingSuggestions && <ActivityIndicator size="small" color="#007bff" />}
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

      <View style={styles.datePickerContainer}>
        <View style={styles.dateInputWrapper}>
          <Text style={styles.label}>Data de Ida:</Text>
          <TouchableOpacity onPress={() => setShowDateInPicker(true)} style={styles.dateInput}>
            <Text style={styles.dateInputText}>{dateIn || 'Selecionar Data'}</Text>
          </TouchableOpacity>
          {showDateInPicker && (
            <DateTimePicker
              value={dateIn ? new Date(dateIn.split('/').reverse().join('-')) : new Date()}
              mode="date"
              display="default"
              onChange={handleDateInChange}
            />
          )}
        </View>

        <View style={styles.dateInputWrapper}>
          <Text style={styles.label}>Data de Volta:</Text>
          <TouchableOpacity onPress={() => setShowDateOutPicker(true)} style={styles.dateInput}>
            <Text style={styles.dateInputText}>{dateOut || 'Selecionar Data'}</Text>
          </TouchableOpacity>
          {showDateOutPicker && (
            <DateTimePicker
              value={dateOut ? new Date(dateOut.split('/').reverse().join('-')) : new Date()}
              mode="date"
              display="default"
              onChange={handleDateOutChange}
              minimumDate={dateIn ? new Date(dateIn.split('/').reverse().join('-')) : new Date()}
            />
          )}
        </View>
      </View>

      <View style={styles.pickerContainer}>
        <View style={styles.pickerWrapper}>
          <Text style={styles.label}>Adultos:</Text>
          <Picker
            selectedValue={adults}
            style={styles.picker}
            onValueChange={(itemValue) => setAdults(itemValue)}
          >
            {[...Array(10).keys()].map((i) => (
              <Picker.Item key={i + 1} label={`${i + 1}`} value={i + 1} />
            ))}
          </Picker>
        </View>

        <View style={styles.pickerWrapper}>
          <Text style={styles.label}>Crianças:</Text>
          <Picker
            selectedValue={children}
            style={styles.picker}
            onValueChange={(itemValue) => setChildren(itemValue)}
          >
            {[...Array(10).keys()].map((i) => (
              <Picker.Item key={i} label={`${i}`} value={i} />
            ))}
          </Picker>
        </View>
      </View>

      {fetchingBudgetRange ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />
      ) : (
        <BudgetSlider
          budget={budget}
          setBudget={setBudget}
          minimumValue={minBudgetSlider}
          maximumValue={maxBudgetSlider}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleConcluir} disabled={loadingNavigation || fetchingBudgetRange}>
        {loadingNavigation ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Concluir</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 30,
    textAlign: 'center',
  },
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
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  dateInputWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  dateInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateInputText: {
    fontSize: 16,
    color: '#343a40',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  pickerWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  picker: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    height: 50,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
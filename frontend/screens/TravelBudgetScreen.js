// frontend/app/screens/TravelBudgetScreen.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BudgetSlider from '../components/BudgetSlider';
import DestinationSearchInput from '../components/DestinationSearchInput'; // Importa o novo componente

export default function TravelBudgetScreen() {
  const navigation = useNavigation();
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

  // Manteremos apenas o estado do destino confirmado aqui
  const [destination, setDestination] = useState('');
  const [budget, setBudget] = useState(1000);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [dateIn, setDateIn] = useState('');
  const [dateOut, setDateOut] = useState('');
  const [showDateInPicker, setShowDateInPicker] = useState(false);
  const [showDateOutPicker, setShowDateOutPicker] = useState(false);

  const [loadingNavigation, setLoadingNavigation] = useState(false);

  const [minBudgetSlider, setMinBudgetSlider] = useState(0);
  const [maxBudgetSlider, setMaxBudgetSlider] = useState(5000);

  // --- Funções Auxiliares ---
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  const handleDateInChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowDateInPicker(false);
    setDateIn(formatDate(currentDate));

    if (dateOut && new Date(dateOut.split('/').reverse().join('-')) < currentDate) {
      setDateOut(formatDate(currentDate));
    }
  };

  const handleDateOutChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowDateOutPicker(false);
    setDateOut(formatDate(currentDate));
  };
  
  // Função para receber o destino selecionado do componente filho
  const handleDestinationSelect = (selectedDestination) => {
      setDestination(selectedDestination);
  };

  // Função para receber o range de orçamento do componente filho
  const handleBudgetRangeUpdate = (min, max, newBudget) => {
      setMinBudgetSlider(min);
      setMaxBudgetSlider(max);
      setBudget(newBudget);
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

      {/* Usando o novo componente */}
      <DestinationSearchInput
        API_BASE_URL={API_BASE_URL}
        onDestinationSelect={handleDestinationSelect}
        onBudgetRangeUpdate={handleBudgetRangeUpdate}
      />

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

      {/* Não há mais ActivityIndicator aqui, pois foi movido para o componente filho */}
      <BudgetSlider
        budget={budget}
        setBudget={setBudget}
        minimumValue={minBudgetSlider}
        maximumValue={maxBudgetSlider}
      />

      <TouchableOpacity style={styles.button} onPress={handleConcluir} disabled={loadingNavigation}>
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
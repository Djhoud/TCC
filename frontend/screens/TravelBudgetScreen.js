// frontend/app/screens/TravelBudgetScreen.js
import AsyncStorage from '@react-native-async-storage/async-storage'; // <<-- Adicione este import
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
  const [budget, setBudget] = useState(1000); // Valor inicial do orçamento
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [dateIn, setDateIn] = useState(''); // Formato DD/MM/YY
  const [dateOut, setDateOut] = useState(''); // Formato DD/MM/YY
  const [showDateInPicker, setShowDateInPicker] = useState(false);
  const [showDateOutPicker, setShowDateOutPicker] = useState(false);

  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [loadingNavigation, setLoadingNavigation] = useState(false); // Novo estado para carregamento

  // Função para mapear cidades a imagens (se ainda for usar localmente)
  const getDestinationImage = (cityName) => {
    switch (cityName.toLowerCase()) {
      case 'rio de janeiro':
        return rioImage;
      case 'são paulo':
        return spImage;
      case 'belo horizonte':
        return bhImage;
      default:
        return null; // Ou uma imagem padrão
    }
  };

  // Função para formatar a data de Date para DD/MM/YY
  const formatDate = (date) => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2); // Pega os 2 últimos dígitos
    return `${day}/${month}/${year}`;
  };

  const handleDateInChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowDateInPicker(false);
    setDateIn(formatDate(currentDate));
  };

  const handleDateOutChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowDateOutPicker(false);
    setDateOut(formatDate(currentDate));
  };

  // Efeito para buscar sugestões de destino
  useEffect(() => {
    const fetchDestinationSuggestions = async () => {
      if (destination.length < 3) {
        setDestinationSuggestions([]);
        return;
      }
      setLoadingSuggestions(true);
     // ... dentro do useEffect, na função fetchDestinationSuggestions ...

try {
      const response = await fetch(`${API_BASE_URL}/api/cities/suggestions?search=${destination}`);
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      const data = await response.json();
      console.log("--- Frontend Debug (Sugestões) ---");
      console.log("Dados de sugestões recebidos do backend:", data); // <<< VERIFIQUE ESTA LINHA
      setDestinationSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Erro ao buscar sugestões de destino:', error);
    } finally {
      setLoadingSuggestions(false);
    }
    };

    const handler = setTimeout(() => {
      fetchDestinationSuggestions();
    }, 500); // Atraso de 500ms para buscar sugestões

    return () => clearTimeout(handler); // Limpa o timeout anterior
  }, [destination, API_BASE_URL]);

 const handleDestinationSelect = (selectedDestination) => {
  console.log("--- Frontend Debug (handleDestinationSelect) ---");
  console.log("Sugestão selecionada:", selectedDestination); // <<-- MANTENHA ESTA LINHA

  setDestination(selectedDestination);
  setShowSuggestions(false); // Esconde as sugestões após a seleção
};

  const handleConcluir = async () => {
    // 1. Validações básicas
    if (!destination || destination.trim() === '') {
      Alert.alert('Erro', 'Por favor, selecione um destino.');
      return;
    }
    if (!dateIn || !dateOut) {
      Alert.alert('Erro', 'Por favor, selecione as datas de ida e volta.');
      return;
    }
    const dIn = new Date(dateIn.split('/').reverse().join('-')); // Converte para YYYY-MM-DD
    const dOut = new Date(dateOut.split('/').reverse().join('-')); // Converte para YYYY-MM-DD
    if (dIn > dOut) {
      Alert.alert('Erro', 'A data de volta não pode ser anterior à data de ida.');
      return;
    }
    if (adults === 0 && children === 0) {
      Alert.alert('Erro', 'Pelo menos um adulto ou criança deve ser selecionado.');
      return;
    }
    if (budget <= 0) {
      Alert.alert('Erro', 'O orçamento deve ser maior que zero.');
      return;
    }

    // 2. Coletar todos os parâmetros
    const packageParams = {
      destino: destination,
      orcamento: budget,
      adults: adults,
      children: children,
      dateIn: dateIn,
      dateOut: dateOut,
    };

    console.log("--- Frontend Debug ---");
    console.log("Dados do pacote a serem enviados:", packageParams);
    console.log("Tipo do orçamento (budget):", typeof budget, "Valor:", budget);
    console.log("Tipo do destino (destination):", typeof destination, "Valor:", destination);

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

    // 3. Fazer a requisição POST para o backend
    try {
      const response = await fetch(`${API_BASE_URL}/api/packages/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`, // Usa o token recuperado
        },
        body: JSON.stringify(packageParams),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro do servidor: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Pacote gerado pelo backend (Resposta API):', responseData.package);

      // 4. Navegar para a tela de confirmação/detalhes com os dados do pacote gerado
      navigation.navigate("Confirmation", { packageData: responseData.package });

    } catch (error) {
      console.error("Erro ao gerar pacote de viagem:", error);
     Alert.alert("Erro", error.message || "Não foi possível gerar o pacote de viagem. Tente novamente.");
    } finally {
      setLoadingNavigation(false); // Desativa o indicador de carregamento
    }
  };


  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Planeje sua Viagem</Text>

      {/* Input de Destino */}
      <Text style={styles.label}>Destino:</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o destino (ex: São Paulo)"
        value={destination}
        onChangeText={(text) => {
          setDestination(text);
          // showSuggestions é controlado pelo useEffect para só aparecer com 3+ caracteres
        }}
        onFocus={() => destination.length >= 3 && setDestinationSuggestions.length > 0 && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Pequeno atraso para permitir clique
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

      {/* Datas de Ida e Volta */}
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
              minimumDate={dateIn ? new Date(dateIn.split('/').reverse().join('-')) : new Date()} // Garante que a data de volta seja >= data de ida
            />
          )}
        </View>
      </View>

      {/* Seletores de Adultos e Crianças */}
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

      {/* Slider de Orçamento */}
      <BudgetSlider budget={budget} setBudget={setBudget} />

      {/* Botão Concluir */}
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
    elevation: 3, // Sombra para Android
    shadowColor: '#000', // Sombra para iOS
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
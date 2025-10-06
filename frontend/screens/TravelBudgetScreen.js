// frontend/app/screens/TravelBudgetScreen.js
// frontend/app/screens/TravelBudgetScreen.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image, // <--- ADICIONADO!
  ScrollView,
  StyleSheet,
  Text,
  TextInput, // <--- ADICIONADO!
  TouchableOpacity,
  View,
} from 'react-native';
import BudgetSlider from '../components/BudgetSlider';
import DestinationSearchInput from '../components/DestinationSearchInput'; // Importa o novo componente

// ... (O restante do seu código)

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
    <View style={styles.container}>
      {/* ScrollView cobre a área de INPUTS */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* === ÁREA BRANCA (INPUTS) === */}
        <View style={styles.whiteArea}>
          
          {/* Input de Destino - Replicando o visual do protótipo */}
          <View style={styles.destinationContainer}>
            <Text style={styles.indoParaLabel}>Indo Para</Text>
            <DestinationSearchInput
              API_BASE_URL={API_BASE_URL}
              onDestinationSelect={handleDestinationSelect}
              onBudgetRangeUpdate={handleBudgetRangeUpdate}
              initialValue={destination}
            />
          </View>

          {/* Datas em duas colunas */}
          <View style={styles.inputRow}>
            {/* Data de Entrada */}
            <TouchableOpacity onPress={() => setShowDateInPicker(true)} style={styles.datePickerButton}>
              <View style={styles.inputField}>
                <Text style={styles.dateLabel}>Entrada</Text>
                <Text style={styles.dateText}>{dateIn || '05/09/24'}</Text>
              </View>
            </TouchableOpacity>

            {/* Data de Saída */}
            <TouchableOpacity onPress={() => setShowDateOutPicker(true)} style={styles.datePickerButton}>
              <View style={styles.inputField}>
                <Text style={styles.dateLabel}>Saída</Text>
                <Text style={styles.dateText}>{dateOut || '05/09/24'}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Pessoas em duas colunas */}
          <View style={styles.inputRow}>
            {/* Adultos */}
            <View style={styles.peopleInput}>
              <View style={styles.inputField}>
                <Text style={styles.dateLabel}>Adultos</Text>
                <Text style={styles.dateText}>{adults}</Text>
              </View>
              {/* O Picker original pode ser adaptado aqui para mudar o estado `adults` */}
            </View>

            {/* Crianças */}
            <View style={styles.peopleInput}>
              <View style={styles.inputField}>
                <Text style={styles.dateLabel}>Crianças</Text>
                <Text style={styles.dateText}>{children}</Text>
              </View>
            </View>
          </View>

          {/* Orçamento (Budget) */}
          <View style={styles.budgetSection}>
            <View style={styles.budgetHeader}>
              <Text style={styles.quantoGastarText}>Quanto deseja gastar</Text>
            </View>
            
            {/* Slider de Orçamento */}
            <View style={styles.sliderWrapper}>
                <Text style={styles.budgetValueText}>R$ {budget}</Text>
                <BudgetSlider
                    budget={budget}
                    setBudget={setBudget}
                    minimumValue={minBudgetSlider}
                    maximumValue={maxBudgetSlider}
                />
            </View>
            
            {/* Inputs de Valor Mínimo e Máximo */}
            <View style={styles.minMaxInputRow}>
                <TextInput style={styles.minMaxInput} value={`$${minBudgetSlider}`} editable={false} />
                <Text style={styles.minMaxSeparator}>-</Text>
                <TextInput style={styles.minMaxInput} value={`$${maxBudgetSlider}`} editable={false} />
            </View>
          </View>

          {/* Espaçamento final antes da área azul */}
          <View style={styles.spacer} />
        </View>
      </ScrollView>

      {/* --- ÁREA AZUL FIXA (RODAPÉ/IMAGEM) --- */}
      {/* Esta View usa zIndex e position: 'absolute' para criar o efeito de onda */}
      <View style={styles.blueArea}>
        <Image 
          source={require('../assets/images/component/rio.png')} // Altere para o caminho da sua imagem
          style={styles.bottomImage} 
        />
        
        {/* Botões - Layout Lado a Lado */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.actionButton, styles.editButton]}>
              <Text style={[styles.buttonText, styles.editButtonText]}>Editar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.concluirButton]} onPress={handleConcluir} disabled={loadingNavigation}>
              {loadingNavigation ? (
                  <ActivityIndicator color="#fff" />
              ) : (
                  <Text style={styles.buttonText}>Concluir</Text>
              )}
          </TouchableOpacity>
        </View>
      </View>
      
      {/* DatePickers fora do layout principal */}
      {showDateInPicker && (
        <DateTimePicker
          value={dateIn ? new Date(dateIn.split('/').reverse().join('-')) : new Date()}
          mode="date"
          display="default"
          onChange={handleDateInChange}
        />
      )}
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
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', 
  },
  scrollContent: {
    paddingBottom: 250, // Garante espaço para a área azul que fica "por baixo"
  },
  // === ÁREA BRANCA (INPUTS) ===
  whiteArea: {
    paddingHorizontal: 20,
    paddingTop: 50, // Espaço no topo
    backgroundColor: '#fff',
    zIndex: 2, 
  },
  destinationContainer: {
    marginBottom: 20,
  },
  indoParaLabel: {
    fontSize: 16,
    color: '#999',
    marginBottom: 5,
  },
  // Linha de 2 Colunas (Datas e Pessoas)
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  datePickerButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  peopleInput: {
    flex: 1,
    marginHorizontal: 5,
  },
  // Usado para o rótulo de 'Entrada'/'Adultos'
  dateLabel: {
    fontSize: 12,
    color: '#999',
    position: 'absolute', 
    top: 5,
    left: 10,
    zIndex: 10,
  },
  // Usado para o valor da data/pessoa
  dateText: {
    fontSize: 16,
    color: '#343a40',
    marginTop: 8,
  },
  inputField: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  // === SEÇÃO DE ORÇAMENTO ===
  budgetSection: {
    marginTop: 20,
    paddingHorizontal: 5,
  },
  budgetHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  quantoGastarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#495057',
  },
  sliderWrapper: {
    alignItems: 'center',
  },
  budgetValueText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3A8FFF',
    marginBottom: 10,
  },
  minMaxInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 5,
  },
  minMaxInput: {
    width: '45%',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#fff',
    color: '#343a40',
  },
  minMaxSeparator: {
    color: '#999',
    fontSize: 20,
  },
  spacer: {
    height: 30, // Espaço antes do corte da onda
  },
  // === ÁREA AZUL (RODAPÉ) ===
  blueArea: {
    backgroundColor: '#3A8FFF', // Cor principal do protótipo
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 70, // Espaço para a "onda"
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    // Cria a curva da onda que sobe no protótipo
    borderTopLeftRadius: 50, 
    borderTopRightRadius: 50,
    zIndex: 1, 
  },
  bottomImage: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    marginBottom: 25,
    resizeMode: 'cover',
  },
  // Botões de Ação
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 10,
    elevation: 5,
  },
  editButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#3A8FFF',
  },
  editButtonText: {
    color: '#3A8FFF',
  },
  concluirButton: {
    backgroundColor: '#1D4780', 
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
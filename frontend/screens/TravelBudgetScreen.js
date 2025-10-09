import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import BudgetSlider from '../components/BudgetSlider';
import DestinationSearchInput from '../components/DestinationSearchInput';
import Navbar from '../components/Navbar';

export default function TravelBudgetScreen() {
 const navigation = useNavigation();
 const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

 // Estados
 const [destination, setDestination] = useState('');
 const [budget, setBudget] = useState(1000);
 const [minBudgetSlider, setMinBudgetSlider] = useState(0);
 const [maxBudgetSlider, setMaxBudgetSlider] = useState(5000);

 const [adults, setAdults] = useState(1);
 const [children, setChildren] = useState(0);
 const [dateIn, setDateIn] = useState('');
 const [dateOut, setDateOut] = useState('');
 const [showDateInPicker, setShowDateInPicker] = useState(false);
 const [showDateOutPicker, setShowDateOutPicker] = useState(false);
 const [loadingNavigation, setLoadingNavigation] = useState(false);

    // --- FUNÇÃO DE BUSCA DO ORÇAMENTO (MIN E MAX) ---
// A função fetchCityBudget COMPLETA para copiar e colar
const fetchCityBudget = async (cityName) => {
    if (!cityName) return;

    // Use a URL correta da sua API. Se você não tem API_BASE_URL no escopo, substitua
    // pelo seu endereço completo (ex: 'http://192.168.1.10:3000/api')
    const url = `${API_BASE_URL}/api/cities/details?cityName=${encodeURIComponent(cityName)}`;

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            
            // Tenta ler o erro detalhado do servidor
            let errorMessage = `Erro ao buscar orçamento: Status ${response.status}`;
            
            try {
                // Tenta ler o corpo JSON que contém a mensagem do seu Controller
                const errorData = await response.json();
                if (errorData.message) {
                    errorMessage = errorData.message; // Usa a mensagem detalhada do Express
                }
            } catch (e) {
                // Não é JSON ou o corpo está vazio
                console.warn('Resposta de erro da API sem corpo JSON: ' + response.status);
            }
            
            // Lança o erro para o bloco catch externo
            throw new Error(errorMessage);
        }

        // Resposta OK (Status 200)
        const data = await response.json();
        
        // --- Atualiza os estados (ajuste as variáveis se necessário) ---
        setMinBudgetSlider(data.minBudget);
        setMaxBudgetSlider(data.maxBudget);
        
        // Lógica para ajustar o slider se o valor atual estiver fora do novo limite
        if (budget < data.minBudget || budget > data.maxBudget || budget === 1000) { 
            setBudget(data.minBudget); 
        }
        // -----------------------------------------------------------------

    } catch (error) {
        // Exibe o erro real (que agora deve ser detalhado, ex: "Detalhes não encontrados")
        console.error('Erro ao buscar detalhes do orçamento da cidade:', error.message);
        Alert.alert("Erro de Orçamento", error.message || "Erro desconhecido ao carregar dados.");
        
        // Fallback para os sliders em caso de falha
        setMinBudgetSlider(100); 
        setMaxBudgetSlider(5000);
    }
};

    // --- MONITORAMENTO: CHAMA A BUSCA QUANDO O DESTINO MUDA ---
    useEffect(() => {
        if (destination) {
            fetchCityBudget(destination);
        }
    }, [destination]);

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

 const handleDestinationSelect = (selectedDestination) => {
 setDestination(selectedDestination); // <- ESSENCIAL: Dispara o useEffect
 };

 const handleConcluir = async () => {
 if (!destination || !budget || !dateIn || !dateOut) {
Alert.alert('Campos Obrigatórios', 'Por favor, preencha todos os campos.');
return;
 }

 if (adults === 0 && children === 0) {
Alert.alert('Número de Pessoas', 'Pelo menos um adulto ou criança deve ser selecionado.');
return;
 }

 const dateInObj = new Date(dateIn.split('/').reverse().join('-'));
 const dateOutObj = new Date(dateOut.split('/').reverse().join('-'));

 if (dateOutObj < dateInObj) {
Alert.alert('Datas Inválidas', 'A data de volta não pode ser anterior à data de ida.');
return;
 }

 setLoadingNavigation(true);

 const packageParams = {
orcamento: budget,
destino: destination,
adults,
children,
dateIn,
dateOut,
 };

 let userToken = null;
 try {
userToken = await AsyncStorage.getItem('userToken');
if (!userToken) {
Alert.alert('Erro de Autenticação', 'Você precisa estar logado para gerar um pacote. Por favor, faça login novamente.');
setLoadingNavigation(false);
return;
}
 } catch (e) {
console.error('Erro ao recuperar token do AsyncStorage:', e);
Alert.alert('Erro', 'Não foi possível acessar seus dados de sessão. Tente novamente.');
setLoadingNavigation(false);
return;
 }

 try {
const response = await fetch(`${API_BASE_URL}/api/packages/generate`, {
method: 'POST',
headers: {
 'Content-Type': 'application/json',
 Authorization: `Bearer ${userToken}`,
},
body: JSON.stringify(packageParams),
});

if (!response.ok) {
const errorData = await response.json();
throw new Error(errorData.message || `Erro do servidor: ${response.status}`);
}

const responseData = await response.json();
navigation.navigate('Confirmation', { packageData: responseData.package });
 } catch (error) {
console.error('Erro ao gerar pacote de viagem:', error);
Alert.alert('Erro', error.message || 'Não foi possível gerar o pacote de viagem. Tente novamente.');
 } finally {
setLoadingNavigation(false);
 }
 };

 return (
 <View style={styles.container}>
<ScrollView contentContainerStyle={styles.scrollContent}>
{/* === ÁREA BRANCA (INPUTS e SLIDER) === */}
<View style={styles.whiteAreaContent}>
 {/* Input de Destino */}
 <View style={styles.destinationContainer}>
<DestinationSearchInput
  API_BASE_URL={API_BASE_URL}
  onDestinationSelect={handleDestinationSelect}
  initialValue={destination}
/>
 </View>

 {/* Datas (InputRow) */}
 <View style={styles.inputRow}>
<TouchableOpacity onPress={() => setShowDateInPicker(true)} style={styles.datePickerButton}>
  <View style={styles.inputField}>
 <Text style={styles.dateLabel}>Entrada</Text>
 <Text style={styles.dateText}>{dateIn || '05/09/24'}</Text>
  </View>
</TouchableOpacity>

<TouchableOpacity onPress={() => setShowDateOutPicker(true)} style={styles.datePickerButton}>
  <View style={styles.inputField}>
 <Text style={styles.dateLabel}>Saída</Text>
 <Text style={styles.dateText}>{dateOut || '05/09/24'}</Text>
  </View>
</TouchableOpacity>
 </View>

 {/* Pessoas (InputRow) */}
 <View style={styles.inputRow}>
<View style={styles.peopleInput}>
  <View style={styles.inputField}>
 <Text style={styles.dateLabel}>Adultos</Text>
 <Text style={styles.dateText}>{String(adults)}</Text>
  </View>
</View>

<View style={styles.peopleInput}>
  <View style={styles.inputField}>
 <Text style={styles.dateLabel}>Crianças</Text>
 <Text style={styles.dateText}>{String(children)}</Text>
  </View>
</View>
 </View>

 {/* === SEÇÃO DE ORÇAMENTO === */}
 <View style={styles.budgetSection}>
<View style={styles.sliderWrapper}>
  <BudgetSlider
 budget={budget}
 setBudget={setBudget}
 minimumValue={minBudgetSlider}
 maximumValue={maxBudgetSlider}
  />
</View>
 </View>
</View>

{/* === ÁREA AZUL (IMAGEM E BOTÕES) === */}
<View style={styles.blueAreaContent}>
 <Image source={require('../assets/images/component/rio.png')} style={styles.bottomImage} />

 <View style={styles.buttonRow}>
<TouchableOpacity style={[styles.actionButton, styles.editButton]}>
  <Text style={[styles.buttonText, styles.editButtonText]}>Editar</Text>
</TouchableOpacity>

<TouchableOpacity
  style={[styles.actionButton, styles.concluirButton]}
  onPress={handleConcluir}
  disabled={loadingNavigation}
>
  {loadingNavigation ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Concluir</Text>}
</TouchableOpacity>
 </View>
</View>
</ScrollView>

{/* DatePickers */}
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

<Navbar />
 </View>
 );
}

const styles = StyleSheet.create({
 container: { flex: 1, backgroundColor: '#fff' },
 scrollContent: { paddingBottom: 20 },

 whiteAreaContent: {
 paddingHorizontal: 20,
 paddingTop: 50,
 backgroundColor: '#fff',
 paddingBottom: 10,
 },
 destinationContainer: { marginBottom: 20 },
 indoParaLabel: { fontSize: 16, color: '#999', marginBottom: 5 },

 inputRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
 datePickerButton: { flex: 1, marginHorizontal: 5 },
 peopleInput: { flex: 1, marginHorizontal: 5 },
 dateLabel: { fontSize: 12, color: '#999', position: 'absolute', top: 5, left: 10, zIndex: 10 },
 dateText: { fontSize: 16, color: '#343a40', marginTop: 8 },
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

 budgetSection: { paddingHorizontal: 5, marginTop: -20, marginBottom: 30 },
 sliderWrapper: { alignItems: 'center', paddingHorizontal: 7, marginTop: 10 },

 budgetValueText: { fontSize: 24, fontWeight: 'bold', color: '#343a40', textAlign: 'center', marginBottom: 10 },
 minMaxInputRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingHorizontal: 5 },
 minMaxInput: { width: '45%', textAlign: 'center', borderWidth: 1, borderColor: '#ced4da', borderRadius: 8, padding: 8, backgroundColor: '#f8f9fa', color: '#343a40' },
 minMaxSeparator: { color: '#343a40', fontSize: 20 },

 blueAreaContent: {
 backgroundColor: '#3A8FFF',
 paddingHorizontal: 20,
 paddingBottom: 40,
 paddingTop: 50,
 borderTopLeftRadius: 50,
 borderTopRightRadius: 50,
 marginTop: -30,
 },

 bottomImage: { width: '100%', height: 200, borderRadius: 15, marginBottom: 25, resizeMode: 'cover' },
 buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
 actionButton: { flex: 1, paddingVertical: 15, borderRadius: 10, alignItems: 'center', marginHorizontal: 10, elevation: 5 },
 editButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#3A8FFF' },
 editButtonText: { color: '#3A8FFF' },
 concluirButton: { backgroundColor: '#1D4780' },
 buttonText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
});
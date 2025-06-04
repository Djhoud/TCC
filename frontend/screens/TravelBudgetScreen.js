import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useCallback, useEffect, useState } from "react"; // MODIFICAÇÃO: Adicione 'useCallback'
import {
  ActivityIndicator,
  Alert, // MODIFICAÇÃO: Para o indicador de carregamento das sugestões
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

import BudgetSlider from "../components/BudgetSlider";
import CloudBackReverseLow from "../components/CloudBackReverseLow";
import Navbar from "../components/Navbar";

const InputBox = ({ label, value, onChangeText, keyboardType }) => (
  <View style={styles.box}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
    />
  </View>
);

const DateInputBox = ({ label, value, onPress }) => (
  <View style={styles.box}>
    <Text style={styles.label}>{label}</Text>
    <TouchableOpacity onPress={onPress}>
      <TextInput
        style={styles.input}
        value={value}
        editable={false}
        pointerEvents="none"
      />
    </TouchableOpacity>
  </View>
);

const Button = ({ text, style, onPress }) => (
  <TouchableOpacity style={style} onPress={onPress}>
    <Text style={styles.buttonText}>{text}</Text>
  </TouchableOpacity>
);

export default function TravelBudgetScreen() {
  const navigation = useNavigation();
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState(500);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [dateIn, setDateIn] = useState("05/09/24");
  const [dateOut, setDateOut] = useState("05/09/24");
  const [showDateInPicker, setShowDateInPicker] = useState(false);
  const [showDateOutPicker, setShowDateOutPicker] = useState(false);

  // MODIFICAÇÃO: Novos estados para as sugestões da API
  const [fetchedSuggestions, setFetchedSuggestions] = useState([]); // Armazena as sugestões retornadas pela API
  const [loadingSuggestions, setLoadingSuggestions] = useState(false); // Indica se as sugestões estão sendo carregadas
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false); // Controla a visibilidade do dropdown de sugestões

  const [packageDataToSend, setPackageDataToSend] = useState(null);
  const [loadingNavigation, setLoadingNavigation] = useState(false);

  // MODIFICAÇÃO: A lista estática 'destinations' NÃO é mais necessária e pode ser removida.
  // Remova as seguintes linhas:
  // const destinations = [
  //   "Rio de Janeiro",
  //   "São Paulo",
  //   "Salvador",
  //   "Florianópolis",
  //   "Porto Alegre"
  // ];

  const getDestinationImage = (destination) => {
    const images = {
      "Rio de Janeiro": require("../assets/images/component/rio.png"),
      "São Paulo": require("../assets/images/component/saopaulo.png"),
      "Salvador": require("../assets/images/component/salvador.png"),
      "Florianópolis": require("../assets/images/component/florianopolis.png"),
      "Gramado": require("../assets/images/component/gramado.png"),
      // MODIFICAÇÃO: Considere adicionar mais mapeamentos de imagem conforme as cidades no seu DB
      // Ou uma lógica para buscar uma imagem genérica se não houver um match exato
    };
    return images[destination] || require("../assets/images/component/default.png");
  };

    const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;  

  const formatDate = (date) => {
    // Assegura que 'date' é um objeto Date antes de formatar
    if (!(date instanceof Date)) {
      // MODIFICAÇÃO: Adicione um console.warn ou log para depuração se 'date' não for Date
      // console.warn("formatDate received non-Date object:", date);
      date = new Date(date); // Tenta converter, pode precisar de um parser mais robusto para strings de data
      if (isNaN(date.getTime())) { // Se a conversão falhar, usa a data atual como fallback seguro
         date = new Date();
      }
    }
    return date.toLocaleDateString("pt-BR");
  };

  // MODIFICAÇÃO: Função para buscar sugestões do backend
    const fetchDestinationSuggestions = useCallback(async (text) => {
    if (text.length < 2) {
      setFetchedSuggestions([]);
      setLoadingSuggestions(false);
      setShowSuggestionsDropdown(false);
      return;
    }

    setLoadingSuggestions(true);
    try {
      // MODIFICAÇÃO: Use a variável de ambiente aqui
      const response = await fetch(`${API_BASE_URL}/api/cities/suggestions?search=${text}`);

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setFetchedSuggestions(data);
      setShowSuggestionsDropdown(data.length > 0);
    } catch (error) {
      console.error("Erro ao buscar sugestões de destino:", error);
      Alert.alert("Erro", "Não foi possível buscar sugestões de destino. Verifique sua conexão ou tente novamente.");
      setFetchedSuggestions([]);
      setShowSuggestionsDropdown(false);
    } finally {
      setLoadingSuggestions(false);
    }
  }, [API_BASE_URL]);  // Dependências vazias, pois a URL base é estática por enquanto

  // MODIFICAÇÃO: Efeito para disparar a busca de sugestões com debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchDestinationSuggestions(destination);
    }, 300); // Debounce de 300ms para evitar muitas requisições ao digitar

    return () => {
      clearTimeout(handler); // Limpa o timer se o destino mudar antes do tempo
    };
  }, [destination, fetchDestinationSuggestions]); // Dispara sempre que o 'destination' muda

  // Lógica de Navegação (já existente)
  useEffect(() => {
    if (packageDataToSend) {
      setLoadingNavigation(true);
      navigation.navigate("Confirmation", { packageData: packageDataToSend });
      setPackageDataToSend(null);
      setLoadingNavigation(false);
    }
  }, [packageDataToSend, navigation]);

  const handleConcluir = () => {
    // MODIFICAÇÃO: Adicione validação básica (aprimore conforme a necessidade!)
    if (!destination || destination.trim() === "") {
        Alert.alert("Campo Obrigatório", "Por favor, digite um destino.");
        return;
    }
    if (adults <= 0) {
        Alert.alert("Número de Adultos Inválido", "O número de adultos deve ser maior que zero.");
        return;
    }
    // Exemplo de validação de data (muito básica, refine conforme sua necessidade)
    const parsedDateIn = new Date(dateIn);
    const parsedDateOut = new Date(dateOut);
    if (isNaN(parsedDateIn.getTime()) || isNaN(parsedDateOut.getTime())) {
        Alert.alert("Datas Inválidas", "Por favor, selecione datas válidas.");
        return;
    }
    if (parsedDateIn > parsedDateOut) {
        Alert.alert("Datas Inválidas", "A data de saída não pode ser anterior à data de entrada.");
        return;
    }


    const packageData = {
      destination: destination,
      departureDate: dateIn, // Envia a string formatada
      returnDate: dateOut, // Envia a string formatada
      adults: adults,
      children: children,
      budget: budget,
      attractions: [], // Inicializa como um array vazio para evitar erro de map na ConfirmationScreen
    };
    setPackageDataToSend(packageData);
  };

  // MODIFICAÇÃO: Funções para o DatePicker para usar o estado atual para o valor
  const onDateInChange = (event, selectedDate) => {
    setShowDateInPicker(false);
    if (selectedDate) {
      // Atualiza o estado dateIn com a data formatada
      setDateIn(formatDate(selectedDate));
      // Opcional: Se a data de entrada for posterior à data de saída atual, atualiza a data de saída também
      if (new Date(selectedDate) > new Date(dateOut)) {
        setDateOut(formatDate(selectedDate));
      }
    }
  };

  const onDateOutChange = (event, selectedDate) => {
    setShowDateOutPicker(false);
    if (selectedDate) {
      // Atualiza o estado dateOut com a data formatada
      setDateOut(formatDate(selectedDate));
      // Opcional: Se a data de saída for anterior à data de entrada atual, ajusta a data de entrada
      if (new Date(selectedDate) < new Date(dateIn)) {
        setDateIn(formatDate(selectedDate));
      }
    }
  };


  return (
    <View style={styles.container}>
      <CloudBackReverseLow style={styles.cloudBackground} />
      <View style={styles.formWrapper}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Destino</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Digite o destino"
            value={destination}
            onChangeText={text => {
              setDestination(text);
            }}
          />
          {/* MODIFICAÇÃO: Renderiza sugestões ou indicador de carregamento */}
          {showSuggestionsDropdown && (destination.length >= 2 || loadingSuggestions) && ( // Exibe se o dropdown deve aparecer E (o usuário digitou o suficiente OU está carregando)
            <View style={styles.suggestionsBox}>
              {loadingSuggestions ? (
                <ActivityIndicator size="small" color="#0000ff" /> // Indicador de carregamento
              ) : fetchedSuggestions.length > 0 ? (
                fetchedSuggestions.map((d, index) => ( // Mapeia as sugestões recebidas da API
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setDestination(d); // Define o destino com a sugestão selecionada
                      setShowSuggestionsDropdown(false); // Oculta o dropdown
                      setFetchedSuggestions([]); // Limpa as sugestões (opcional, mas boa prática)
                    }}
                  >
                    <Text style={styles.suggestion}>{d}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                // MODIFICAÇÃO: Mensagem quando não há sugestões e não está carregando
                destination.length >= 2 && !loadingSuggestions && (
                  <Text style={styles.suggestion}>Nenhuma sugestão encontrada.</Text>
                )
              )}
            </View>
          )}
        </View>

        <View style={styles.row}>
          <DateInputBox label="Entrada" value={dateIn} onPress={() => setShowDateInPicker(true)} />
          <DateInputBox label="Saída" value={dateOut} onPress={() => setShowDateOutPicker(true)} />
        </View>
        <View style={styles.row}>
          <InputBox
            label="Adultos"
            value={String(adults)}
            onChangeText={text => setAdults(Number(text))}
            keyboardType="numeric"
          />
          <InputBox
            label="Crianças"
            value={String(children)}
            onChangeText={text => setChildren(Number(text))}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.sliderWrapper}>
          <BudgetSlider budget={budget} setBudget={setBudget} />
        </View>
      </View>
      <View style={styles.imageAndButtonWrapper}>
        <Image source={getDestinationImage(destination)} style={styles.destinationImage} />
        <View style={styles.buttonContainer}>
          <Button text="Editar" style={styles.editButton} />
          <Button
            text="Concluir"
            style={styles.confirmButton}
            onPress={handleConcluir}
          />
          {loadingNavigation && (
            <View style={styles.loadingNavigation}>
              <ActivityIndicator color="#fff" />
            </View>
          )}
        </View>
      </View>
      {showDateInPicker && (
        <DateTimePicker
          // MODIFICAÇÃO: Define o valor inicial do picker para a data atualmente selecionada ou a data atual
          value={new Date(dateIn) || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onDateInChange} // Usando a nova função de callback
        />
      )}
      {showDateOutPicker && (
        <DateTimePicker
          // MODIFICAÇÃO: Define o valor inicial do picker para a data atualmente selecionada ou a data atual
          value={new Date(dateOut) || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onDateOutChange} // Usando a nova função de callback
        />
      )}
      <Navbar style={styles.navbar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0"
  },
  cloudBackground: {
    position: "absolute",
    top: 260,
    left: 0,
    right: 0,
    zIndex: 0
  },
  formWrapper: {
    width: "100%",
    paddingVertical: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    zIndex: 1
  },
  inputGroup: {
    alignItems: "center",
    width: "90%",
    position: "relative"
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 5
  },
  input: {
    width: 145,
    height: 53,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    textAlign: "center",
    backgroundColor: "#fff",
    marginVertical: 5
  },
  searchInput: {
    width: 322,
    height: 53,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    textAlign: "center",
    backgroundColor: "#fff",
    marginVertical: 5
  },
  suggestionsBox: {
    position: "absolute",
    top: 75, // Ajuste conforme necessário para ficar abaixo do TextInput
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 5,
    width: 322, // MODIFICAÇÃO: Aumenta a largura para corresponder ao searchInput
    maxHeight: 200, // MODIFICAÇÃO: Adiciona altura máxima e scroll
    overflow: 'hidden', // MODIFICAÇÃO: Para garantir que o scroll funcione
    zIndex: 10 // Garante que fique acima de outros elementos
  },
  suggestion: {
    padding: 10, // MODIFICAÇÃO: Aumenta o padding para melhor toque
    fontSize: 16, // MODIFICAÇÃO: Ajusta o tamanho da fonte
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
    width: '100%' // MODIFICAÇÃO: Garante que o touchable ocupe a largura total
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "90%",
    paddingVertical: 5
  },
  box: {
    alignItems: "center"
  },
  sliderWrapper: {
    marginTop: 5,
    width: "90%"
  },
  imageAndButtonWrapper: {
    width: "100%",
    backgroundColor: "#3A8FFF",
    alignItems: "center",
    paddingVertical: 20,
    paddingBottom: 100,
    paddingTop: 70,
    position: "relative",
  },
  destinationImage: {
    width: "80%",
    height: 180,
    borderRadius: 10,
    marginBottom: 15
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "70%",
    height: 40,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold"
  },
  editButton: {
    backgroundColor: "#3A8FFF",
    borderWidth: 0.5,
    borderColor: "#fff",
    paddingVertical: 10,
    width: 95,
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center"
  },
  confirmButton: {
    width: 95,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A5FB4",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 3
  },
  navbar: {
    position: "absolute",
    bottom: 0,
    width: "100%"
  },
  loadingNavigation: {
    marginLeft: 10,
  },
});
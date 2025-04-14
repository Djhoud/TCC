import React, { useState } from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";

import CloudBackReverseLow from "@/components/CloudBackReverseLow";
import BudgetSlider from "../components/BudgetSlider";
import Navbar from "../components/Navbar";

export default function TravelBudgetScreen() {
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState(500);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [dateIn, setDateIn] = useState("05/09/24");
  const [dateOut, setDateOut] = useState("05/09/24");
  const [showDateInPicker, setShowDateInPicker] = useState(false);
  const [showDateOutPicker, setShowDateOutPicker] = useState(false);

  const destinations = ["Rio de Janeiro", "São Paulo", "Salvador", "Florianópolis", "Porto Alegre"];
  const [showSuggestions, setShowSuggestions] = useState(false);

  const getDestinationImage = (destination) => {
    const images = {
      "Rio de Janeiro": require("../assets/images/component/rio.png"),
      "São Paulo": require("../assets/images/component/saopaulo.png"),
      "Salvador": require("../assets/images/component/salvador.png"),
      "Florianópolis": require("../assets/images/component/florianopolis.png"),
      "Gramado": require("../assets/images/component/gramado.png"),
    };
    return images[destination] || require("../assets/images/component/default.png");
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("pt-BR");
  };

  
  return (
    <View style={styles.container}>
      <CloudBackReverseLow style={styles.cloudBackground} />

      {/* TOPO - FORMULÁRIO */}
      <View style={styles.formWrapper}>
        {/* DESTINO */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Destino</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Digite o destino"
            value={destination}
            onChangeText={text => {
              setDestination(text);
              setShowSuggestions(true);
            }}
          />
          {destination !== "" && showSuggestions && (
            <View style={styles.suggestionsBox}>
              {destinations
                .filter(d => d.toLowerCase().includes(destination.toLowerCase()))
                .map((d, index) => (
                  <TouchableOpacity key={index} onPress={() => {
                    setDestination(d);
                    setShowSuggestions(false);
                  }}>
                    <Text style={styles.suggestion}>{d}</Text>
                  </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* DATAS */}
        <View style={styles.row}>
          <DateInputBox label="Entrada" value={dateIn} onPress={() => setShowDateInPicker(true)} />
          <DateInputBox label="Saída" value={dateOut} onPress={() => setShowDateOutPicker(true)} />
        </View>

        {/* PESSOAS */}
        <View style={styles.row}>
          <InputBox label="Adultos" value={String(adults)} onChangeText={text => setAdults(Number(text))} keyboardType="numeric" />
          <InputBox label="Crianças" value={String(children)} onChangeText={text => setChildren(Number(text))} keyboardType="numeric" />
        </View>

        {/* SLIDER */}
        <View style={styles.sliderWrapper}>
          <BudgetSlider budget={budget} setBudget={setBudget} />
        </View>
      </View>

      {/* IMAGEM E BOTÕES */}
      <View style={styles.imageAndButtonWrapper}>
        <Image source={getDestinationImage(destination)} style={styles.destinationImage} />
        <View style={styles.buttonContainer}>
          <Button text="Editar" style={styles.editButton} />
          <Button text="Concluir" style={styles.confirmButton} />
        </View>
      </View>

      {/* PICKERS */}
      {showDateInPicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedDate) => {
            setShowDateInPicker(false);
            if (selectedDate) setDateIn(formatDate(selectedDate));
          }}
        />
      )}
      {showDateOutPicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedDate) => {
            setShowDateOutPicker(false);
            if (selectedDate) setDateOut(formatDate(selectedDate));
          }}
        />
      )}

      <Navbar style={styles.navbar} />
    </View>
  );
}

// COMPONENTES
const InputBox = ({ label, value, onChangeText, keyboardType }) => (
  <View style={styles.box}>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={styles.input} value={value} onChangeText={onChangeText} keyboardType={keyboardType} />
  </View>
);

const DateInputBox = ({ label, value, onPress }) => (
  <View style={styles.box}>
    <Text style={styles.label}>{label}</Text>
    <TouchableOpacity onPress={onPress}>
      <TextInput style={styles.input} value={value} editable={false} pointerEvents="none" />
    </TouchableOpacity>
  </View>
);

const Button = ({ text, style }) => (
  <TouchableOpacity style={style}>
    <Text style={styles.buttonText}>{text}</Text>
  </TouchableOpacity>
);


// ESTILOS
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },

  cloudBackground: {
    position: "absolute",
    top: 260,
    left: 0,
    right: 0,
    zIndex: 0,
  },

  formWrapper: {
    width: "100%",
    paddingVertical: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    zIndex: 1,
  },

  inputGroup: {
    alignItems: "center",
    width: "90%",
    position: "relative", // isso é essencial
  },
  

  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 5,
  },
  input: {
    width: 145,
    height: 53,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    textAlign: "center",
    backgroundColor: "#fff",
    marginVertical: 5,
  },
  searchInput: {
    width: 322, // ou maior, tipo 200 ou 220 se quiser bem longo
    height: 53,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    textAlign: "center",
    backgroundColor: "#fff",
    marginVertical: 5,
  },
  
  suggestionsBox: {
    position: "absolute",
    top: 75, // ajuste esse valor conforme o layout do input
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 5,
    width: 180,
    zIndex: 10,
  },
  
  suggestion: {
    padding: 5,
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "90%",
    paddingVertical: 5,
  },
  box: {
    alignItems: "center",
  },

  sliderWrapper: {
    marginTop: 5,
    width: "90%",
  },

  imageAndButtonWrapper: {
    width: "100%",
    backgroundColor: "#3A8FFF",
    alignItems: "center",
    paddingVertical: 20,
    paddingBottom: 100,
    paddingTop:70,
  },
  destinationImage: {
    width: "80%",
    height: 180,
    borderRadius: 10,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "70%",
    height: 40,
    marginTop: 10,
    
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
  editButton: {
    backgroundColor: "#3A8FFF",
    borderWidth:0.5,
    borderColor: "#fff",
    paddingVertical: 10,
    width:95,
    height:50,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent:"center",
    alignItems: "center"
  },
  confirmButton: {
    width:95,
    height:50,
    justifyContent:"center",
    alignItems: "center",
    backgroundColor: "#1A5FB4",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 3,
  },
  navbar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
});

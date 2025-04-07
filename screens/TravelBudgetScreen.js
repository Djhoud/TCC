import CloudBackReverseLow from "@/components/CloudBackReverseLow";
import React, { useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import BudgetSlider from "../components/BudgetSlider";
import Navbar from "../components/Navbar";


export default function TravelBudgetScreen() {
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState(500);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [dateIn, setDateIn] = useState("05/09/24");
  const [dateOut, setDateOut] = useState("05/09/24");

  const destinations = ["Rio de Janeiro", "São Paulo", "Salvador", "Florianópolis", "Porto Alegre"];

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

  return (
    <SafeAreaView style={styles.container}>
  <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.innerContainer}>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.contentContainer}>
        <CloudBackReverseLow style={styles.cloudBackground} />
        
        <View style={styles.topArea}>
          <Text style={styles.label}>Destino</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o destino"
            value={destination}
            onChangeText={setDestination}
          />
          {destination !== "" && (
            <View style={styles.suggestionsBox}>
              {destinations.filter(d => d.toLowerCase().includes(destination.toLowerCase())).map((d, index) => (
                <TouchableOpacity key={index} onPress={() => setDestination(d)}>
                  <Text style={styles.suggestion}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.row}>
            <InputBox label="Entrada" value={dateIn} onChangeText={setDateIn} />
            <InputBox label="Saída" value={dateOut} onChangeText={setDateOut} />
          </View>

          <View style={styles.row}>
            <InputBox label="Adultos" value={String(adults)} onChangeText={text => setAdults(Number(text))} keyboardType="numeric" />
            <InputBox label="Crianças" value={String(children)} onChangeText={text => setChildren(Number(text))} keyboardType="numeric" />
          </View>

          <BudgetSlider budget={budget} setBudget={setBudget} />

        </View>

        {/* Área Inferior */}
        <View style={styles.bottomArea}>
          <Image source={getDestinationImage(destination)} style={styles.destinationImage} />
          <View style={styles.buttonContainer}>
            <Button text="Editar" style={styles.editButton} />
            <Button text="Concluir" style={styles.confirmButton} />
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
    <Navbar style={styles.navbar} />
  </KeyboardAvoidingView>
</SafeAreaView>

  );
}

const InputBox = ({ label, value, onChangeText, keyboardType }) => (
  <View style={styles.box}>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={styles.input} value={value} onChangeText={onChangeText} keyboardType={keyboardType} />
  </View>
);

const Button = ({ text, style }) => (
  <TouchableOpacity style={style}>
    <Text style={styles.buttonText}>{text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    zIndex:1,
  },
  innerContainer: {
    flex: 1
  },
  contentContainer: {
    flex: 1,
    paddingTop: 40,
    paddingBottom: 80,
    alignItems: "center"
  },
  content: {
    alignItems: "center",
    padding: 20
  },
  cloudBackground: {
    position: "absolute",
    top: 280, 
    left: 0,
    right: 0,
    zIndex: 1
  },
  topArea: {
    height: "40%",  // Ajustando a altura para um valor menor
    justifyContent: "center",
    width:"100%",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingTop: 40,
    zIndex: 1,

  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 5
  },
  input: {
    width: 180,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    textAlign: "center",
    backgroundColor: "#fff",
    marginVertical: 5
  },
  suggestionsBox: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 5,
    position: "absolute",
    top: 65,
    width: 180
  },
  suggestion: {
    padding: 5,
    fontSize: 14
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    paddingVertical: 5
  },
  box: {
    alignItems: "center"
  },
  budgetText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3A8FFF",
    marginVertical: 5
  },
  slider: {
    width: "80%",
    
    height: 40
  },
  bottomArea: {
    height: "55%",
    width:"100%",  // Ajuste proporcional da área inferior
    backgroundColor: "#3A8FFF",
    padding: 15,
  },
  destinationImage: {
    width: "90%",
    height: 180,
    borderRadius: 10,
    marginBottom: 15
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginTop: 10
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold"
  },
  navbar: {
    position: "absolute",
    bottom: 0,
    width: "100%"
  }
});


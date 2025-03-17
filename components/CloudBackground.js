import { StyleSheet, Image, View } from "react-native";

export default function CloudBackground() {
  return (
    <View style={styles.container}>
      {/* Nuvem 1 */}
      <Image
        source={require("../assets/images/nuvem.png")}
        style={[styles.cloud, styles.cloud1]}
      />
      
      {/* Nuvem 2 */}
      <Image
        source={require("../assets/images/nuvem.png")}
        style={[styles.cloud, styles.cloud2]}
      />
      
      {/* Nuvem 3 */}
      <Image
        source={require("../assets/images/nuvem.png")}
        style={[styles.cloud, styles.cloud3]}
      />

     
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  cloud: {
    position: "absolute",
    width: 170, // Tamanho reduzido para nuvens pequenas
    height: 120, // Tamanho reduzido para nuvens pequenas
    opacity: 1, // Opacidade ajustada
  },
  cloud1: {
    top: "30%", 
    left: "-6%",
  },
  cloud2: {
    top: "33%", // Posição da segunda nuvem
    right: "-3%",
  },
  cloud3: {
    top: "33%", // Posição da terceira nuvem
    left: "30%",
  
  },
});
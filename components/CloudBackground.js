import { Image, StyleSheet, View } from "react-native";

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
    height: "55%",
    justifyContent: "center",
    alignItems: "center",
  },
  cloud: {
    position: "absolute",
    width: 200, // Tamanho reduzido para nuvens pequenas
    height: 130, // Tamanho reduzido para nuvens pequenas
    opacity: 1, // Opacidade ajustada
  },
  cloud1: {
    top: "30%", 
    left: "-10%",
  },
  cloud2: {
    top: "31%", // Posição da segunda nuvem
    right: "-15%",
  },
  cloud3: {
    top: "31%", // Posição da terceira nuvem
    left: "30%",
  
  },
});
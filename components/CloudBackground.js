import { Image, StyleSheet, View } from "react-native";

export default function CloudBackground() {
  return (
    <View style={styles.container}>
      {/* Nuvem 1 */}
      <Image
        source={require("../assets/images/component/nuvem.png")}
        style={[styles.cloud, styles.cloud1]}
      />
      
      {/* Nuvem 2 */}
      <Image
        source={require("../assets/images/component/nuvem.png")}
        style={[styles.cloud, styles.cloud2]}
      />
      
      {/* Nuvem 3 */}
      <Image
        source={require("../assets/images/component/nuvem.png")}
        style={[styles.cloud, styles.cloud3]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
    height: 250, // Altura fixa para o container
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  cloud: {
    position: "absolute",
    width: 200, // Tamanho da nuvem
    height: 130, // Tamanho da nuvem
    opacity: 1,
  },
  cloud1: {
    top: 190, // Ajuste a posição da primeira nuvem (valor em pixels)
    left: -50, // Ajuste a posição da primeira nuvem (valor em pixels)
  },
  cloud2: {
    top: 200, // Ajuste a posição da segunda nuvem (valor em pixels)
    right: -80,
    transform: [{ rotate: "155deg" }],  // Ajuste a posição da segunda nuvem (valor em pixels)
  },
  cloud3: {
    top: 200, // Ajuste a posição da terceira nuvem (valor em pixels)
    left: 115, // Ajuste a posição da terceira nuvem (valor em pixels)
  },
  
});

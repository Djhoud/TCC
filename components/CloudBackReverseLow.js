import { Image, StyleSheet, View } from "react-native";

export default function CloudBackReverse() {
  return (
    <View style={styles.container}>
      {/* Linha de cima - Nuvens normais */}
      <Image source={require("../assets/images/component/nuvem.png")} style={[styles.cloud, styles.cloud1]} />
      <Image source={require("../assets/images/component/nuvem2.png")} style={[styles.cloud, styles.cloud2, styles.rotated]} />
      <Image source={require("../assets/images/component/nuvem2.png")} style={[styles.cloud, styles.cloud3, styles.rotated]} />
      <Image source={require("../assets/images/component/nuvem.png")} style={[styles.cloud, styles.cloud4]} />
      
      {/* Mais Nuvens - Linha de cima */}
      <Image source={require("../assets/images/component/nuvem2.png")} style={[styles.cloud, styles.cloud9, styles.rotated]} />
      <Image source={require("../assets/images/component/nuvem.png")} style={[styles.cloud, styles.cloud10]} />

      {/* Linha de baixo - Nuvens opacas */}
      <Image source={require("../assets/images/component/nuvem.png")} style={[styles.cloudSmall, styles.cloud5]} />
      <Image source={require("../assets/images/component/nuvem2.png")} style={[styles.cloudSmall, styles.cloud6, styles.rotated]} />
      <Image source={require("../assets/images/component/nuvem.png")} style={[styles.cloudSmall, styles.cloud7]} />
      <Image source={require("../assets/images/component/nuvem2.png")} style={[styles.cloudSmall, styles.cloud8, styles.rotated]} />
      
      {/* Mais Nuvens - Linha de baixo */}
      <Image source={require("../assets/images/component/nuvem.png")} style={[styles.cloudSmall, styles.cloud11]} />
      <Image source={require("../assets/images/component/nuvem2.png")} style={[styles.nuvem2mall, styles.cloud12, styles.rotated]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
    height: 350, // Ajustei a altura do container
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  cloud: {
    position: "absolute",
    width: 160, // Aumentei o tamanho
    height: 110, // Aumentei o tamanho
    opacity: 1,
  },
  cloudSmall: {
    position: "absolute",
    width: 140, // Aumentei o tamanho
    height: 100, // Aumentei o tamanho
    opacity: 0.6,
  },
// Linha de cima - Nuvens normais
// Linha de cima - Nuvens normais
cloud1: { top: 371, left: -140 },
cloud2: { top: 369, left: -40 },
cloud3: { top: 376, left: 60 },
cloud4: { top: 371, left: 160 },

// Novas Nuvens - Linha de cima
cloud9: { top: 366, left: 280 },
cloud10: { top: 376, left: 380 },

// Linha de baixo - Nuvens opacas (levemente abaixo)
cloud5: { top: 391, left: -120 },
cloud6: { top: 391, left: -20 },
cloud7: { top: 401, left: 80 },
cloud8: { top: 386, left: 180 },

// Novas Nuvens - Linha de baixo
cloud11: { top: 396, left: 260 },
cloud12: { top: 401, left: 340 },

  // Estilo para girar as nuvens "nuvem2" de ponta cabeça
  rotated: {
    transform: [{ rotate: "180deg" }],
  },
});

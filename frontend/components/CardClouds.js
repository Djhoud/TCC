// components/CardClouds.js
import { Image, StyleSheet, View } from "react-native";

export default function CardClouds() {
  return (
    <View style={styles.container}>
      <Image source={require("../assets/images/component/nuvem.png")} style={[styles.cloud, styles.cloud1]} />
      <Image source={require("../assets/images/component/nuvem2.png")} style={[styles.cloud, styles.cloud2, styles.rotated]} />
      <Image source={require("../assets/images/component/nuvem.png")} style={[styles.cloud, styles.cloud3]} />
      <Image source={require("../assets/images/component/nuvem.png")} style={[styles.cloud, styles.cloud4]} />
      <Image source={require("../assets/images/component/nuvem.png")} style={[styles.cloud, styles.cloud5]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
    height: 150,
    top: 0,
    zIndex: 2,
  },
  cloud: {
    position: "absolute",
    width: 130,
    height: 116,
    zIndex: -10,
    opacity: 1, // Adicionei opacidade para ficar mais suave
  },
  cloud1: { 
    top: 90,
    left: 20,
  },
  cloud2: { 
    top: 95,
    right: 25,
    left: "70%"
  },
  cloud3: { 
    top: 100,
    left: "45%" 
  },
  cloud4: { 
    top: 100,
    left: "30%" 
  },
  cloud5: { 
    top: 100,
    left: "-10%" 
  },
  rotated: {
    transform: [{ rotate: "10deg" }],
  },
});
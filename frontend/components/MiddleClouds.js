import { Image, StyleSheet, View } from "react-native";

export default function ButtonClouds() {
  return (
    <View style={styles.container}>
      <Image source={require("../assets/images/component/nuvem.png")} style={[styles.cloud, styles.cloud1, styles.rotated]} />
      <Image source={require("../assets/images/component/nuvem2.png")} style={[styles.cloud, styles.cloud2, styles.rotated]} />
      <Image source={require("../assets/images/component/nuvem.png")} style={[styles.cloud, styles.cloud3, styles.rotated]} />
            <Image source={require("../assets/images/component/nuvem.png")} style={[styles.cloud, styles.cloud6, styles.rotated]} />
      <Image source={require("../assets/images/component/nuvem.png")} style={[styles.cloud, styles.cloud4, styles.rotated]} />
      <Image source={require("../assets/images/component/nuvem2.png")} style={[styles.cloud, styles.cloud5, styles.rotated]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    zIndex: 50,
  },
  cloud: {
    position: "absolute",
    width: 140,
    height: 100,

  },
  cloud1: { 
    top: 10, 
    left: 10,
  },
  cloud2: { 
top: 10, 
    right: 10, 
  },
  cloud3: { 
    top: 10,
    left: "35%" 
  },
  cloud4: { 
 top: 10,
    right: "40%" 
  },
  cloud5: { 
    top: 10,
    left: "-10%" 
  },
   cloud6: { 
top: 20, 
    right: -20, 
  },
  rotated: {
    transform: [{ rotate: "180deg" }],
  },
});
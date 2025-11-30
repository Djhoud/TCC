import { Image, StyleSheet, View } from "react-native";

export default function ButtonClouds() {
  return (
    <View style={styles.container}>
      <Image source={require("../assets/images/component/nuvem.png")} style={[styles.cloud, styles.cloud1]} />
      <Image source={require("../assets/images/component/nuvem2.png")} style={[styles.cloud, styles.cloud2, styles.rotated]} />
      <Image source={require("../assets/images/component/nuvem.png")} style={[styles.cloud, styles.cloud3]} />
            <Image source={require("../assets/images/component/nuvem.png")} style={[styles.cloud, styles.cloud6]} />
      <Image source={require("../assets/images/component/nuvem.png")} style={[styles.cloud, styles.cloud4]} />
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
    zIndex: 3,
  },
  cloud: {
    position: "absolute",
    width: 120,
    height: 90,

  },
  cloud1: { 
    bottom: 55, 
    left: 10,
  },
  cloud2: { 
    bottom: 55, 
    right: 30, 
  },
  cloud3: { 
    bottom: 65,
    left: "35%" 
  },
  cloud4: { 
    bottom: 60,
    right: "40%" 
  },
  cloud5: { 
    bottom: 55,
    left: "-10%" 
  },
   cloud6: { 
    bottom: 55, 
    right: -20, 
  },
  rotated: {
    transform: [{ rotate: "10deg" }],
  },
});
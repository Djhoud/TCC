import { Image, StyleSheet, View } from "react-native";

export default function CloudBackground() {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/component/nuvem.png")}
        style={[styles.cloud, styles.cloud1]}
      />
      <Image
        source={require("../assets/images/component/nuvem.png")}
        style={[styles.cloud, styles.cloud2]}
      />
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
    height: 250,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  cloud: {
    position: "absolute",
    width: 200,
    height: 130,
    opacity: 1,
  },
  cloud1: {
    top: 270,
    left: -50,
  },
  cloud2: {
    top: 280,
    right: -80,
    transform: [{ rotate: "155deg" }],
  },
  cloud3: {
    top: 290,
    left: 115,
  },
});

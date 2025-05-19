import { Image, StyleSheet, View } from "react-native";

export default function CloudBackReverse() {
  return (
    <View style={styles.container}>
      <Image source={require("../assets/images/component/nuvem.png")} style={[styles.cloud, styles.cloud1]} />
      <Image source={require("../assets/images/component/nuvem2.png")} style={[styles.cloud, styles.cloud2, styles.rotated]} />
      <Image source={require("../assets/images/component/nuvem2.png")} style={[styles.cloud, styles.cloud3, styles.rotated]} />
      <Image source={require("../assets/images/component/nuvem.png")} style={[styles.cloud, styles.cloud4]} />
      <Image source={require("../assets/images/component/nuvem2.png")} style={[styles.cloud, styles.cloud9, styles.rotated]} />
      <Image source={require("../assets/images/component/nuvem.png")} style={[styles.cloud, styles.cloud10]} />
      <Image source={require("../assets/images/component/nuvem.png")} style={[styles.cloudSmall, styles.cloud5]} />
      <Image source={require("../assets/images/component/nuvem2.png")} style={[styles.cloudSmall, styles.cloud6, styles.rotated]} />
      <Image source={require("../assets/images/component/nuvem.png")} style={[styles.cloudSmall, styles.cloud7]} />
      <Image source={require("../assets/images/component/nuvem2.png")} style={[styles.cloudSmall, styles.cloud8, styles.rotated]} />
      <Image source={require("../assets/images/component/nuvem.png")} style={[styles.cloudSmall, styles.cloud11]} />
      <Image source={require("../assets/images/component/nuvem2.png")} style={[styles.nuvem2mall, styles.cloud12, styles.rotated]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
    height: 350,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  cloud: {
    position: "absolute",
    width: 160,
    height: 110,
    opacity: 1,
  },
  cloudSmall: {
    position: "absolute",
    width: 140,
    height: 100,
    opacity: 0.6,
  },
  cloud1: { top: 160, left: -140 },
  cloud2: { top: 158, left: -40 },
  cloud3: { top: 165, left: 60 },
  cloud4: { top: 160, left: 160 },
  cloud9: { top: 155, left: 280 },
  cloud10: { top: 165, left: 380 },
  cloud5: { top: 180, left: -120 },
  cloud6: { top: 180, left: -20 },
  cloud7: { top: 190, left: 80 },
  cloud8: { top: 175, left: 180 },
  cloud11: { top: 185, left: 260 },
  cloud12: { top: 190, left: 340 },
  rotated: {
    transform: [{ rotate: "180deg" }],
  },
});

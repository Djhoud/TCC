import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Image, StyleSheet, View } from "react-native";

const { height } = Dimensions.get("window");

const SplashScreen = ({ navigation }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Aguardar 1.5s antes de iniciar a animação
    const delayBeforeSlide = setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: -height,
        duration: 2000,
        useNativeDriver: true,
      }).start();
    }, 1500);

    // Transição para login após a animação
    const totalSplashTime = 1500 + 2000 + 300; // 1.5s parada + 2s animação + 0.3s de margem
    const transitionTimeout = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => navigation.replace("Login"));
    }, totalSplashTime);

    return () => {
      clearTimeout(delayBeforeSlide);
      clearTimeout(transitionTimeout);
    };
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.topSection}>
        <Image
          source={require("../assets/images/component/Logo_fundo_azul.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Animated.View
        style={[
          styles.bottomSection,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Image source={require("../assets/images/component/nuvem.png")} style={styles.cloud1} />
        <Image source={require("../assets/images/component/nuvem2.png")} style={styles.cloud4} />
        <Image source={require("../assets/images/component/nuvem2.png")} style={styles.cloud5} />
        <Image source={require("../assets/images/component/nuvem.png")} style={styles.cloud6} />
        <Image source={require("../assets/images/component/nuvem.png")} style={styles.cloud7} />
        <Image source={require("../assets/images/component/nuvem2.png")} style={styles.cloud9} />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  topSection: {
    height: "57%",
    backgroundColor: "#3A8FFF",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  bottomSection: {
    position: "absolute",
    top: height * 0.57,
    height: height,
    width: "100%",
    backgroundColor: "#fff",
    zIndex: 2,
  },
  logo: {
    width: 300,
    height: 300,
  },
  cloud1: { position: "absolute", top: -120, left: -50, width: 200, height: 200, transform: [{ rotate: "60deg" }] },
  cloud4: { position: "absolute", top: -130, left: 310, width: 200, height: 200, transform: [{ rotate: "310deg" }] },
  cloud5: { position: "absolute", top: -70, left: 40, width: 160, height: 160 },
  cloud6: { position: "absolute", top: -60, left: 140, width: 200, height: 200 },
  cloud7: { position: "absolute", top: -100, left: 260, width: 200, height: 200 },
  cloud9: { position: "absolute", top: -60, left: 100, width: 100, height: 100 },
});

export default SplashScreen;

import React, { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, View } from "react-native";

const SplashScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      navigation.replace("Login");
    }, 3000); // tempo longo pra você brincar

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Parte azul com logo */}
      <View style={styles.topSection}>
        <Animated.Image
          source={require("../assets/images/component/Logo_fundo_azul.png")}
          style={[styles.logo, { opacity: fadeAnim }]}
          resizeMode="contain"
        />
      </View>

      {/* Parte branca com nuvens posicionadas manualmente */}
      <View style={styles.bottomSection}>
        <Image source={require("../assets/images/component/nuvem.png")} style={styles.cloud1} />
        <Image source={require("../assets/images/component/nuvem2.png")} style={styles.cloud4} />
        <Image source={require("../assets/images/component/nuvem2.png")} style={styles.cloud5} />
        <Image source={require("../assets/images/component/nuvem.png")} style={styles.cloud6} />
        <Image source={require("../assets/images/component/nuvem.png")} style={styles.cloud7} />
        <Image source={require("../assets/images/component/nuvem2.png")} style={styles.cloud9} />
        
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    height:"57%",
    backgroundColor: "#3A8FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomSection: {
    flex: 1,
    backgroundColor: "#fff", 
    zIndex:2,
  },
  logo: {
    width: 300,
    height: 300,
  },

  // nuvens com estilos individuais
  cloud1: { position: "absolute", top: -120, left: -50, width: 200, height: 200, transform: [{rotate:"60deg"}] },
  cloud4: { position: "absolute", top: -130, left: 310, width: 200, height: 200,transform: [{rotate:"310deg"}] },
  cloud5: { position: "absolute", top: -70, left: 40, width: 160, height: 160 },
  cloud6: { position: "absolute", top: -60, left: 140, width: 200, height: 200 },
  cloud7: { position: "absolute", top: -100, left: 260, width: 200, height: 200 },
  cloud9: { position: "absolute", top: -60, left: 100, width: 100, height: 100 },
});

export default SplashScreen;

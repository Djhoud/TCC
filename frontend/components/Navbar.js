import { useNavigation } from "@react-navigation/native";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

export default function Navbar() {
  const navigation = useNavigation();

  return (
    <View style={styles.navbar}>
      <TouchableOpacity onPress={() => navigation.navigate("Budget")}>
        <Image source={require("../assets/images/icons/airplane.png")} style={styles.navIcon} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Search")}>
        <Image source={require("../assets/images/icons/search.png")} style={styles.navIcon} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Main")}>
        <Image source={require("../assets/images/icons/home.png")} style={styles.navIcon} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Coffee")}>
        <Image source={require("../assets/images/icons/coffee.png")} style={styles.navIcon} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("User")}>
        <Image source={require("../assets/images/icons/user.png")} style={styles.navIcon} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#1D4780",
    paddingVertical: 10,
  },
  navIcon: {
    width: 30,
    height: 30,
  },
});

import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

export default function Navbar() {
  return (
    <View style={styles.navbar}>
      <TouchableOpacity>
        <Image source={require("../assets/images/icons/airplane.png")} style={styles.navIcon} />
      </TouchableOpacity>
      <TouchableOpacity>
        <Image source={require("../assets/images/icons/search.png")} style={styles.navIcon} />
      </TouchableOpacity>
      <TouchableOpacity>
        <Image source={require("../assets/images/icons/home.png")} style={styles.navIcon} />
      </TouchableOpacity>
      <TouchableOpacity>
        <Image source={require("../assets/images/icons/coffee.png")} style={styles.navIcon} />
      </TouchableOpacity>
      <TouchableOpacity>
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
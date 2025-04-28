import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function TravelCard({ travel }) {
  return (
    <View style={styles.card}>
      {travel.image && (
        <Image source={travel.image} style={styles.image} />
      )}
      <View style={styles.info}>
        <Text style={styles.title}>{travel.title}</Text>
        {travel.location && (
          <Text style={styles.detail}>📍 {travel.location}</Text>
        )}
        {travel.date && (
          <Text style={styles.detail}>📅 {travel.date}</Text>
        )}
        {travel.stars !== undefined && (
          <View style={styles.stars}>
            {[...Array(5)].map((_, i) => (
              <FontAwesome
                key={i}
                name="star"
                size={20}
                color={i < travel.stars ? "#FFD700" : "#ccc"}
                style={{ marginRight: 3 }}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 15,
    flexDirection: "row",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    marginHorizontal: 10,
    overflow: "hidden",
  },
  image: {
    width: 100,
    height: 100,
  },
  info: {
    flex: 1,
    padding: 10,
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  detail: {
    fontSize: 14,
    color: "#555",
  },
  stars: {
    flexDirection: "row",
    marginTop: 5,
  },
});

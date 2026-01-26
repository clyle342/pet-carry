import { useUser } from "@clerk/clerk-expo";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import RideCard from "@/components/RideCard";
import { images } from "@/app/constants";
import { useFetch } from "@/lib/fetch";
import { Ride } from "@/types/type";

const Rides = () => {
  const { user } = useUser();

  // Fetch rides from API
  const {
    data: recentRides,
    loading,
    error,
  } = useFetch<Ride[]>(`/(api)/ride/${user?.id}`);

  // --- Hardcoded fallback rides (Brisbane & Gold Coast) ---
  const fallbackRides: Ride[] = [
    {
      ride_id: "1",
      origin_address: "South Bank, Brisbane QLD",
      destination_address: "Fortitude Valley, Brisbane QLD",
      origin_latitude: "-27.4810",
      origin_longitude: "153.0235",
      destination_latitude: "-27.4580",
      destination_longitude: "153.0350",
      ride_time: 12,
      fare_price: "18.50",
      payment_status: "paid",
      driver_id: 1,
      user_id: user?.id || "1",
      created_at: "2024-10-04 09:24:00",
      driver: {
        driver_id: "1",
        first_name: "Liam",
        last_name: "Anderson",
        profile_image_url:
          "https://ucarecdn.com/6ea6d83d-ef1a-483f-9106-837a3a5b3f67/-/preview/1000x666/",
        car_image_url:
          "https://ucarecdn.com/a2dc52b2-8bf7-4e49-9a36-3ffb5229ed02/-/preview/465x466/",
        car_seats: 4,
        rating: "4.85",
      },
    },
    {
      ride_id: "2",
      origin_address: "Brisbane Airport QLD",
      destination_address: "Kangaroo Point, Brisbane QLD",
      origin_latitude: "-27.3842",
      origin_longitude: "153.1175",
      destination_latitude: "-27.4756",
      destination_longitude: "153.0363",
      ride_time: 24,
      fare_price: "45.00",
      payment_status: "paid",
      driver_id: 2,
      user_id: user?.id || "1",
      created_at: "2024-10-10 14:12:00",
      driver: {
        driver_id: "2",
        first_name: "Emily",
        last_name: "Brown",
        profile_image_url:
          "https://ucarecdn.com/dae59f69-2c1f-48c3-a883-017bcf0f9950/-/preview/1000x666/",
        car_image_url:
          "https://ucarecdn.com/289764fb-55b6-4427-b1d1-f655987b4a14/-/preview/930x932/",
        car_seats: 5,
        rating: "4.70",
      },
    },
    {
      ride_id: "3",
      origin_address: "Surfers Paradise, Gold Coast QLD",
      destination_address: "Burleigh Heads, Gold Coast QLD",
      origin_latitude: "-28.0027",
      origin_longitude: "153.4290",
      destination_latitude: "-28.0945",
      destination_longitude: "153.4458",
      ride_time: 17,
      fare_price: "29.00",
      payment_status: "paid",
      driver_id: 3,
      user_id: user?.id || "1",
      created_at: "2024-10-18 16:05:00",
      driver: {
        driver_id: "3",
        first_name: "Sophie",
        last_name: "Taylor",
        profile_image_url:
          "https://ucarecdn.com/0330d85c-232e-4c30-bd04-e5e4d0e3d688/-/preview/826x822/",
        car_image_url:
          "https://ucarecdn.com/a3872f80-c094-409c-82f8-c9ff38429327/-/preview/930x932/",
        car_seats: 4,
        rating: "4.90",
      },
    },
    {
      ride_id: "4",
      origin_address: "Broadbeach, Gold Coast QLD",
      destination_address: "Coolangatta Airport, Gold Coast QLD",
      origin_latitude: "-28.0297",
      origin_longitude: "153.4318",
      destination_latitude: "-28.1650",
      destination_longitude: "153.5050",
      ride_time: 28,
      fare_price: "56.00",
      payment_status: "paid",
      driver_id: 4,
      user_id: user?.id || "1",
      created_at: "2024-10-22 11:30:00",
      driver: {
        driver_id: "4",
        first_name: "Noah",
        last_name: "Smith",
        profile_image_url:
          "https://ucarecdn.com/289764fb-55b6-4427-b1d1-f655987b4a14/-/preview/930x932/",
        car_image_url:
          "https://ucarecdn.com/a3872f80-c094-409c-82f8-c9ff38429327/-/preview/930x932/",
        car_seats: 4,
        rating: "4.75",
      },
    },
    {
      ride_id: "5",
      origin_address: "Brisbane City QLD",
      destination_address: "Toowong, Brisbane QLD",
      origin_latitude: "-27.4698",
      origin_longitude: "153.0251",
      destination_latitude: "-27.4850",
      destination_longitude: "152.9936",
      ride_time: 10,
      fare_price: "16.50",
      payment_status: "paid",
      driver_id: 5,
      user_id: user?.id || "1",
      created_at: "2024-10-29 18:45:00",
      driver: {
        driver_id: "5",
        first_name: "Isabella",
        last_name: "Clark",
        profile_image_url:
          "https://ucarecdn.com/6ea6d83d-ef1a-483f-9106-837a3a5b3f67/-/preview/1000x666/",
        car_image_url:
          "https://ucarecdn.com/a2dc52b2-8bf7-4e49-9a36-3ffb5229ed02/-/preview/465x466/",
        car_seats: 4,
        rating: "4.88",
      },
    },
  ];

  // Use API data if available, otherwise fallback
  const ridesToShow =
    recentRides && recentRides.length > 0 ? recentRides : fallbackRides;

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      <FlatList
        data={ridesToShow}
        renderItem={({ item }) => <RideCard ride={item} />}
        keyExtractor={(item, index) => index.toString()}
        className="px-5"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        ListHeaderComponent={
          <View className="mt-5 mb-3">
            <Text className="text-2xl font-JakartaExtraBold">
              Your Trip History
            </Text>
            <Text className="text-base text-gray-600 mt-1">
              View your recent trips and trip details
            </Text>
          </View>
        }
        ListEmptyComponent={() => (
          <View className="flex flex-col items-center justify-center mt-10">
            {loading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : error ? (
              <Text className="text-sm text-red-500 mt-2">
                Failed to load rides. Showing fallback rides.
              </Text>
            ) : (
              <>
                <Image
                  source={images.noResult}
                  className="w-40 h-40"
                  resizeMode="contain"
                />
                <Text className="text-sm mt-2 text-gray-500">
                  No recent trips found
                </Text>
              </>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default Rides;

import { useUser } from "@clerk/clerk-expo";
import { useState } from "react";
import {
  Alert,
  Image,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import RideLayout from "@/components/RideLayout";
import Payment from "@/components/Payment";
import InputField from "@/components/InputField";
import { icons } from "../constants";
import { formatTime } from "@/lib/utils";
import { useDriverStore, useLocationStore } from "@/store";
import { StripeProvider } from "@stripe/stripe-react-native";

const BookRide = () => {
  const { user } = useUser();
  const {
    userAddress,
    destinationAddress,
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();
  const { drivers, selectedDriver } = useDriverStore();
  const [petName, setPetName] = useState("");
  const [species, setSpecies] = useState<"" | "dog" | "cat" | "other">("");
  const [size, setSize] = useState<"" | "small" | "medium" | "large">("");
  const [crateRequired, setCrateRequired] = useState(false);
  const [specialNotes, setSpecialNotes] = useState("");
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const driverDetails = drivers?.filter(
    (driver) => +driver.id === selectedDriver
  )[0];
  const isPetDetailsValid = Boolean(petName.trim()) && Boolean(species);

  const handlePetDetailsInvalid = () => {
    setShowValidationErrors(true);
    Alert.alert(
      "Pet details required",
      "Please provide your pet's name and species before booking."
    );
  };

  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
      merchantIdentifier="merchant.com.petcarry"
      urlScheme="myapp"
    >
      <RideLayout title="Book Trip">
        <>
          <Text className="text-xl font-JakartaSemiBold mb-3">
            Trip Information
          </Text>

          <View className="flex flex-col w-full items-center justify-center mt-10">
            <Image
              source={{ uri: driverDetails?.profile_image_url }}
              className="w-28 h-28 rounded-full"
            />

            <View className="flex flex-row items-center justify-center mt-5 space-x-2">
              <Text className="text-lg font-JakartaSemiBold">
                {driverDetails?.title}
              </Text>

              <View className="flex flex-row items-center space-x-0.5">
                <Image
                  source={icons.star}
                  className="w-5 h-5"
                  resizeMode="contain"
                />
                <Text className="text-lg font-JakartaRegular">
                  {driverDetails?.rating}
                </Text>
              </View>
            </View>
          </View>

          <View className="flex flex-col w-full items-start justify-center py-3 px-5 rounded-3xl bg-general-600 mt-5">
            <View className="flex flex-row items-center justify-between w-full border-b border-white py-3">
              <Text className="text-lg font-JakartaRegular">Trip Price</Text>
              <Text className="text-lg font-JakartaRegular text-[#0CC25F]">
                ${driverDetails?.price}
              </Text>
            </View>

            <View className="flex flex-row items-center justify-between w-full border-b border-white py-3">
              <Text className="text-lg font-JakartaRegular">Pickup Time</Text>
              <Text className="text-lg font-JakartaRegular">
                {formatTime(driverDetails?.time!)}
              </Text>
            </View>

            <View className="flex flex-row items-center justify-between w-full py-3">
              <Text className="text-lg font-JakartaRegular">Car Seats</Text>
              <Text className="text-lg font-JakartaRegular">
                {driverDetails?.car_seats}
              </Text>
            </View>
          </View>

          <View className="flex flex-col w-full items-start justify-center mt-5">
            <View className="flex flex-row items-center justify-start mt-3 border-t border-b border-general-700 w-full py-3">
              <Image source={icons.to} className="w-6 h-6" />
              <Text className="text-lg font-JakartaRegular ml-2">
                {userAddress}
              </Text>
            </View>

            <View className="flex flex-row items-center justify-start border-b border-general-700 w-full py-3">
              <Image source={icons.point} className="w-6 h-6" />
              <Text className="text-lg font-JakartaRegular ml-2">
                {destinationAddress}
              </Text>
            </View>
          </View>

          <View className="flex flex-col w-full items-start justify-center mt-6">
            <Text className="text-xl font-JakartaSemiBold mb-3">
              Pet Details
            </Text>

            <InputField
              label="Pet Name"
              placeholder="e.g., Bella"
              value={petName}
              onChangeText={setPetName}
            />
            {showValidationErrors && !petName.trim() && (
              <Text className="text-sm text-red-500 -mt-1 mb-2">
                Pet name is required.
              </Text>
            )}

            <Text className="text-lg font-JakartaSemiBold mt-3 mb-2">
              Species
            </Text>
            <View className="flex flex-row flex-wrap">
              {["dog", "cat", "other"].map((option) => (
                <View key={option} className="mr-2 mb-2">
                  <TouchableOpacity
                    onPress={() =>
                      setSpecies(option as "dog" | "cat" | "other")
                    }
                    className={`px-4 py-2 rounded-full border ${
                      species === option
                        ? "bg-general-600 border-general-600"
                        : "bg-white border-general-700"
                    }`}
                  >
                    <Text
                      className={`${
                        species === option
                          ? "font-JakartaSemiBold"
                          : "font-JakartaRegular"
                      }`}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            {showValidationErrors && !species && (
              <Text className="text-sm text-red-500 mb-2">
                Species is required.
              </Text>
            )}

            <Text className="text-lg font-JakartaSemiBold mt-3 mb-2">
              Size
            </Text>
            <View className="flex flex-row flex-wrap">
              {["small", "medium", "large"].map((option) => (
                <View key={option} className="mr-2 mb-2">
                  <TouchableOpacity
                    onPress={() =>
                      setSize(option as "small" | "medium" | "large")
                    }
                    className={`px-4 py-2 rounded-full border ${
                      size === option
                        ? "bg-general-600 border-general-600"
                        : "bg-white border-general-700"
                    }`}
                  >
                    <Text
                      className={`${
                        size === option
                          ? "font-JakartaSemiBold"
                          : "font-JakartaRegular"
                      }`}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View className="flex flex-row items-center justify-between w-full mt-3">
              <Text className="text-lg font-JakartaSemiBold">
                Crate Required
              </Text>
              <Switch value={crateRequired} onValueChange={setCrateRequired} />
            </View>

            <Text className="text-lg font-JakartaSemiBold mt-4 mb-2">
              Special Notes
            </Text>
            <TextInput
              className="w-full min-h-[90px] rounded-2xl p-4 font-JakartaSemiBold text-[15px] bg-neutral-100 border border-neutral-100"
              placeholder="Add any special instructions"
              multiline
              textAlignVertical="top"
              value={specialNotes}
              onChangeText={setSpecialNotes}
            />
          </View>

          {/* Payment Component */}
          <Payment
            fullName={user?.fullName!}
            email={user?.emailAddresses[0].emailAddress!}
            amount={driverDetails?.price!}
            driverId={driverDetails?.id}
            rideTime={driverDetails?.time!}
            userId={user?.id}
            originAddress={userAddress ?? ""}
            destinationAddress={destinationAddress ?? ""}
            originLatitude={userLatitude ?? undefined}
            originLongitude={userLongitude ?? undefined}
            destinationLatitude={destinationLatitude ?? undefined}
            destinationLongitude={destinationLongitude ?? undefined}
            petName={petName}
            species={species}
            size={size}
            crateRequired={crateRequired}
            specialNotes={specialNotes}
            isPetDetailsValid={isPetDetailsValid}
            onPetDetailsInvalid={handlePetDetailsInvalid}
          />
        </>
      </RideLayout>
    </StripeProvider>
  );
};

export default BookRide;

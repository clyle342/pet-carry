import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Image, Text, View } from "react-native";
import { ReactNativeModal } from "react-native-modal";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { images } from "@/app/constants";
import { fetchAPI } from "@/lib/fetch";
import { useLocationStore } from "@/store";

const normalizePhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0") && digits.length === 10) {
    return `254${digits.slice(1)}`;
  }
  if (digits.startsWith("7") && digits.length === 9) return `254${digits}`;
  if (digits.startsWith("1") && digits.length === 9) return `254${digits}`;
  return digits;
};

const isValidMpesaPhone = (value: string) => /^254[71]\d{8}$/.test(value);

type PaymentStatus = "idle" | "pending" | "success" | "failed";

type PaymentProps = {
  fullName?: string;
  email?: string;
  amount?: number;
  driverId?: number;
  rideTime?: number;
  userId?: string;
};

const Payment = ({
  fullName,
  email,
  amount,
  driverId,
  rideTime,
  userId,
}: PaymentProps) => {
  const {
    userAddress,
    destinationAddress,
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();
  const [phone, setPhone] = useState("");
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [statusMessage, setStatusMessage] = useState(
    "Awaiting confirmation on your phone."
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const safeAmount = useMemo(() => Number(amount ?? 0), [amount]);

  const statusSource = (
    process.env.EXPO_PUBLIC_PAYMENT_STATUS_SOURCE || "payment"
  ).toLowerCase();

  const pollStatus = async (currentBookingId: number) => {
    const response =
      statusSource === "ride"
        ? await fetchAPI(`/(api)/ride/status/${currentBookingId}`)
        : await fetchAPI(`/(api)/payments/mpesa/status/${currentBookingId}`);
    const paymentStatus =
      statusSource === "ride"
        ? (response?.data?.payment_status as string | undefined)
        : (response?.data?.status as string | undefined);
    const resultDesc = response?.data?.resultDesc as string | undefined;

    if (paymentStatus === "SUCCESS") {
      setStatus("success");
      return true;
    }

    if (paymentStatus === "FAILED") {
      setStatus("failed");
      setStatusMessage(resultDesc || "Payment failed. Please try again.");
      return true;
    }

    return false;
  };

  useEffect(() => {
    if (status !== "pending" || !bookingId) return;

    let isActive = true;
    let attempts = 0;

    const interval = setInterval(async () => {
      if (!isActive) return;
      attempts += 1;
      try {
        const resolved = await pollStatus(bookingId);
        if (resolved) {
          clearInterval(interval);
          return;
        }
        if (attempts >= 12) {
          setStatusMessage(
            "Payment is still pending. Please check your phone to complete the STK prompt."
          );
        }
      } catch (error) {
        console.error("Error polling payment status:", error);
      }
    }, 5000);

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [bookingId, status]);

  useEffect(() => {
    if (status !== "failed") return;

    Alert.alert("Payment failed", statusMessage);
    setStatus("idle");
  }, [status, statusMessage]);

  const handlePayment = async () => {
    const normalizedPhone = normalizePhoneNumber(phone);

    if (!normalizedPhone || !isValidMpesaPhone(normalizedPhone)) {
      Alert.alert(
        "Invalid phone number",
        "Enter a Safaricom number in format 07XXXXXXXX or 2547XXXXXXXX."
      );
      return;
    }

    if (!Number.isFinite(safeAmount) || safeAmount <= 0) {
      Alert.alert("Invalid amount", "Enter a valid amount to pay.");
      return;
    }

    if (!driverId || !rideTime || !userId) {
      Alert.alert(
        "Missing booking details",
        "Please select a driver and try again."
      );
      return;
    }

    if (
      !userAddress ||
      !destinationAddress ||
      !userLatitude ||
      !userLongitude ||
      !destinationLatitude ||
      !destinationLongitude
    ) {
      Alert.alert(
        "Missing trip details",
        "Please confirm your pickup and drop-off locations."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const rideResponse = await fetchAPI("/(api)/ride/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin_address: userAddress,
          destination_address: destinationAddress,
          origin_latitude: userLatitude,
          origin_longitude: userLongitude,
          destination_latitude: destinationLatitude,
          destination_longitude: destinationLongitude,
          ride_time: rideTime.toFixed(0),
          fare_price: Math.round(safeAmount),
          payment_status: "PENDING",
          driver_id: driverId,
          user_id: userId,
        }),
      });

      const rideId = Number(rideResponse?.data?.ride_id ?? rideResponse?.data?.id);

      if (!rideId) {
        throw new Error("Failed to create booking.");
      }

      setBookingId(rideId);

      const stkResponse = await fetchAPI("/(api)/payments/mpesa/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: rideId,
          phone: normalizedPhone,
          amount: Math.round(safeAmount),
          customerName: fullName || email?.split("@")[0] || "Pet Carry Rider",
        }),
      });

      if (!stkResponse?.data?.checkoutRequestId) {
        throw new Error("Failed to initiate M-Pesa payment.");
      }

      setStatus("pending");
      setStatusMessage("Awaiting confirmation on your phone.");
    } catch (error) {
      console.error("Payment error:", error);
      Alert.alert(
        "Payment error",
        (error as Error).message || "Unable to start M-Pesa payment."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <InputField
        label="M-Pesa Phone Number"
        placeholder="07XXXXXXXX"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <CustomButton
        title={`Pay KES ${Number(amount ?? 0).toFixed(2)}`}
        className="my-10"
        onPress={handlePayment}
        disabled={isSubmitting}
      />

      <ReactNativeModal
        isVisible={status === "pending"}
        onBackdropPress={() => setStatus("idle")}
      >
        <View className="flex flex-col items-center justify-center bg-white p-7 rounded-2xl">
          <Image source={images.check} className="w-28 h-28 mt-5" />
          <Text className="text-2xl text-center font-JakartaBold mt-5">
            Awaiting M-Pesa confirmation
          </Text>
          <Text className="text-md text-general-200 font-JakartaRegular text-center mt-3">
            {statusMessage}
          </Text>
          <CustomButton
            title="Refresh Status"
            onPress={() => bookingId && pollStatus(bookingId)}
            className="mt-5"
          />
        </View>
      </ReactNativeModal>

      <ReactNativeModal
        isVisible={status === "success"}
        onBackdropPress={() => setStatus("idle")}
      >
        <View className="flex flex-col items-center justify-center bg-white p-7 rounded-2xl">
          <Image source={images.check} className="w-28 h-28 mt-5" />
          <Text className="text-2xl text-center font-JakartaBold mt-5">
            Booking placed successfully
          </Text>
          <Text className="text-md text-general-200 font-JakartaRegular text-center mt-3">
            Thank you for your booking. Your reservation has been successfully
            placed. Please proceed with your trip.
          </Text>
          <CustomButton
            title="Back Home"
            onPress={() => {
              setStatus("idle");
              router.push("/(root)/(tabs)/home");
            }}
            className="mt-5"
          />
        </View>
      </ReactNativeModal>
    </>
  );
};

export default Payment;

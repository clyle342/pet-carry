import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Image, Text, View } from "react-native";
import { ReactNativeModal } from "react-native-modal";

import CustomButton from "@/components/CustomButton";
import { images } from "@/app/constants";
import { fetchAPI } from "@/lib/fetch";
import InputField from "@/components/InputField";
import { useLocationStore } from "@/store";

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
    userLatitude,
    userLongitude,
    userAddress,
    destinationLatitude,
    destinationLongitude,
    destinationAddress,
  } = useLocationStore();
  const [success, setSuccess] = useState(false);
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "IDLE" | "PENDING" | "SUCCESS" | "FAILED"
  >("IDLE");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const safeAmount = useMemo(() => amount ?? 10.99, [amount]);
  const isValidPhone = useMemo(() => {
    const digits = phone.replace(/[^0-9]/g, "");
    return digits.length === 10 || digits.length === 12;
  }, [phone]);
  const canSubmit = useMemo(
    () => isValidPhone && safeAmount > 0 && !isSubmitting,
    [isValidPhone, safeAmount, isSubmitting]
  );

  const createPendingRide = async () => {
    if (
      bookingId ||
      !driverId ||
      !rideTime ||
      !userId ||
      !userLatitude ||
      !userLongitude ||
      !destinationLatitude ||
      !destinationLongitude ||
      !userAddress ||
      !destinationAddress
    ) {
      return bookingId;
    }

    const response = await fetchAPI("/(api)/ride/create", {
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
        fare_price: Math.round(safeAmount * 100),
        payment_status: "pending",
        driver_id: driverId,
        user_id: userId,
      }),
    });
    if (response?.data?.ride_id) {
      setBookingId(String(response.data.ride_id));
      return String(response.data.ride_id);
    }
    return bookingId;
  };

  const startMpesaPayment = async () => {
    if (!canSubmit) {
      Alert.alert(
        "Missing details",
        "Please enter a valid phone number (e.g. 07XXXXXXXX or 2547XXXXXXXX)."
      );
      return;
    }

    setIsSubmitting(true);
    setPaymentStatus("PENDING");
    try {
      const resolvedBookingId = await createPendingRide();
      const response = await fetchAPI("/(api)/payments/mpesa/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          amount: Math.round(safeAmount),
          bookingId: resolvedBookingId ?? userId ?? "guest",
        }),
      });

      if (response?.data?.paymentId) {
        setPaymentId(response.data.paymentId);
      } else {
        throw new Error("Failed to initiate payment.");
      }
    } catch (error) {
      console.error(error);
      setPaymentStatus("FAILED");
      Alert.alert("Payment error", "Unable to initiate M-Pesa payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!paymentId || paymentStatus !== "PENDING") return;
    let isActive = true;

    const pollStatus = async () => {
      try {
        const response = await fetchAPI(
          `/(api)/payments/mpesa/status?id=${paymentId}`
        );
        const status = response?.data?.status as
          | "PENDING"
          | "SUCCESS"
          | "FAILED"
          | undefined;
        if (!isActive || !status) return;

        if (status === "SUCCESS") {
          setPaymentStatus("SUCCESS");
          setSuccess(true);
        } else if (status === "FAILED") {
          setPaymentStatus("FAILED");
          Alert.alert(
            "Payment failed",
            response?.data?.resultDesc ??
              "Please try again or use a different number."
          );
        }
      } catch (error) {
        console.error("Status poll error:", error);
      }
    };

    const interval = setInterval(pollStatus, 5000);
    pollStatus();

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [paymentId, paymentStatus]);

  return (
    <>
      <InputField
        label="M-Pesa Phone Number"
        placeholder="e.g. 2547XXXXXXXX"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      {paymentStatus === "PENDING" && (
        <Text className="text-sm text-general-200 font-JakartaRegular mt-2">
          Waiting for M-Pesa prompt on your phone. Please complete the payment.
        </Text>
      )}
      <CustomButton
        title={`Pay KES ${Number(safeAmount).toFixed(2)}`}
        className="my-10"
        onPress={startMpesaPayment}
        disabled={!canSubmit}
      />

      <ReactNativeModal
        isVisible={success}
        onBackdropPress={() => setSuccess(false)}
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
              setSuccess(false);
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

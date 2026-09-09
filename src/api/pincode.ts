import api from './axios';

export interface DeliveryInfo {
  serviceable: boolean;
  codAvailable: boolean;
  estimatedDays: number;
  shippingCharge: number;
  courierPartner: string;
  insuranceIncluded: boolean;
}

export interface PincodeData {
  valid: boolean;
  pincode: string;
  city: string;
  district: string;
  state: string;
  country: string;
  postOffices: string[];
  delivery: DeliveryInfo;
  isEstimated?: boolean;
}

export interface PincodeLookupResponse {
  success: boolean;
  valid?: boolean;
  message?: string;
  data?: PincodeData;
}

export interface PincodeVerifyResponse {
  success: boolean;
  data?: {
    isValid: boolean;
    isMatch: boolean;
    cityMatch: boolean;
    stateMatch: boolean;
    message: string;
    delivery?: DeliveryInfo;
  };
}

export const lookupPincode = async (pincode: string): Promise<PincodeLookupResponse> => {
  try {
    const res = await api.get(`/pincode/${pincode.trim()}`);
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      valid: false,
      message: err.response?.data?.message || 'Invalid or unserviceable PIN code'
    };
  }
};

export const verifyCityAndPincode = async (
  pincode: string,
  city: string,
  state?: string
): Promise<PincodeVerifyResponse> => {
  try {
    const res = await api.post('/pincode/verify', {
      pincode: pincode.trim(),
      city: city.trim(),
      state: state ? state.trim() : undefined
    });
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      data: {
        isValid: false,
        isMatch: false,
        cityMatch: false,
        stateMatch: false,
        message: err.response?.data?.message || 'Verification failed'
      }
    };
  }
};

export const lookupCity = async (cityName: string) => {
  try {
    const res = await api.get(`/pincode/city/${encodeURIComponent(cityName.trim())}`);
    return res.data;
  } catch (err) {
    return { success: false, data: [] };
  }
};

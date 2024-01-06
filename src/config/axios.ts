import axios from "axios";
import { GOOGLE_ADS_API_BASE_URL } from "./api";

export const axiosGoogleAds = axios.create({
  baseURL: GOOGLE_ADS_API_BASE_URL,
});

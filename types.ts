export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface SearchResult extends Address {
  placeName: string; // e.g. "Headquarters" or "Manchester Office"
}

export interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface CompanyInfo {
  name: string;
  natureOfBusiness: string;
  phone: string;
  address: Address;
}

export interface RegistrationData {
  sessionId: string;
  cpdType: string;
  timestamp: string;
  contact: ContactInfo;
  company: CompanyInfo;
}

export interface FormErrors {
  [key: string]: string;
}

export const NATURE_OF_BUSINESS_OPTIONS = [
  "UK & Irish Galvanizer",
  "International Galvanizer",
  "Suppliers",
  "Zinc Supplier",
  "Other"
];

export const INITIAL_ADDRESS: Address = {
  street: '',
  city: '',
  postalCode: '',
  country: 'United Kingdom'
};

export const INITIAL_CONTACT: ContactInfo = {
  firstName: '',
  lastName: '',
  email: '',
  phone: ''
};

export const INITIAL_COMPANY: CompanyInfo = {
  name: '',
  natureOfBusiness: NATURE_OF_BUSINESS_OPTIONS[0],
  phone: '',
  address: INITIAL_ADDRESS
};
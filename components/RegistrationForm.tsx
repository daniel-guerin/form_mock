import React, { useState, useEffect, FormEvent } from 'react';
import { 
  MapPin, 
  Search, 
  Loader2, 
  CheckCircle, 
  Building2, 
  User, 
  Send,
  AlertTriangle,
  X,
  ChevronRight
} from 'lucide-react';
import { 
  ContactInfo, 
  CompanyInfo, 
  INITIAL_CONTACT, 
  INITIAL_COMPANY, 
  NATURE_OF_BUSINESS_OPTIONS,
  FormErrors,
  SearchResult
} from '../types';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { findCompanyLocations } from '../services/geminiService';
import { submitRegistration } from '../services/webhookService';

export const RegistrationForm: React.FC = () => {
  // State
  const [contact, setContact] = useState<ContactInfo>(INITIAL_CONTACT);
  const [company, setCompany] = useState<CompanyInfo>(INITIAL_COMPANY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Search State
  const [isAddressSearching, setIsAddressSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // URL Params
  const [sessionId, setSessionId] = useState('');
  const [cpdType, setCpdType] = useState('');

  // Load URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSessionId(params.get('session_id') || 'unknown');
    setCpdType(params.get('cpd_type') || 'general');
  }, []);

  // Handlers for Contact Info
  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContact(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handlers for Company Info
  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCompany(prev => ({ ...prev, [name]: value }));
    
    // Reset search UI if name changes
    if (name === 'name') {
        setShowResults(false);
        setHasSearched(false);
    }

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handlers for Address Info
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCompany(prev => ({
      ...prev,
      address: { ...prev.address, [name]: value }
    }));
    if (errors[`address.${name}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`address.${name}`];
        return newErrors;
      });
    }
  };

  // AI Address Lookup
  const handleAddressLookup = async () => {
    if (!company.name || company.name.length < 3) {
      setErrors(prev => ({ ...prev, name: "Please enter a company name to search" }));
      return;
    }

    setIsAddressSearching(true);
    setSearchResults([]);
    setShowResults(false);
    setHasSearched(true);

    try {
      const results = await findCompanyLocations(company.name);
      setSearchResults(results);
      setShowResults(true);
    } catch (err) {
      console.error(err);
      setSearchResults([]);
    } finally {
      setIsAddressSearching(false);
    }
  };

  const selectAddress = (result: SearchResult) => {
    setCompany(prev => ({
      ...prev,
      address: {
        street: result.street || '',
        city: result.city || '',
        postalCode: result.postalCode || '',
        country: result.country || 'United Kingdom'
      }
    }));
    setShowResults(false);
    // Clear address errors
    setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors['address.street'];
        delete newErrors['address.city'];
        delete newErrors['address.postalCode'];
        delete newErrors['address.country'];
        return newErrors;
    });
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Contact
    if (!contact.firstName.trim()) newErrors.firstName = "First name is required";
    if (!contact.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!contact.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) newErrors.email = "Invalid email format";
    if (!contact.phone.trim()) newErrors.phone = "Phone number is required";

    // Company
    if (!company.name.trim()) newErrors.name = "Company name is required";
    if (!company.phone.trim()) newErrors.companyPhone = "Company phone is required";
    if (!company.address.street.trim()) newErrors['address.street'] = "Street address is required";
    if (!company.address.city.trim()) newErrors['address.city'] = "City is required";
    if (!company.address.postalCode.trim()) newErrors['address.postalCode'] = "Postal code is required";
    if (!company.address.country.trim()) newErrors['address.country'] = "Country is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      // Scroll to top error
      const firstError = document.querySelector('.text-ga-error');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);

    const payload = {
      sessionId,
      cpdType,
      timestamp: new Date().toISOString(),
      contact,
      company: {
        name: company.name,
        natureOfBusiness: company.natureOfBusiness,
        phone: company.phone,
        address: company.address
      }
    };

    try {
      await submitRegistration(payload);
      setSubmissionStatus('success');
    } catch (error) {
      setSubmissionStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submissionStatus === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 py-12 animate-fade-in">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <CheckCircle size={48} />
        </div>
        <h2 className="text-2xl font-bold text-ga-dark mb-2">Registration Complete!</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          Thank you, {contact.firstName}. Your details have been submitted successfully. Your certificate will be emailed to <strong>{contact.email}</strong> shortly.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-ga-blue text-white rounded-lg font-semibold hover:brightness-110 transition-all shadow-md"
        >
          Register Another Person
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto pb-24 animate-fade-in">
      
      {submissionStatus === 'error' && (
        <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertTriangle className="text-ga-error shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800">Submission Failed</h3>
            <p className="text-sm text-red-700">Please check your connection and try again, or contact the event organizer.</p>
          </div>
        </div>
      )}

      {/* Section 1: Personal Info */}
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-2">
          <User className="text-ga-blue" size={24} />
          <h2 className="text-xl font-bold text-ga-dark">Your Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name"
            name="firstName"
            value={contact.firstName}
            onChange={handleContactChange}
            error={errors.firstName}
            isValid={!!contact.firstName && !errors.firstName}
            placeholder="e.g. Jane"
            required
          />
          <Input
            label="Last Name"
            name="lastName"
            value={contact.lastName}
            onChange={handleContactChange}
            error={errors.lastName}
            isValid={!!contact.lastName && !errors.lastName}
            placeholder="e.g. Doe"
            required
          />
        </div>
        
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={contact.email}
          onChange={handleContactChange}
          error={errors.email}
          isValid={!!contact.email && !errors.email}
          placeholder="name@company.com"
          required
        />
        
        <Input
          label="Phone Number"
          type="tel"
          name="phone"
          value={contact.phone}
          onChange={handleContactChange}
          error={errors.phone}
          isValid={!!contact.phone && !errors.phone}
          placeholder="07123 456789"
          required
        />
      </div>

      {/* Section 2: Company Info */}
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-2">
          <Building2 className="text-ga-blue" size={24} />
          <h2 className="text-xl font-bold text-ga-dark">Company Information</h2>
        </div>

        <div className="mb-6 relative">
           <label className="block text-sm font-semibold text-ga-dark mb-1.5">
             Company Name <span className="text-ga-error">*</span>
           </label>
           <div className="flex gap-2 flex-col sm:flex-row">
             <div className="relative flex-grow">
                <input
                  className={`
                    w-full px-4 py-3 rounded-lg border text-base transition-all duration-200 outline-none appearance-none
                    ${errors.name 
                      ? 'border-ga-error bg-red-50 focus:ring-2 focus:ring-red-200' 
                      : 'border-gray-300 bg-white focus:border-ga-blue focus:ring-2 focus:ring-blue-100'
                    }
                  `}
                  name="name"
                  value={company.name}
                  onChange={handleCompanyChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddressLookup();
                    }
                  }}
                  placeholder="Enter company name"
                  autoComplete="organization"
                />
             </div>
             <button
                type="button"
                onClick={handleAddressLookup}
                disabled={isAddressSearching || !company.name}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-ga-blue text-white font-semibold rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm whitespace-nowrap"
             >
               {isAddressSearching ? <Loader2 className="animate-spin" size={20}/> : <Search size={20}/>}
               Find Address
             </button>
           </div>
           
           {/* Address Search Results Dropdown/List */}
           {showResults && (
             <div className="mt-3 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden animate-fade-in relative z-10">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {searchResults.length > 0 ? `Found ${searchResults.length} Location${searchResults.length > 1 ? 's' : ''}` : 'No Matches Found'}
                  </span>
                  <button 
                    onClick={() => setShowResults(false)} 
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
                
                {searchResults.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto divide-y divide-gray-100">
                    {searchResults.map((result, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => selectAddress(result)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center gap-3 group"
                      >
                        <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 text-ga-blue flex items-center justify-center">
                          <MapPin size={16} />
                        </div>
                        <div className="grow">
                          <p className="font-semibold text-ga-dark text-sm">{result.placeName}</p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                            {result.street}, {result.city}, {result.postalCode}, {result.country}
                          </p>
                        </div>
                        <ChevronRight size={16} className="text-gray-300 group-hover:text-ga-blue" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-sm text-gray-600 mb-2">We couldn't find a specific match on Google Maps.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowResults(false);
                        document.getElementById('addr-street')?.focus();
                      }}
                      className="text-sm font-semibold text-ga-blue hover:underline"
                    >
                      Enter address manually below
                    </button>
                  </div>
                )}
             </div>
           )}

           {errors.name && <p className="mt-1.5 text-sm text-ga-error font-medium">{errors.name}</p>}
        </div>

        <Select
          label="Nature of Business"
          name="natureOfBusiness"
          value={company.natureOfBusiness}
          onChange={handleCompanyChange}
          options={NATURE_OF_BUSINESS_OPTIONS}
          required
        />

        <Input
          label="Company Phone"
          type="tel"
          name="phone" // Maps to company.phone due to distinct state objects in logic below
          value={company.phone}
          onChange={(e) => {
            setCompany(prev => ({ ...prev, phone: e.target.value }));
            if (errors.companyPhone) {
                setErrors(prev => { const n={...prev}; delete n.companyPhone; return n; });
            }
          }}
          error={errors.companyPhone}
          isValid={!!company.phone && !errors.companyPhone}
          placeholder="0123 456 7890"
          required
        />
      </div>

      {/* Section 3: Company Address */}
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-2">
          <MapPin className="text-ga-blue" size={24} />
          <h2 className="text-xl font-bold text-ga-dark">Company Address</h2>
        </div>

        <Input
          id="addr-street"
          label="Street Address"
          name="street"
          value={company.address.street}
          onChange={handleAddressChange}
          error={errors['address.street']}
          placeholder="123 Industrial Estate"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="City / Town"
            name="city"
            value={company.address.city}
            onChange={handleAddressChange}
            error={errors['address.city']}
            placeholder="Birmingham"
            required
          />
          <Input
            label="Postal Code"
            name="postalCode"
            value={company.address.postalCode}
            onChange={handleAddressChange}
            error={errors['address.postalCode']}
            placeholder="B1 1AA"
            required
            className="uppercase"
          />
        </div>

        <Input
          label="Country"
          name="country"
          value={company.address.country}
          onChange={handleAddressChange}
          error={errors['address.country']}
          placeholder="e.g. United Kingdom"
          required
        />
      </div>

      {/* Sticky Footer Submit */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20 md:relative md:shadow-none md:border-none md:bg-transparent md:mt-6 md:p-6">
        <div className="max-w-3xl mx-auto">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`
              w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all
              ${isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-ga-blue hover:brightness-110 text-white shadow-md hover:shadow-lg active:scale-[0.99]'
              }
            `}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Submit
                <Send size={20} />
              </>
            )}
          </button>
        </div>
      </div>
      
    </form>
  );
};
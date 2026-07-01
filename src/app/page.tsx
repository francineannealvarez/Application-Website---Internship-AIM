'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type Step = 1 | 2 | 3 | 4;

type PositionOption = {
  id: string;
  title: string;
  employmentType: string;
};

export default function ApplicationForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [positions, setPositions] = useState<PositionOption[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1
    fullName: session?.user?.name || '',
    email: session?.user?.email || '',
    phoneNumber: '',
    homeAddress: '',
    dateOfBirth: '',
    gender: '',
    heardAboutUs: '',

    // Step 2
    positionId: '',
    preferredStartDate: '',
    message: '',

    // Step 3
    resume: null as File | null,
    coverLetter: null as File | null,
    portfolioUrl: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const fetchPositions = async () => {
    try {
      const res = await fetch('/api/positions');
      if (res.ok) {
        const data = await res.json();
        setPositions(data);
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchPositions();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files?.[0]) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('positionId', formData.positionId);
      formDataToSend.append('phoneNumber', formData.phoneNumber);
      formDataToSend.append('homeAddress', formData.homeAddress);
      formDataToSend.append('dateOfBirth', formData.dateOfBirth);
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('heardAboutUs', formData.heardAboutUs);
      formDataToSend.append('preferredStartDate', formData.preferredStartDate);
      formDataToSend.append('message', formData.message);
      formDataToSend.append('portfolioUrl', formData.portfolioUrl);

      if (formData.resume) {
        formDataToSend.append('resume', formData.resume);
      }
      if (formData.coverLetter) {
        formDataToSend.append('coverLetter', formData.coverLetter);
      }

      const res = await fetch('/api/applications', {
        method: 'POST',
        body: formDataToSend,
      });

      if (res.ok) {
        router.push('/dashboard?success=true');
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#e8f1fc_0%,_#f8fafc_55%)] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-slide-up">
          <h1 className="text-3xl font-bold text-[#1B3A5C] mb-2 tracking-wide">
            ARVIN INTERNATIONAL
          </h1>
          <p className="text-gray-600 italic">Moving Ahead to Serve You Better</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 animate-fade-slide-up delay-1">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-2 flex-1 mx-1 rounded-full transition-colors duration-500 ${
                  step <= currentStep ? 'bg-gradient-to-r from-[#00AEEF] to-[#1B3A5C]' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span className={`transition-colors duration-300 ${currentStep >= 1 ? 'text-[#00AEEF]' : 'text-gray-400'}`}>
              Personal
            </span>
            <span className={`transition-colors duration-300 ${currentStep >= 2 ? 'text-[#00AEEF]' : 'text-gray-400'}`}>
              Position
            </span>
            <span className={`transition-colors duration-300 ${currentStep >= 3 ? 'text-[#00AEEF]' : 'text-gray-400'}`}>
              Documents
            </span>
            <span className={`transition-colors duration-300 ${currentStep >= 4 ? 'text-[#00AEEF]' : 'text-gray-400'}`}>
              Review
            </span>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100 p-8 animate-fade-slide-up delay-2">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-[#1B3A5C] mb-6 animate-fade-slide-up">Personal Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    disabled
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-100 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-100 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none transition-all duration-200 focus:border-[#00AEEF] focus:ring-4 focus:ring-blue-100"
                    placeholder="09XXXXXXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Home Address *
                  </label>
                  <input
                    type="text"
                    name="homeAddress"
                    value={formData.homeAddress}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none transition-all duration-200 focus:border-[#00AEEF] focus:ring-4 focus:ring-blue-100"
                    placeholder="Enter your home address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none transition-all duration-200 focus:border-[#00AEEF] focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none transition-all duration-200 focus:border-[#00AEEF] focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="">Select a gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    How did you hear about us? *
                  </label>
                  <select
                    name="heardAboutUs"
                    value={formData.heardAboutUs}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none transition-all duration-200 focus:border-[#00AEEF] focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="">Select an option</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Jobstreet">Jobstreet</option>
                    <option value="Referral">Referral</option>
                    <option value="Walk-in">Walk-in</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Position & Availability */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-[#1B3A5C] mb-6 animate-fade-slide-up">Position & Availability</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Position Applied For *
                  </label>
                  <select
                    name="positionId"
                    value={formData.positionId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none transition-all duration-200 focus:border-[#00AEEF] focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="">Select a position</option>
                    {positions.map((pos) => (
                      <option key={pos.id} value={pos.id}>
                        {pos.title} ({pos.employmentType})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Preferred Start Date *
                  </label>
                  <input
                    type="date"
                    name="preferredStartDate"
                    value={formData.preferredStartDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none transition-all duration-200 focus:border-[#00AEEF] focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Why do you want to join Arvin? (max 500 characters) *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    maxLength={500}
                    required
                    rows={5}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none transition-all duration-200 focus:border-[#00AEEF] focus:ring-4 focus:ring-blue-100 resize-none"
                    placeholder="Tell us why you're interested in this position..."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.message.length}/500
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Documents */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-[#1B3A5C] mb-6 animate-fade-slide-up">Documents</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Resume (PDF, max 5MB) * <span className="text-red-500">Required</span>
                  </label>
                  <input
                    type="file"
                    name="resume"
                    onChange={handleFileChange}
                    accept=".pdf"
                    required
                    className="w-full px-4 py-2.5 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200 cursor-pointer file:cursor-pointer"
                  />
                  {formData.resume && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ {formData.resume.name} ({(formData.resume.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Cover Letter (PDF, max 5MB) - Optional
                  </label>
                  <input
                    type="file"
                    name="coverLetter"
                    onChange={handleFileChange}
                    accept=".pdf"
                    className="w-full px-4 py-2.5 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200 cursor-pointer file:cursor-pointer"
                  />
                  {formData.coverLetter && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ {formData.coverLetter.name} ({(formData.coverLetter.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Portfolio / LinkedIn URL - Optional
                  </label>
                  <input
                    type="url"
                    name="portfolioUrl"
                    value={formData.portfolioUrl}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none transition-all duration-200 focus:border-[#00AEEF] focus:ring-4 focus:ring-blue-100"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-[#1B3A5C] mb-6 animate-fade-slide-up">Review Your Application</h2>

              <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 animate-fade-in">
                <span className="text-blue-500 mt-0.5">ℹ️</span>
                <p className="text-blue-800 text-sm">
                  Thank you for your interest in joining the Arvin Family. We will review your application and get back to you soon.
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Personal Information</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-600">Name:</span> <p className="font-medium">{formData.fullName}</p></div>
                    <div><span className="text-gray-600">Email:</span> <p className="font-medium">{formData.email}</p></div>
                    <div><span className="text-gray-600">Phone:</span> <p className="font-medium">{formData.phoneNumber}</p></div>
                    <div><span className="text-gray-600">Gender:</span> <p className="font-medium">{formData.gender}</p></div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Position Details</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Position:</span>
                      <p className="font-medium">
                        {positions.find((p) => p.id === formData.positionId)?.title}
                      </p>
                    </div>
                    <div><span className="text-gray-600">Start Date:</span> <p className="font-medium">{formData.preferredStartDate}</p></div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Documents</h3>
                  <div className="text-sm space-y-1">
                    <p><span className="text-gray-600">Resume:</span> {formData.resume?.name || 'Not uploaded'}</p>
                    <p><span className="text-gray-600">Cover Letter:</span> {formData.coverLetter?.name || 'Not uploaded'}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 mb-6">
                <input type="checkbox" id="confirm" required className="mt-1" />
                <label htmlFor="confirm" className="text-sm text-gray-700">
                  I confirm that all information I provided is accurate and complete.
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => (prev > 1 ? (prev - 1 as Step) : prev))}
              disabled={currentStep === 1}
              className="px-6 py-2.5 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 active:scale-95 disabled:opacity-40 disabled:hover:bg-transparent transition-all duration-200"
            >
              Previous
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => (prev < 4 ? (prev + 1 as Step) : prev))}
                className="px-6 py-2.5 bg-gradient-to-r from-[#00AEEF] to-[#0099CC] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-500/25 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0 transition-all duration-200"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

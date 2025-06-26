import { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import LoadingIndicator from "../components/LoadingIndicator";

const UserCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="10" r="3"></circle><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path></svg>;
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;

const ProfileHeader = () => {
    const navigate = useNavigate();
    return (
        <header className="bg-white shadow-sm w-full">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-[#0D47A1]">User Dashboard</h1>
                <button onClick={() => navigate("/")} className="flex items-center gap-2 text-[#333] font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <HomeIcon />
                    <span>Back to Home</span>
                </button>
            </nav>
        </header>
    );
};


function Profile() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    birth_date: "",
    city_name: "",
    email: "", 
  });
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoadingProfile(true);
      try {
        const profileRes = await api.get("/api/profile/");
        const citiesRes = await api.get("/api/cities/");
        const profileData = profileRes.data;
        if (profileData.birth_date) {
          profileData.birth_date = profileData.birth_date.split('T')[0];
        }
        setFormData({
          first_name: profileData.first_name || "",
          last_name: profileData.last_name || "",
          phone_number: profileData.phone_number || "",
          birth_date: profileData.birth_date || "",
          city_name: profileData.city_name || "",
          email: profileData.email || "", 
        });
        setCities(citiesRes.data);
      } catch (err) {
        setError("Failed to load profile data.");
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfileData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess("");
    const { email, ...dataToUpdate } = formData;
    const filteredData = Object.fromEntries(
        Object.entries(dataToUpdate).filter(([_, value]) => value !== '' && value !== null)
    );
    if (Object.keys(filteredData).length === 0) {
      setError("No changes to update.");
      setLoading(false);
      return;
    }
    try {
      const res = await api.put("/api/update-profile/", filteredData);
      setSuccess(res.data.message || "Profile updated successfully!");
       setTimeout(() => setSuccess(""), 3000); // پاک کردن پیام موفقیت بعد از ۳ ثانیه
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return <div className="flex justify-center items-center h-screen bg-[#F8F9FA]"><LoadingIndicator /></div>
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <ProfileHeader />
      <main className="container mx-auto p-6">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center mb-8">
            <UserCircleIcon />
            <div className="ml-4">
              <h2 className="text-2xl font-bold text-[#0D47A1]">{formData.first_name} {formData.last_name}</h2>
              <p className="text-gray-500">{formData.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input id="first_name" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#42A5F5] focus:outline-none" type="text" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="First Name" />
            </div>
             <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input id="last_name" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#42A5F5] focus:outline-none" type="text" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Last Name" />
            </div>
            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input id="phone_number" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#42A5F5] focus:outline-none" type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="Phone Number" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
                <input id="birth_date" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#42A5F5] focus:outline-none" type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} />
              </div>
              <div>
                <label htmlFor="city_name" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <select id="city_name" name="city_name" value={formData.city_name} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#42A5F5] focus:outline-none bg-white">
                  <option value="">Select a city</option>
                  {cities.map((city) => (
                    <option key={city.city_id} value={city.city_name}>{city.city_name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            {success && <p className="text-green-500 text-sm text-center">{success}</p>}
            
            <div className="pt-4">
              <button className="w-full bg-[#FFA726] text-white py-3 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-all duration-200 disabled:bg-gray-400 shadow-md hover:shadow-lg" type="submit" disabled={loading}>
                {loading ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default Profile;

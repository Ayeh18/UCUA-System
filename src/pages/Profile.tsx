import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/bg-image.avif';
import avatarImage from '../assets/profile1.jpg';
import {Mail, Phone, Briefcase, Building} from 'lucide-react'

interface UserProfile {
  username: string;
  email?: string;
  phone?: string;
  staffId: string;
  designation: string;
  department: string;
  profile_pic?: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No token found. Please log in.');
        setLoading(false);
        setTimeout(() => (window.location.href = '/login'), 2000);
        return;
      }

      try {
        const res = await fetch('http://localhost:8000/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
          setProfilePicPreview(data.profile_pic ? `http://localhost:8000${data.profile_pic}?${Date.now()}` : null);
        } else if (res.status === 401) {
          setError('Unauthorized access. Please log in again.');
          localStorage.removeItem('accessToken');
          setTimeout(() => (window.location.href = '/login'), 2000);
        } else {
          setError('Failed to fetch profile. Try again later.');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Network error while fetching profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfilePicChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a JPEG or PNG image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setProfilePicPreview(previewUrl);

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('No token found. Please log in.');
      return;
    }

    const formData = new FormData();
    formData.append('profile_pic', file);

    try {
      const res = await fetch('http://localhost:8000/upload-profile-pic', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setProfilePicPreview(data.profile_pic ? `http://localhost:8000${data.profile_pic}?${Date.now()}` : null);
        setError(null);
        alert('Profile picture updated successfully!');
      } else {
        setError('Failed to update profile picture.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Network error while uploading profile picture.');
    } finally {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-semibold text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-between items-center">
      <div className="w-full flex flex-col items-center">
        <div
          className="w-full min-h-[355px] sm:min-h-[360px] bg-cover bg-center rounded-b-[30px] relative "
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-black/20 rounded-b-[30px] z-0"></div>
          <div className="absolute top-14 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-white z-10 px-4 ">
            <div className="relative">
              <img
                src={profilePicPreview || avatarImage}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = avatarImage;
                }}
                alt="Avatar"
                className="w-32 h-32 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full border-2 border-black object-cover mt-1"
              />
              <button
                onClick={triggerFileInput}
                className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-blue-700 transition"
                title="Change Profile Picture"
              >
                ✎
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleProfilePicChange}
                accept="image/jpeg,image/png,image/jpg"
                className="hidden"
              />
            </div>
            <h1 className="mt-4 font-bold text-3xl sm:text-2xl md:text-3xl text-black text-center text-white">
              {user?.username || 'Unknown User'}
            </h1>
            <p className="text-lg sm:text-base font-bold text-black mt-2 text-center text-indigo-700 tracking-wide">
              {user?.staffId || 'N/A'}
            </p>
          </div>
        </div>

        <div className="bg-blue-200 text-black -mt-9 w-[90%] max-w-[600px] rounded-2xl shadow-xl p-3 md:p-8 space-y-6 z-20">
          {error ? (
            <div className="text-red-500 font-semibold text-center">{error}</div>
          ) : (
            <>
            <div className="bg-white/30 backdrop-blur-md border border-blue-300 shadow-xl rounded-2xl p-5 sm:p-8 space-y-5 w-full max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-indigo-700 mb-7 text-center">Profile Details</h2>

              {/* Reusable Info Row */}
              {[
                {
                  icon: <Mail className="w-5 h-5 text-indigo-600" />,
                  label: "Email",
                  value: user?.email || "N/A",
                },
                {
                  icon: <Phone className="w-5 h-5 text-green-600" />,
                  label: "Phone Number",
                  value: user?.phone || "N/A",
                },
                {
                  icon: <Briefcase className="w-5 h-5 text-yellow-600" />,
                  label: "Designation",
                  value: user?.designation || "N/A",
                },
                {
                  icon: <Building className="w-5 h-5 text-purple-600" />,
                  label: "Department",
                  value: user?.department || "N/A",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center border-b border-gray-400 pb-4 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <p className="text-sm sm:text-base font-medium text-gray-700">
                      {item.label}
                    </p>
                  </div>
                  <p className="text-sm sm:text-base text-gray-800 font-semibold text-right max-w-[60%] truncate">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
            </>
          )}
        </div>
      </div>

      <div className="w-full flex justify-center p-4">
        <button
          className="bg-[#002aff] text-white font-semibold py-3 md:py-4 px-10 rounded-full w-[90%] max-w-[600px] shadow-md hover:bg-blue-800 transition"
          onClick={() => navigate('/edit-profile')}
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default Profile;

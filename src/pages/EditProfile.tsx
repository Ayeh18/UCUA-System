import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  username: string;
  email?: string;
  phone?: string;
  staffId: string;
  designation: string;
  department: string;
}

const defaultProfile: UserProfile = {
  username: '',
  email: '',
  phone: '',
  staffId: '',
  designation: '',
  department: '',
};

const EditProfile = () => {
  const [formData, setFormData] = useState<UserProfile>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No token found. Please log in.');
        setLoading(false);
        setTimeout(() => navigate('/login'), 2000);
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
          // Merge with defaults to avoid undefined values
          setFormData({ ...defaultProfile, ...data });
        } else {
          const errorData = await res.json();
          setError(errorData.detail || 'Failed to fetch profile.');
        }
      } catch (err) {
        console.error(err);
        setError('Network error.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');

    if (!token) {
      alert('Missing token. Please log in again.');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('username', formData.username);
    formDataToSend.append('email', formData.email || '');
    formDataToSend.append('phone', formData.phone || '');
    formDataToSend.append('designation', formData.designation);
    formDataToSend.append('department', formData.department);

    try {
      const res = await fetch('http://localhost:8000/profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (res.ok) {
        alert('Profile updated successfully!');
        navigate('/profile');
      } else {
        const errorData = await res.json();
        alert(errorData.detail || 'Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg font-semibold text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-indigo-500 to-red-700 flex items-center justify-center px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl p-10 space-y-8 border border-gray-100"
        noValidate
      >
        <h2 className="text-4xl font-extrabold text-center text-gray-800">
          Edit Profile
        </h2>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200 text-center font-medium">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {[
            { label: 'Username', name: 'username', required: true, type: 'text', placeholder: 'Enter your username' },
            { label: 'Email', name: 'email', type: 'email', placeholder: 'you@example.com' },
            { label: 'Phone Number', name: 'phone', type: 'tel', placeholder: '+6012 345 6789' },
            { label: 'Designation', name: 'designation', type: 'text', placeholder: 'Your designation' },
            { label: 'Department', name: 'department', type: 'text', placeholder: 'Your department' },
          ].map(({ label, name, required, type, placeholder }) => (
            <div key={name} className="flex flex-col">
              <label htmlFor={name} className="text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
              </label>
              <input
                id={name}
                type={type}
                name={name}
                value={formData[name as keyof UserProfile] || ''}
                onChange={handleChange}
                placeholder={placeholder}
                required={required}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150 text-sm"
              />
            </div>
          ))}

          <div className="flex flex-col">
            <label htmlFor="staffId" className="text-sm font-medium text-gray-700 mb-1">
              Staff ID
            </label>
            <input
              id="staffId"
              type="text"
              value={formData.staffId}
              disabled
              className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-500 text-sm cursor-not-allowed"
            />
          </div>
        </div>

        <div className="flex justify-end items-center gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition font-medium"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>

  );
};

export default EditProfile;

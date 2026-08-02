import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import { getToken, logout } from '../../utils/auth';
import { getProfile, updateProfile, uploadProfileImage } from '../../services/authService';
import Navbar from '../common/Navbar';

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    fullName: '',
    age: '',
    gender: '',
    phone: '',
    address: '',
    medicalHistory: '',
    allergies: '',
    dietaryPreferences: '',
    profileImage: '/images/default-profile.png',
    createdAt: new Date().toISOString()
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const successTimeoutRef = useRef(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    fetchUserProfile();

    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, [navigate]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();

      const sanitizedData = {
        username: data.username || '',
        email: data.email || '',
        fullName: data.fullName || '',
        age: data.age !== undefined ? data.age : '',
        gender: data.gender || '',
        phone: data.phone || '',
        address: data.address || '',
        medicalHistory: data.medicalHistory || '',
        allergies: data.allergies || '',
        dietaryPreferences: data.dietaryPreferences || '',
        profileImage: data.profileImage || '/images/default-profile.png',
        createdAt: data.createdAt || new Date().toISOString(),
        _id: data._id || ''
      };

      setUserData(sanitizedData);
    } catch (error) {
      setError(error.message || 'Failed to load profile');
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'age') {
      if (value === '' || /^\d+$/.test(value)) {
        const ageValue = value === '' ? '' : parseInt(value, 10);
        if (ageValue === '' || (ageValue >= 1 && ageValue <= 120)) {
          setUserData({
            ...userData,
            [name]: ageValue
          });
        }
      }
    } else {
      setUserData({
        ...userData,
        [name]: value
      });
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      setError('Please select an image file (jpg, png, etc.)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      setError('');

      const previewUrl = URL.createObjectURL(file);
      setUploadedImage(previewUrl);

      const formData = new FormData();
      formData.append('image', file);

      const data = await uploadProfileImage(formData);
      const imageUrl = `http://localhost:5000${data.fileUrl}`;

      setUserData({
        ...userData,
        profileImage: imageUrl
      });

      setSuccessMessage('Image uploaded successfully');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error uploading image:', error);
      if (uploadedImage) {
        setUserData({
          ...userData,
          profileImage: uploadedImage
        });
        setSuccessMessage('Image selected (local preview only)');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (userData.phone && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im.test(userData.phone)) {
      setError('Please enter a valid phone number');
      return;
    }

    if (userData.age && (userData.age < 1 || userData.age > 120)) {
      setError('Please enter a valid age between 1 and 120');
      return;
    }

    try {
      setIsSaving(true);

      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }

      const updateData = {
        fullName: userData.fullName || '',
        age: userData.age === '' ? null : Number(userData.age),
        gender: userData.gender || '',
        phone: userData.phone || '',
        address: userData.address || '',
        medicalHistory: userData.medicalHistory || '',
        allergies: userData.allergies || '',
        dietaryPreferences: userData.dietaryPreferences || '',
        profileImage: userData.profileImage || '/images/default-profile.png'
      };

      const data = await updateProfile(updateData);

      const sanitizedData = {
        username: data.username || '',
        email: data.email || '',
        fullName: data.fullName || '',
        age: data.age !== undefined ? data.age : '',
        gender: data.gender || '',
        phone: data.phone || '',
        address: data.address || '',
        medicalHistory: data.medicalHistory || '',
        allergies: data.allergies || '',
        dietaryPreferences: data.dietaryPreferences || '',
        profileImage: data.profileImage || '/images/default-profile.png',
        createdAt: data.createdAt || new Date().toISOString(),
        _id: data._id || ''
      };

      setUserData(sanitizedData);
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);

      successTimeoutRef.current = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setError(error.message || 'Failed to update profile');
      console.error('Error updating profile:', error);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading && !userData.username) {
    return (
      <div className="fridge-page">
        <div className="profile-loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="fridge-page">
      <img src="/images/ff.png" alt="Fridge Fusion Logo" className="fridge-logo" />

      <Navbar activePage="/profile" />

      <div className="fridge-container">
        <div className="fridge-title">PROFILE</div>
      </div>

      <div className="fridge-moving-bar">
        <span className="fridge-text">
          Manage your health information and dietary preferences 🥗 Keep your medical profile up to date for personalized recommendations 🍎 Your health journey starts with good nutrition 🥦
        </span>
      </div>

      <div className="profile-container">
        {error && <div className="profile-error">{error}</div>}
        {successMessage && <div className="profile-success">{successMessage}</div>}

        <div className="profile-header">
          <div className="profile-image-container">
            <img
              src={uploadedImage || userData.profileImage || '/images/default-profile.png'}
              alt="Profile"
              className="profile-image"
            />
            {isEditing && (
              <div className="profile-image-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                  id="profile-image-input"
                  className="profile-image-file-input"
                />
                <label htmlFor="profile-image-input" className="profile-image-upload-btn">
                  <i className="fas fa-camera"></i>
                  {isUploading ? 'Uploading...' : 'Choose Image'}
                </label>
              </div>
            )}
          </div>
          <div className="profile-info">
            <h2>{userData.fullName || userData.username}</h2>
            <p className="profile-email">{userData.email}</p>
            <div className="profile-actions">
              {!isEditing ? (
                <>
                  <button className="profile-edit-btn" onClick={() => setIsEditing(true)}>
                    <i className="fas fa-edit"></i>
                    Edit Profile
                  </button>
                  <button className="profile-logout-btn" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i>
                    Logout
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="profile-form-section">
            <h3>Personal Information</h3>
            <div className="profile-form-row">
              <div className="profile-form-group">
                <label>Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="fullName"
                    value={userData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p>{userData.fullName || 'Not provided'}</p>
                )}
              </div>
              <div className="profile-form-group">
                <label>Age</label>
                {isEditing ? (
                  <input
                    type="number"
                    name="age"
                    value={userData.age === null ? '' : userData.age}
                    onChange={handleInputChange}
                    placeholder="Enter your age"
                    min="1"
                    max="120"
                  />
                ) : (
                  <p>{userData.age ? userData.age : 'Not provided'}</p>
                )}
              </div>
            </div>
            <div className="profile-form-row">
              <div className="profile-form-group">
                <label>Gender</label>
                {isEditing ? (
                  <select
                    name="gender"
                    value={userData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <p>{userData.gender ? userData.gender.charAt(0).toUpperCase() + userData.gender.slice(1) : 'Not provided'}</p>
                )}
              </div>
              <div className="profile-form-group">
                <label>Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={userData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <p>{userData.phone || 'Not provided'}</p>
                )}
              </div>
            </div>
            <div className="profile-form-group full-width">
              <label>Address</label>
              {isEditing ? (
                <textarea
                  name="address"
                  value={userData.address}
                  onChange={handleInputChange}
                  placeholder="Enter your address"
                  rows="2"
                ></textarea>
              ) : (
                <p>{userData.address || 'Not provided'}</p>
              )}
            </div>
          </div>

          <div className="profile-form-section">
            <h3>Medical Information</h3>
            <div className="profile-form-group full-width">
              <label>Medical History</label>
              {isEditing ? (
                <textarea
                  name="medicalHistory"
                  value={userData.medicalHistory}
                  onChange={handleInputChange}
                  placeholder="Enter your medical history"
                  rows="3"
                ></textarea>
              ) : (
                <p>{userData.medicalHistory || 'Not provided'}</p>
              )}
            </div>
            <div className="profile-form-group full-width">
              <label>Allergies</label>
              {isEditing ? (
                <textarea
                  name="allergies"
                  value={userData.allergies}
                  onChange={handleInputChange}
                  placeholder="Enter your allergies"
                  rows="2"
                ></textarea>
              ) : (
                <p>{userData.allergies || 'Not provided'}</p>
              )}
            </div>
          </div>

          <div className="profile-form-section">
            <h3>Dietary Preferences</h3>
            <div className="profile-form-group full-width">
              <label>Dietary Preferences</label>
              {isEditing ? (
                <textarea
                  name="dietaryPreferences"
                  value={userData.dietaryPreferences}
                  onChange={handleInputChange}
                  placeholder="Enter your dietary preferences"
                  rows="3"
                ></textarea>
              ) : (
                <p>{userData.dietaryPreferences || 'Not provided'}</p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="profile-form-actions">
              <button type="submit" className="profile-save-btn" disabled={isSaving}>
                <i className="fas fa-save"></i>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" className="profile-cancel-btn" onClick={() => setIsEditing(false)}>
                <i className="fas fa-times"></i>
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;

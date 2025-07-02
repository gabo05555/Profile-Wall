import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { defaultAvatar } from '../utils/defaultAvatar'

export default function PostForm({ onPost }) {
  const [message, setMessage] = useState('')
  const [image, setImage] = useState(null)
  const [username, setUsername] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [profilePicture, setProfilePicture] = useState(null)
  const [isUploadingProfile, setIsUploadingProfile] = useState(false)
  const [tempProfileImage, setTempProfileImage] = useState(null)

  // Check if user has set up profile on component mount
  useEffect(() => {
    const userProfile = localStorage.getItem('userProfile')
    if (userProfile) {
      const profile = JSON.parse(userProfile)
      setUsername(profile.username || '')
      setProfilePicture(profile.profilePicture || null)
    }
  }, [])

  const handleProfileUpload = async (file) => {
    if (!file) return null

    setIsUploadingProfile(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `profile_${Date.now()}.${fileExt}`

      console.log('Uploading profile picture:', fileName)

      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file)

      if (error) {
        console.error('Profile upload error:', error)
        alert(`Failed to upload profile picture: ${error.message}`)
        return null
      }

      console.log('Profile upload successful:', data)

      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName)

      return urlData.publicUrl
    } catch (error) {
      console.error('Profile upload error:', error)
      alert('Failed to upload profile picture')
      return null
    } finally {
      setIsUploadingProfile(false)
    }
  }

  const handleProfileSetupComplete = async (uploadedFile) => {
    if (!username.trim()) {
      alert('Please enter your name')
      return
    }

    let profilePictureUrl = null
    
    if (uploadedFile) {
      profilePictureUrl = await handleProfileUpload(uploadedFile)
      if (!profilePictureUrl) return // Upload failed
    }

    // Save user profile to localStorage
    const userProfile = {
      username: username.trim(),
      profilePicture: profilePictureUrl,
      hasSetupProfile: true
    }
    
    localStorage.setItem('userProfile', JSON.stringify(userProfile))
    setProfilePicture(profilePictureUrl)
    setShowProfileSetup(false)
    
    // Now proceed with posting
    await performPost(profilePictureUrl)
  }

  const handleProfileSkip = async () => {
    if (!username.trim()) {
      alert('Please enter your name')
      return
    }

    // Save user profile without picture
    const userProfile = {
      username: username.trim(),
      profilePicture: null,
      hasSetupProfile: true
    }
    
    localStorage.setItem('userProfile', JSON.stringify(userProfile))
    setShowProfileSetup(false)
    
    // Now proceed with posting using default avatar
    await performPost(null)
  }

  const performPost = async (currentProfilePicture) => {
    setIsPosting(true)

    try {
      const imageUrl = await handleUpload(image, 'post-images')
      
      console.log('Final URLs to save:', { imageUrl })
      
      const postData = {
        username: username.trim(),
        message: message.trim(),
        image_url: imageUrl || null,
      }
      
      console.log('Submitting post:', postData)

      const { data, error } = await supabase.from('posts').insert([postData]).select()

      if (error) {
        console.error('Supabase insert error:', error)
        alert(`Failed to post: ${error.message}`)
        return
      }

      console.log('Post successful:', data)

      setMessage('')
      setImage(null)
      setTempProfileImage(null) // Clear the temporary profile image
      // Clear the file inputs
      const fileInputs = document.querySelectorAll('input[type="file"]')
      fileInputs.forEach(input => input.value = '')
      
      // Keep username for next post - user doesn't need to retype it
      console.log('Calling onPost callback')
      onPost?.() // Trigger refresh in parent
    } catch (error) {
      console.error('Error posting:', error)
      alert(`Failed to post: ${error.message || 'Unknown error'}`)
    } finally {
      setIsPosting(false)
    }
  }

  const handleUpload = async (file, folder = 'post-images') => {
    if (!file) return null

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`

      console.log('Uploading file:', fileName, 'to folder:', folder)

      const { data, error } = await supabase.storage
        .from(folder)
        .upload(fileName, file)

      if (error) {
        console.error('Upload error details:', error.message, error)
        if (error.message.includes('Bucket not found')) {
          alert(`Upload not configured. You need to create a "${folder}" bucket in Supabase Storage.`)
        } else if (error.message.includes('new row violates row-level security')) {
          alert('Storage permissions issue. You may need to disable RLS on storage or create storage policies.')
        } else {
          alert(`Upload failed: ${error.message}`)
        }
        return null
      }

      console.log('Upload successful:', data)

      const { data: urlData } = supabase.storage
        .from(folder)
        .getPublicUrl(fileName)

      console.log('Public URL:', urlData.publicUrl)
      return urlData.publicUrl
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Posting without file.')
      return null
    }
  }

  const handleSubmit = async () => {
    // Always ask for profile setup before posting
    if (!username.trim()) {
      alert('Please enter your name')
      return
    }

    if (!message.trim()) {
      alert('Please enter a message')
      return
    }

    // Always show profile setup modal before posting
    setShowProfileSetup(true)
  }

  // Profile Setup Modal
  if (showProfileSetup) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Up Your Profile</h2>
            <p className="text-gray-600">Let others know who you are before you start posting!</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture (Optional)</label>
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <img
                    src={tempProfileImage ? URL.createObjectURL(tempProfileImage) : defaultAvatar}
                    alt="Profile preview"
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                  />
                </div>
                
                <label className="cursor-pointer bg-violet-100 hover:bg-violet-200 text-violet-700 px-4 py-2 rounded-lg transition-colors duration-200">
                  {tempProfileImage ? 'Change Photo' : 'Choose Photo'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setTempProfileImage(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="flex flex-col space-y-3 pt-4">
              <button
                onClick={() => handleProfileSetupComplete(tempProfileImage)}
                disabled={!username.trim() || isUploadingProfile}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
              >
                {isUploadingProfile ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Setting up...</span>
                  </div>
                ) : (
                  'Complete Setup'
                )}
              </button>
              
              <button
                onClick={handleProfileSkip}
                disabled={!username.trim()}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Skip & Use Default Avatar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8 backdrop-blur-sm">
      <div className="flex items-center mb-6">
        <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full mr-3"></div>
        <h2 className="text-xl font-semibold text-gray-900">Create a new post</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <input
            type="text"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
            placeholder="👋 What's your name?"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        
        <div className="relative">
          <textarea
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 resize-none placeholder-gray-500"
            rows="4"
            placeholder="✨ Share what's on your mind..."
            value={message}
            onChange={(e) => {
              if (e.target.value.length <= 280) {
                setMessage(e.target.value)
              }
            }}
            maxLength={280}
          />
          
          <div className="flex justify-between items-center mt-2">
            <div className={`text-sm font-medium transition-colors duration-200 ${
              message.length > 260 ? 'text-red-500' : 
              message.length > 240 ? 'text-amber-500' : 
              'text-gray-400'
            }`}>
              {message.length}/280
            </div>
            <div className={`w-16 h-1 rounded-full transition-all duration-200 ${
              message.length > 260 ? 'bg-red-500' : 
              message.length > 240 ? 'bg-amber-500' : 
              'bg-gray-200'
            }`} style={{ width: `${Math.min((message.length / 280) * 64, 64)}px` }}>
            </div>
          </div>
        </div>

        <div className="relative">
          <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-all duration-200 group">
            <div className="text-center">
              {image ? (
                <div className="space-y-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full mx-auto flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-700">{image.name}</p>
                  <p className="text-xs text-gray-500">Click to change image</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-8 h-8 bg-gray-400 rounded-full mx-auto flex items-center justify-center group-hover:bg-violet-500 transition-colors duration-200">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-600 group-hover:text-violet-600 transition-colors duration-200">
                    📷 Add an image
                  </p>
                  <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="hidden"
            />
          </label>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!username.trim() || isPosting}
          className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          {isPosting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Posting...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span>Share Post</span>
            </div>
          )}
        </button>
      </div>
    </div>
  )
}

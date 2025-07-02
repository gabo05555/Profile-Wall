import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { defaultAvatar } from '../utils/defaultAvatar'

export default function Sidebar() {
  const [profilePicture, setProfilePicture] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [username, setUsername] = useState('Greg Wientjes')

  // Load profile from localStorage on mount
  useEffect(() => {
    const userProfile = localStorage.getItem('userProfile')
    if (userProfile) {
      const profile = JSON.parse(userProfile)
      setProfilePicture(profile.profilePicture)
      setUsername(profile.username || 'User')
    }
  }, [])

  const handleProfileUpload = async (file) => {
    if (!file) return

    setIsUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `sidebar_profile_${Date.now()}.${fileExt}`

      console.log('Uploading profile picture:', fileName, 'to profile-pictures bucket')

      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file)

      if (error) {
        console.error('Profile upload error details:', error.message, error)
        if (error.message.includes('Bucket not found')) {
          alert('Profile pictures bucket not found. Please create a "profile-pictures" bucket in Supabase Storage.')
        } else if (error.message.includes('new row violates row-level security')) {
          alert('Storage permissions issue. You may need to create storage policies for profile-pictures.')
        } else {
          alert(`Failed to upload profile picture: ${error.message}`)
        }
        return
      }

      console.log('Profile upload successful:', data)

      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName)

      const newProfileUrl = urlData.publicUrl
      setProfilePicture(newProfileUrl)
      
      // Update localStorage
      const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}')
      userProfile.profilePicture = newProfileUrl
      localStorage.setItem('userProfile', JSON.stringify(userProfile))
      
      console.log('Profile picture updated:', newProfileUrl)
    } catch (error) {
      console.error('Profile upload error:', error)
      alert(`Failed to upload profile picture: ${error.message || 'Unknown error'}`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <aside className="w-80 bg-white shadow-2xl border-r border-gray-100 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-500 font-medium">Online</span>
        </div>
        
        {/* Profile Section */}
        <div className="text-center">
          <div className="relative mx-auto w-20 h-20 mb-4">
            <img
              src={profilePicture || defaultAvatar}
              alt="profile"
              className="rounded-full w-20 h-20 object-cover ring-4 ring-violet-100 shadow-lg"
            />
            <button
              type="button"
              onClick={() => document.getElementById('sidebar-profile-upload').click()}
              className="absolute -bottom-1 -right-1 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
              title="Change profile picture"
              disabled={isUploading}
            >
              {isUploading ? (
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              )}
            </button>
            <input
              id="sidebar-profile-upload"
              type="file"
              accept="image/*"
              onChange={(e) => handleProfileUpload(e.target.files[0])}
              className="hidden"
            />
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-1">{username}</h2>
          <p className="text-violet-600 font-medium text-sm">@{username.toLowerCase().replace(' ', '')}</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-6">
        <nav className="space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 rounded-xl font-medium transition-all duration-200 hover:from-violet-100 hover:to-purple-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Profile Info
          </button>
          
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 rounded-xl font-medium transition-all duration-200 hover:bg-gray-50 hover:text-gray-900">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
        </nav>

        {/* Stats */}
        <div className="mt-8 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">About</h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Stanford Alumni</p>
                <p className="text-gray-500 text-xs">Education</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Palo Alto, CA</p>
                <p className="text-gray-500 text-xs">Location</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Social Wall v1.0</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Active</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

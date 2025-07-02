import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function PostList({ posts, onPostDeleted }) {
  console.log('PostList received posts:', posts)
  
  const [editingPostId, setEditingPostId] = useState(null)
  const [editMessage, setEditMessage] = useState('')

  const handleEditStart = (post) => {
    setEditingPostId(post.id)
    setEditMessage(post.message)
  }

  const handleEditSave = async (postId) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ message: editMessage.trim() })
        .eq('id', postId)

      if (error) {
        console.error('Edit error:', error)
        alert('Failed to update post')
        return
      }

      setEditingPostId(null)
      setEditMessage('')
      onPostDeleted?.() // Refresh posts
    } catch (error) {
      console.error('Edit error:', error)
      alert('Failed to update post')
    }
  }

  const handleEditCancel = () => {
    setEditingPostId(null)
    setEditMessage('')
  }
  
  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

      if (error) {
        console.error('Delete error:', error)
        alert('Failed to delete post')
        return
      }

      console.log('Post deleted successfully')
      onPostDeleted?.() // Refresh the posts list
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete post')
    }
  }
  
  return (
    <div className="space-y-6">
      {!posts || posts.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No posts yet</h3>
          <p className="text-gray-500">Be the first to share something amazing!</p>
        </div>
      ) : (
        posts.map(post => (
          <div
            key={post.id}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-start gap-4">
              {/* Profile image */}
              <div className="relative">
                <img
                  src={(() => {
                    const userProfile = localStorage.getItem('userProfile')
                    if (userProfile) {
                      const profile = JSON.parse(userProfile)
                      return profile.profilePicture || "https://via.placeholder.com/48x48/e5e7eb/9ca3af?text=👤"
                    }
                    return "https://via.placeholder.com/48x48/e5e7eb/9ca3af?text=👤"
                  })()}
                  alt="avatar"
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-violet-100"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{post.username}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      {new Date(post.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditStart(post)}
                      className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all duration-200"
                      title="Edit post"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="Delete post"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {editingPostId === post.id ? (
                    <div className="space-y-4">
                      <textarea
                        value={editMessage}
                        onChange={(e) => {
                          if (e.target.value.length <= 280) {
                            setEditMessage(e.target.value)
                          }
                        }}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                        rows="3"
                        maxLength={280}
                      />
                      <div className="flex justify-between items-center">
                        <div className={`text-sm font-medium transition-colors duration-200 ${
                          editMessage.length > 260 ? 'text-red-500' : 
                          editMessage.length > 240 ? 'text-amber-500' : 
                          'text-gray-400'
                        }`}>
                          {editMessage.length}/280
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditSave(post.id)}
                            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleEditCancel}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-base">{post.message}</p>
                  )}
                </div>

                {post.image_url && (
                  <div className="mt-4">
                    <img
                      src={post.image_url}
                      alt="Post image"
                      className="rounded-xl max-w-full max-h-96 object-cover shadow-md border border-gray-100"
                      onError={(e) => {
                        console.error('Image failed to load:', post.image_url)
                        e.target.style.display = 'none'
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully:', post.image_url)
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

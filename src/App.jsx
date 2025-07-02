import { useEffect, useState } from 'react'
import Sidebar from './components/sidebar'
import PostForm from './components/Postform'
import PostList from './components/Postlist'
import { supabase } from './supabaseClient'

export default function App() {
  const [posts, setPosts] = useState([])

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching posts:', error)
        return
      }

      console.log('Fetched posts:', data)
      setPosts(data || [])
    } catch (error) {
      console.error('Error in fetchPosts:', error)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Sidebar - Desktop only */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Social Wall</h1>
          <p className="text-gray-600">Share your thoughts with the community</p>
        </div>

        <PostForm onPost={fetchPosts} />
        <PostList posts={posts} onPostDeleted={fetchPosts} />
      </main>
    </div>
  )
}


import React, { useState } from 'react';
import { User, DiscussionPost } from '../types';

interface DiscussionForumProps {
  user: User;
}

const INITIAL_POSTS: DiscussionPost[] = [
  {
    id: 'p1',
    authorId: 's1',
    authorName: 'Alex Johnson',
    content: 'Can someone explain the difference between BFS and DFS in terms of space complexity?',
    createdAt: new Date().toISOString(),
    replies: [
      {
        id: 'r1',
        authorId: 't1',
        authorName: 'Prof. Miller',
        content: 'BFS uses a queue and takes O(W) where W is the width, while DFS uses a stack and takes O(H) where H is the height.',
        createdAt: new Date().toISOString()
      }
    ]
  }
];

const DiscussionForum: React.FC<DiscussionForumProps> = ({ user }) => {
  const [posts, setPosts] = useState<DiscussionPost[]>(INITIAL_POSTS);
  const [newPostContent, setNewPostContent] = useState('');

  const handleAddPost = () => {
    if (!newPostContent.trim()) return;
    const post: DiscussionPost = {
      id: `p-${Date.now()}`,
      authorId: user.id,
      authorName: user.name,
      content: newPostContent,
      createdAt: new Date().toISOString(),
      replies: []
    };
    setPosts([post, ...posts]);
    setNewPostContent('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold mb-4">Start a Discussion</h3>
        <div className="flex flex-col gap-4">
          <textarea 
            placeholder="Ask a question or share a thought..."
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
          />
          <button 
            onClick={handleAddPost}
            className="self-end px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all"
          >
            Post Question
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <img src={`https://picsum.photos/seed/${post.authorId}/50`} className="w-10 h-10 rounded-full" />
                <div>
                  <h4 className="font-bold text-slate-800">{post.authorName}</h4>
                  <p className="text-xs text-slate-400">{new Date(post.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <p className="text-slate-600 text-lg mb-6">{post.content}</p>
              
              <div className="flex items-center gap-6 text-sm text-slate-400 font-medium">
                <button className="flex items-center gap-1 hover:text-indigo-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  {post.replies.length} Replies
                </button>
              </div>
            </div>

            {post.replies.length > 0 && (
              <div className="bg-slate-50 p-6 space-y-4">
                {post.replies.map(reply => (
                  <div key={reply.id} className="flex gap-4">
                    <img src={`https://picsum.photos/seed/${reply.authorId}/50`} className="w-8 h-8 rounded-full" />
                    <div className="bg-white p-4 rounded-xl shadow-sm flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-sm text-indigo-600">{reply.authorName}</span>
                        <span className="text-[10px] text-slate-400">{new Date(reply.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-slate-600">{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscussionForum;

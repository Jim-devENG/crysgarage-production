import React, { useState } from 'react';
import { MoreHorizontal, Image, Video, FileAudio } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Post } from './types';

interface CreatePostModalProps {
  onClose: () => void;
  onSubmit: (postData: { title: string; content: string; category: Post['category']; tags: string[] }) => void;
}

export function CreatePostModal({ onClose, onSubmit }: CreatePostModalProps) {
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'general' as Post['category'],
    tags: [] as string[]
  });

  const handleSubmit = () => {
    if (newPost.title.trim() && newPost.content.trim()) {
      onSubmit(newPost);
      setNewPost({ title: '', content: '', category: 'general', tags: [] });
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">Create New Post</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Post title..."
          value={newPost.title}
          onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
        />
        <Textarea
          placeholder="What's on your mind?"
          value={newPost.content}
          onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 min-h-[120px]"
        />
        <div className="flex items-center space-x-4">
          <select
            value={newPost.category}
            onChange={(e) => setNewPost(prev => ({ ...prev, category: e.target.value as Post['category'] }))}
            className="bg-gray-700 border-gray-600 text-white rounded-lg px-3 py-2"
          >
            <option value="general">General</option>
            <option value="music">Music</option>
            <option value="production">Production</option>
            <option value="gear">Gear</option>
            <option value="collaboration">Collaboration</option>
            <option value="showcase">Showcase</option>
          </select>
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline" className="border-gray-600 text-gray-400">
              <Image className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" className="border-gray-600 text-gray-400">
              <Video className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" className="border-gray-600 text-gray-400">
              <FileAudio className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-600 text-gray-400 hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-amber-500 hover:bg-amber-600 text-black"
          >
            Post
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

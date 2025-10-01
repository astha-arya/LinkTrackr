import { useState } from 'react';
import { linkService } from '../services/linkService';
import toast from 'react-hot-toast';
import { Link as LinkIcon, Loader2 } from 'lucide-react';

interface CreateLinkFormProps {
  onSuccess: () => void;
}

export default function CreateLinkForm({ onSuccess }: CreateLinkFormProps) {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!originalUrl) {
      toast.error('Please enter a URL');
      return;
    }

    setLoading(true);
    try {
      await linkService.shorten({
        originalUrl,
        customAlias: customAlias || undefined,
      });
      toast.success('Link created successfully!');
      setOriginalUrl('');
      setCustomAlias('');
      onSuccess();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to create link';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <LinkIcon className="w-6 h-6 mr-2 text-blue-600" />
        Create New Short Link
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="originalUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Original URL
          </label>
          <input
            type="url"
            id="originalUrl"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            placeholder="https://example.com/very-long-url"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="customAlias" className="block text-sm font-medium text-gray-700 mb-1">
            Custom Alias (optional)
          </label>
          <input
            type="text"
            id="customAlias"
            value={customAlias}
            onChange={(e) => setCustomAlias(e.target.value)}
            placeholder="my-custom-link"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Short Link'
          )}
        </button>
      </form>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { linkService } from '../services/linkService';
import toast from 'react-hot-toast';
import { ExternalLink, Trash2, BarChart3, Copy } from 'lucide-react';

interface Link {
  id: string;
  shortId: string;
  originalUrl: string;
  shortUrl: string;
  totalClicks: number;
  createdAt: string;
}

interface LinkTableProps {
  links: Link[];
  onDelete: () => void;
}

export default function LinkTable({ links, onDelete }: LinkTableProps) {
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (shortId: string) => {
    if (!confirm('Are you sure you want to delete this link?')) {
      return;
    }

    setDeletingId(shortId);
    try {
      await linkService.deleteLink(shortId);
      toast.success('Link deleted successfully');
      onDelete();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete link');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopy = (shortUrl: string) => {
    navigator.clipboard.writeText(shortUrl);
    toast.success('Link copied to clipboard!');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (links.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500">No links yet. Create your first short link above!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Short ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Original URL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Short URL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clicks
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {links.map((link) => (
              <tr key={link.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {link.shortId}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {link.originalUrl}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center space-x-2">
                    <a
                      href={link.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      {link.shortUrl}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                    <button
                      onClick={() => handleCopy(link.shortUrl)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {link.totalClicks}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(link.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => navigate(`/analytics/${link.shortId}`)}
                    className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                  >
                    <BarChart3 className="w-4 h-4 mr-1" />
                    Analytics
                  </button>
                  <button
                    onClick={() => handleDelete(link.shortId)}
                    disabled={deletingId === link.shortId}
                    className="text-red-600 hover:text-red-900 inline-flex items-center disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

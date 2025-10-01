import { useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { linkService } from '../services/linkService';
import CreateLinkForm from '../components/CreateLinkForm';
import LinkTable from '../components/LinkTable';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';
import { User, Link as LinkIcon } from 'lucide-react';

interface UserProfile {
  username: string;
  email: string;
}

interface Link {
//   id: string;
  shortId: string;
  originalUrl: string;
  shortUrl: string;
  totalClicks: number;
  createdAt: string;
}

export default function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const { user } = await authService.getProfile();
      setProfile(user);
    } catch (error: any) {
      toast.error('Failed to load profile');
    }
  };

  const fetchLinks = async (page = 1) => {
    try {
      const data = await linkService.getLinks(page, 10);
      setLinks(data.data); 
      setCurrentPage(data.pagination.currentPage);
      setTotalPages(data.pagination.totalPages);

    } catch (error: any) {
      toast.error('Failed to load links');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchLinks();
  }, []);

  const handlePageChange = (page: number) => {
    setLoading(true);
    fetchLinks(page);
  };

  const handleLinkCreated = () => {
    fetchLinks(1);
  };

  const handleLinkDeleted = () => {
    fetchLinks(currentPage);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 rounded-full p-3">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {profile?.username || 'User'}!
              </h1>
              <p className="text-gray-600">{profile?.email}</p>
            </div>
          </div>
        </div>

        <CreateLinkForm onSuccess={handleLinkCreated} />

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <LinkIcon className="w-6 h-6 mr-2 text-blue-600" />
            Your Links
          </h2>
          {loading ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : (
            <>
              <LinkTable links={links} onDelete={handleLinkDeleted} />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

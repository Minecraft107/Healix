// src/components/HomePage.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from './ui/card';
import {
  Heart,
  MessageCircle,
  ChevronDown,
  LogOut,
  Globe,
  FileText,
  ChevronRight,
  Plus,
  FolderOpen,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { useLanguage, Language } from './LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { logout, getCurrentUser, getUserData, getFamilyMembers, deleteFamilyMember } from '../lib/firebase';
import { toast } from 'sonner';

type Member = {
  id?: string;          // Firestore doc id (primary uses auth uid)
  name?: string;
  photoURL?: string;
  isPrimary?: boolean;
  customId?: string;    // friendly code for both primary and family
};

export function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage } = useLanguage();

  const [userProfile, setUserProfile] = useState<any>(null);
  const [profiles, setProfiles] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('User');
  const [customId, setCustomId] = useState('');

  const languages: { code: Language; name: string; nativeName: string }[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  ];

  const getInitial = (name?: string) => (name?.trim()?.charAt(0) ?? '?').toUpperCase();
  const getFirstWord = (name?: string) => name?.trim()?.split(' ')?.[0] ?? 'Member';

  const refreshProfiles = useCallback(async () => {
    try {
      setIsLoading(true);
      const currentUser = getCurrentUser();
      if (!currentUser) {
        navigate('/login');
        return;
      }

      const userDataResult = await getUserData(currentUser.uid);
      if (userDataResult.success && userDataResult.data) {
        setUserProfile(userDataResult.data);
        const firstName = (userDataResult.data.fullName || 'User').split(' ')[0];
        setUserName(firstName);
        setCustomId(userDataResult.data.customId || 'N/A');

        const mainProfile: Member = {
          id: currentUser.uid,
          name: userDataResult.data.fullName,
          photoURL: userDataResult.data.photoURL || '',
          isPrimary: true,
          customId: userDataResult.data.customId || undefined,
        };

        let familyProfiles: Member[] = [];
        try {
          const familyMembers = await getFamilyMembers(currentUser.uid);
          familyProfiles = (familyMembers || []).map((m: any) => ({
            id: m?.id,
            name: m?.name ?? m?.fullName ?? 'Member',
            photoURL: m?.photoURL || '',
            isPrimary: false,
            customId: m?.customId || undefined,
          }));
        } catch {
          familyProfiles = [];
        }

        const combined = [mainProfile, ...familyProfiles];
        setProfiles(combined.slice(0, 5));
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      toast.error('Failed to load profiles');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    refreshProfiles();
  }, [refreshProfiles]);

  useEffect(() => {
    if (location.state && (location.state as any).refreshProfiles) {
      refreshProfiles();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate, refreshProfiles]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login', { replace: true });
    } catch {
      toast.error('Logout failed');
    }
  };

  const addNewProfile = () => navigate('/family/add');

  const handleProfileClick = (member?: Member) => {
    if (!member?.id) return;
    navigate('/profile', { state: { profileId: member.id } });
  };

  // Context menu (right-click) for non-primary
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [menuTarget, setMenuTarget] = useState<Member | null>(null);
  const longPressRef = useRef<number | null>(null);

  const openMemberMenu = (e: React.MouseEvent | React.TouchEvent, member: Member, index: number) => {
    if (!member?.id || index === 0) return;
    e.preventDefault();
    const isTouch = 'touches' in e;
    const x = isTouch ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const y = isTouch ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
    setMenuTarget(member);
    setMenuPos({ x, y });
    setMenuOpen(true);
  };

  useEffect(() => {
    const close = () => setMenuOpen(false);
    if (menuOpen) document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [menuOpen]);

  const onTouchStart = (member: Member, index: number) => (e: React.TouchEvent) => {
    if (!member?.id || index === 0) return;
    longPressRef.current = window.setTimeout(() => openMemberMenu(e, member, index), 600);
  };
  const onTouchEnd = () => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  };

  const onEditMember = () => {
    if (!menuTarget?.id) return;
    setMenuOpen(false);
    navigate('/family/add', { state: { editMemberId: menuTarget.id } });
  };

  const onDeleteMember = async () => {
    if (!menuTarget?.id) return;
    setMenuOpen(false);
    try {
      const userId = getCurrentUser()?.uid as string;
      await deleteFamilyMember(userId, menuTarget.id);
      toast.success('Member deleted');
      await refreshProfiles();
    } catch {
      toast.error('Failed to delete member');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="w-full max-w-md mx-auto space-y-4 pb-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-blue-700 font-medium">HEALIX</div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1.5 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow">
                <div
                  className="w-10 h-10 flex items-center justify-center text-white font-bold text-sm"
                  style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)', borderRadius: '50%' }}
                >
                  {getInitial(userName)}
                </div>
                <ChevronDown className="h-4 w-4 text-gray-600 mr-1" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                <div className="py-2">
                  <p className="text-base font-bold text-gray-900">{userProfile?.fullName}</p>
                  <p className="text-xs text-gray-500 mt-1">ID: {customId}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-3">
                <label className="text-xs font-medium text-gray-500 mb-2 block uppercase">Language</label>
                <Select value={language} onValueChange={(value: Language) => setLanguage(value)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((l) => (
                      <SelectItem key={l.code} value={l.code}>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          {l.nativeName}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 font-medium">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Welcome Card */}
        <Card className="shadow-lg bg-white">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Heart className="h-6 w-6 text-blue-600" />
              Welcome, {userName.toUpperCase()}
            </h2>
          </div>
        </Card>

        {/* ORDER 1: Profiles */}
        <Card className="shadow-lg bg-white relative">
          <div className="p-4">
            <h3 className="font-bold text-gray-900 text-base mb-3">Profiles</h3>

            <div className="flex items-center justify-between px-2">
              {Array.from({ length: 5 }).map((_, i) => {
                const p = profiles?.[i];
                const isEmpty = !p;

                const gradient =
                  i === 0
                    ? 'linear-gradient(135deg, #06B6D4 0%, #14B8A6 100%)'
                    : 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)';

                const onClick = () => (isEmpty ? addNewProfile() : handleProfileClick(p!));
                const onContextMenu = (e: React.MouseEvent) => {
                  if (!isEmpty) openMemberMenu(e, p as Member, i);
                };

                return (
                  <button
                    type="button"
                    key={p?.id ?? `slot-${i}`}
                    onClick={onClick}
                    onContextMenu={onContextMenu}
                    onTouchStart={onTouchStart(p as Member, i)}
                    onTouchEnd={onTouchEnd}
                    className="flex flex-col items-center focus:outline-none"
                    aria-label={isEmpty ? 'Add member' : `Open ${p?.name ?? 'Member'} profile`}
                    title={isEmpty ? 'Add' : p?.name ?? 'Member'}
                  >
                    <div
                      className={`w-14 h-14 flex items-center justify-center shadow-lg ${
                        isEmpty
                          ? 'border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100'
                          : 'text-white'
                      }`}
                      style={{
                        borderRadius: '50%',
                        aspectRatio: '1 / 1',
                        background: isEmpty ? undefined : gradient,
                      }}
                    >
                      {isEmpty ? (
                        <Plus className="h-7 w-7 text-gray-400" />
                      ) : (
                        <span className="font-bold text-lg">{getInitial(p?.name)}</span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-center mt-1 text-gray-700 max-w-[80px] truncate">
                      {isEmpty ? 'Add' : getFirstWord(p?.name)}
                    </p>
                    {!isEmpty && (
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {p?.customId ? `ID: ${p.customId}` : p?.isPrimary ? 'Primary' : 'Member'}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Context menu for non-primary */}
          {menuOpen && menuTarget?.id && (
            <div
              className="absolute z-50 bg-white border shadow-lg rounded-md overflow-hidden"
              style={{
                top: Math.max(
                  12,
                  menuPos.y -
                    (document.querySelector('.App')
                      ? (document.querySelector('.App') as HTMLElement).getBoundingClientRect().top
                      : 0)
                ),
                left: Math.max(
                  12,
                  menuPos.x -
                    (document.querySelector('.App')
                      ? (document.querySelector('.App') as HTMLElement).getBoundingClientRect().left
                      : 0)
                ),
                width: 180,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-3 py-2 text-xs text-gray-500 border-b">
                {menuTarget?.name ?? 'Member'} {menuTarget?.customId ? `• ID: ${menuTarget.customId}` : ''}
              </div>
              <button type="button" onClick={onEditMember} className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm">
                Edit profile
              </button>
              <button
                type="button"
                onClick={onDeleteMember}
                className="w-full text-left px-3 py-2 hover:bg-red-50 text-sm text-red-600"
              >
                Delete profile
              </button>
            </div>
          )}
        </Card>

        {/* ORDER 2: Health Records */}
        <Card
          className="cursor-pointer shadow-lg bg-white hover:shadow-xl transition-shadow"
          onClick={() => navigate('/health-records/choose')}
        >
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                <FolderOpen className="h-8 w-8 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg flex items-center justify-between mb-1">
                  My Health Records
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </h3>
                <p className="text-sm text-gray-600">View and manage your medical records securely</p>
              </div>
            </div>
          </div>
        </Card>

        {/* ORDER 3: Policies & Schemes */}
        <Card
          className="cursor-pointer shadow-lg bg-white hover:shadow-xl transition-shadow"
          onClick={() => navigate('/policies')}
        >
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg flex items-center justify-between mb-1">
                  Healthcare Policies & Schemes
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </h3>
                <p className="text-sm text-gray-600">View available health schemes and policies</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Extra: Emergency & Nearby */}
        <Card
          className="cursor-pointer shadow-lg bg-white hover:shadow-xl transition-shadow"
          onClick={() => navigate('/emergency-help')}
        >
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg flex items-center justify-between mb-1">
                  Emergency & Nearby Help
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </h3>
                <p className="text-sm text-gray-600">Find the nearest hospitals or clinics around you</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Extra: Health Insights */}
        <Card
          className="cursor-pointer shadow-lg bg-white hover:shadow-xl transition-shadow"
          onClick={() => navigate('/health-insights')}
        >
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg flex items-center justify-between mb-1">
                  My Health Insights
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </h3>
                <p className="text-sm text-gray-600">Track your wellness and improvement over time</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Chatbot */}
        <Card
          className="cursor-pointer shadow-lg bg-gradient-to-br from-blue-500 to-green-500 hover:shadow-xl transition-shadow"
          onClick={() => navigate('/chatbot')}
        >
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg flex items-center justify-between mb-1">
                  AI Health Assistant
                  <ChevronRight className="h-5 w-5 text-white/80" />
                </h3>
                <p className="text-sm text-white/90">Chat with our AI assistant for instant health support</p>
              </div>
            </div>
          </div>
        </Card>

        <p className="text-center text-xs text-gray-500 pt-2">🔒 Secure portal protected by Firebase</p>
      </div>
    </div>
  );
}

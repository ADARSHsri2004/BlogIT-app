import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Camera, Pencil } from 'lucide-react';
import { type ChangeEvent, useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../hooks/useAuth';
import { fetchMyBlogs } from '../services/blogs';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import BlogCard from '../components/BlogCard';
import { AnimatedButton, AnimatedLinkButton } from '../components/animate-ui/button';
import { softTransition } from '../components/animate-ui/transitions';

const ProfilePage = () => {
  const { user, updateProfileDetails } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ['blogs', 'me'],
    queryFn: fetchMyBlogs
  });
  const [bioDraft, setBioDraft] = useState('');
  const [avatarDraft, setAvatarDraft] = useState('');
  const [coverDraft, setCoverDraft] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');

  const username = user?.email ? `@${user.email.split('@')[0]}` : '@writer';
  const initials =
    user?.name
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'BI';
  const avatarImage = avatarDraft || user?.avatarUrl || '';
  const coverImage = coverDraft || user?.coverImageUrl || '';

  useEffect(() => {
    setBioDraft(user?.bio || '');
    setAvatarDraft(user?.avatarUrl || '');
    setCoverDraft(user?.coverImageUrl || '');
  }, [user?.bio, user?.avatarUrl, user?.coverImageUrl]);

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Could not read the selected image'));
      reader.readAsDataURL(file);
    });

  const handleImageChange =
    (target: 'avatar' | 'cover') => async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.size > 300 * 1024) {
        setSaveError('Please choose an image under 300 KB.');
        return;
      }

      setSaveError('');
      try {
        const dataUrl = await readFileAsDataUrl(file);
        if (target === 'avatar') {
          setAvatarDraft(dataUrl);
        } else {
          setCoverDraft(dataUrl);
        }
        setIsEditing(true);
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : 'Could not read the selected image.');
      }
    };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError('');
    setSaveMessage('');

    try {
      await updateProfileDetails({
        bio: bioDraft,
        avatarUrl: avatarDraft,
        coverImageUrl: coverDraft
      });
      setIsEditing(false);
      setSaveMessage('Profile updated.');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not update your profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MainLayout contentClassName="px-0 py-0">
      <motion.section
        className="w-full"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={softTransition}
      >
        <div className="h-12 w-full border-b border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900" />

        <div className="w-full border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
          <div className="relative h-32 w-full overflow-hidden bg-slate-200 dark:bg-slate-900 sm:h-36 lg:h-40">
            {coverImage ? <img src={coverImage} alt="" className="h-full w-full object-cover" /> : null}
            <label className="absolute right-4 top-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 backdrop-blur dark:bg-slate-950/85 dark:text-slate-100 dark:ring-slate-700">
              <Camera className="h-3.5 w-3.5" />
              Cover image
              <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" onChange={handleImageChange('cover')} />
            </label>
          </div>

          <div className="px-5 pb-8 sm:px-8 lg:px-12">
            <div className="-mt-16 flex flex-col gap-6 sm:-mt-20 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <div className="relative">
                  <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-200 text-3xl font-medium text-slate-700 shadow-[0_18px_40px_rgba(15,23,42,0.12)] dark:border-slate-950 dark:bg-slate-800 dark:text-slate-100 sm:h-36 sm:w-36 lg:h-40 lg:w-40">
                    {avatarImage ? (
                      <img src={avatarImage} alt="" className="h-full w-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <label className="absolute bottom-2 right-1 inline-flex cursor-pointer items-center justify-center rounded-full bg-white p-2 text-slate-700 shadow-sm ring-1 ring-slate-200 dark:bg-slate-950 dark:text-slate-100 dark:ring-slate-700">
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Upload profile image</span>
                    <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" onChange={handleImageChange('avatar')} />
                  </label>
                </div>

                <div className="border-b border-slate-200 pb-4 dark:border-slate-800 sm:min-w-[260px] sm:pb-2">
                  <p className="text-xl font-medium text-slate-500 dark:text-slate-400">{username}</p>
                  <h1 className="mt-1 font-serif text-4xl font-semibold leading-none text-ink dark:text-slate-50 sm:text-5xl">
                    {user?.name}
                  </h1>
                  <p className="mt-4 text-base text-slate-500 dark:text-slate-400">{user?.email}</p>
                  <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
                    {user?.role} {user?.emailVerified ? '- verified' : '- email verification pending'}
                  </p>
                </div>
              </div>

              {user?.emailVerified && user.role && ['admin', 'author'].includes(user.role) ? (
                <div className="sm:pb-2">
                  <AnimatedLinkButton to="/write">Write a story</AnimatedLinkButton>
                </div>
              ) : null}
            </div>

            <div className="mt-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Bio</p>
                <div className="flex flex-wrap gap-2">
                  {(isEditing || bioDraft !== (user?.bio || '') || avatarDraft !== (user?.avatarUrl || '') || coverDraft !== (user?.coverImageUrl || '')) ? (
                    <AnimatedButton onClick={handleSave} disabled={isSaving} size="sm">
                      Save profile
                    </AnimatedButton>
                  ) : null}
                </div>
              </div>
              <textarea
                value={bioDraft}
                onChange={(event) => {
                  setBioDraft(event.target.value);
                  setIsEditing(true);
                  setSaveMessage('');
                  setSaveError('');
                }}
                maxLength={160}
                rows={4}
                placeholder="Write a short bio for your profile."
                className="mt-4 w-full  resize-none rounded-3xl border border-slate-200 bg-white px-5 py-4 text-base leading-7 text-slate-600 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              />
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {bioDraft.trim() || 'This writer has not added a bio yet, but their stories live just below.'}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{bioDraft.length}/160</p>
              </div>
              {saveError ? <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-300">{saveError}</p> : null}
              {saveMessage ? <p className="mt-3 text-sm font-medium text-emerald-600 dark:text-emerald-300">{saveMessage}</p> : null}
            </div>
          </div>
        </div>

        <div className="w-full px-5 py-10 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">My Blogs</p>
              <h2 className="mt-2 font-serif text-2xl font-semibold text-ink dark:text-slate-50">Drafts and published stories</h2>
            </div>
            {data && data.length > 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">{data.length} {data.length === 1 ? 'story' : 'stories'} in your library</p>
            ) : null}
          </div>

          <div className="mt-6">
            {isLoading && <Spinner />}
            {error && <EmptyState title="Could not load your blogs" description={error.message} />}
            {data && data.length === 0 ? (
              <EmptyState
                title="No stories yet"
                description="Start a draft or publish your first post."
                action={
                  <AnimatedLinkButton to="/write" size="sm">
                    Start writing
                  </AnimatedLinkButton>
                }
              />
            ) : null}
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {data?.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
          </div>
        </div>
      </motion.section>
    </MainLayout>
  );
};

export default ProfilePage;


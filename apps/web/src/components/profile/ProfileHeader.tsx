'use client';

import React, { useCallback, useState } from 'react';
import { apiFetch } from '@/lib/api';
import ConvertToCreatorModal from './ConvertToCreatorModal';

type Creator = {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  followerCount?: number;
  isVerified?: boolean;
  isCreator?: boolean;
};

export default function ProfileHeader({ creator }: { creator: Creator }) {
  const [following, setFollowing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleFollow = useCallback(async () => {
    setLoading(true);
    const path = following ? `/user/follow/${creator.id}` : `/user/follow/${creator.id}`;
    // If already following, call DELETE; otherwise POST.
    const method = following ? 'DELETE' : 'POST';
    const res = await apiFetch(path, { method });
    setLoading(false);
    if (res.success) setFollowing(!following);
  }, [creator.id, following]);

  return (
    <header className="profile-header">
      <div className="profile-main">
        <img src={creator.avatarUrl || '/default-avatar.png'} alt="avatar" className="w-24 h-24 rounded-full" />
        <div className="ml-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{creator.displayName}</h1>
            {creator.isVerified ? <span className="badge">تأیید شده</span> : null}
          </div>
          <p className="text-sm text-muted">{creator.bio}</p>
          <div className="mt-2 flex items-center gap-3">
            <button className="btn-outline" onClick={toggleFollow} disabled={loading}>
              {loading ? '...' : following ? 'دنبال‌شده' : 'دنبال کردن'}
            </button>
            <span className="text-sm text-muted">{creator.followerCount ?? 0} دنبال‌کننده</span>
          </div>
        </div>
      </div>

      {!creator.isCreator ? (
        <div className="mt-4">
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            درخواست تبدیل به تولیدکننده
          </button>
          <ConvertToCreatorModal open={modalOpen} onClose={() => setModalOpen(false)} />
        </div>
      ) : null}
    </header>
  );
}

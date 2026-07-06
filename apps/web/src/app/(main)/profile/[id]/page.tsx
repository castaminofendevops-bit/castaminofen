import { CreatorContentCard } from '@/components/CreatorContentCard';
import { rawFetch } from '@/lib/http';
import ProfileHeader from '@/components/profile/ProfileHeader';

type Creator = {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  followerCount?: number;
  isVerified?: boolean;
  isCreator?: boolean;
};

type ContentItem = {
  id: string;
  title: string;
  coverUrl?: string | null;
  type: string;
};

interface Props {
  params: { id: string };
}

export default async function ProfilePage({ params }: Props) {
  const id = params.id;

  const [creatorRes, contentsRes] = await Promise.all([
    rawFetch<Creator>(`/creators/${id}`),
    rawFetch<ContentItem[]>(`/creators/${id}/contents`),
  ]);

  if (!creatorRes.success || !creatorRes.data) {
    return <p className="section-subtitle">پروفایل مورد نظر یافت نشد.</p>;
  }

  const creator = creatorRes.data;
  const contents = contentsRes.success && contentsRes.data ? contentsRes.data : [];

  return (
    <div>
      <ProfileHeader creator={creator} />

      <section className="mt-6">
        <h2 className="section-title">محتوای اخیر</h2>
        {contents.length === 0 ? (
          <p className="section-subtitle">هیچ محتوایی از این سازنده موجود نیست.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {contents.map((c) => (
              <CreatorContentCard key={c.id} content={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

import { PrismaClient, ContentType, ContentStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@castaminofen.ir' },
    update: {},
    create: {
      email: 'admin@castaminofen.ir',
      displayName: 'مدیر سیستم',
      passwordHash,
      role: UserRole.ADMIN,
      isVerified: true,
    },
  });

  const creatorUser = await prisma.user.upsert({
    where: { email: 'creator@castaminofen.ir' },
    update: {},
    create: {
      email: 'creator@castaminofen.ir',
      displayName: 'پادکست فارسی',
      passwordHash,
      role: UserRole.CREATOR,
      isVerified: true,
      creatorProfile: {
        create: {
          slug: 'farsi-podcast',
          bio: 'بهترین پادکست‌های فارسی',
          isVerified: true,
        },
      },
    },
    include: { creatorProfile: true },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: 'user@castaminofen.ir' },
    update: {},
    create: {
      email: 'user@castaminofen.ir',
      displayName: 'کاربر نمونه',
      passwordHash,
      role: UserRole.USER,
      isVerified: true,
      subscription: {
        create: { plan: 'PREMIUM', status: 'ACTIVE' },
      },
    },
  });

  const creatorId = creatorUser.creatorProfile!.id;

  const tags = await Promise.all(
    ['تکنولوژی', 'کتاب', 'داستان', 'آموزش'].map((name) =>
      prisma.tag.upsert({
        where: { slug: name.replace(/\s/g, '-') },
        update: {},
        create: { name, slug: name.replace(/\s/g, '-') },
      }),
    ),
  );

  const podcastCover = 'https://picsum.photos/seed/castaminofen-tech/400/400';
  const audiobookCover = 'https://picsum.photos/seed/castaminofen-shahnameh/400/400';

  const podcast = await prisma.content.upsert({
    where: { creatorId_slug: { creatorId, slug: 'tech-talk-fa' } },
    update: { coverUrl: podcastCover },
    create: {
      creatorId,
      type: ContentType.PODCAST,
      title: 'تک‌تاک فارسی',
      slug: 'tech-talk-fa',
      description: 'پادکست هفتگی درباره تکنولوژی و استارتاپ',
      coverUrl: podcastCover,
      status: ContentStatus.PUBLISHED,
      isPremium: false,
      publishedAt: new Date(),
      tags: { create: [{ tagId: tags[0].id }] },
      episodes: {
        create: [
          {
            title: 'اپیزود ۱: آینده هوش مصنوعی',
            slug: 'ep-1-ai-future',
            episodeNumber: 1,
            duration: 3600,
            mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            publishedAt: new Date(),
          },
          {
            title: 'اپیزود ۲: استارتاپ در ایران',
            slug: 'ep-2-startup-iran',
            episodeNumber: 2,
            duration: 2700,
            mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
            publishedAt: new Date(),
          },
        ],
      },
    },
    include: { episodes: true },
  });

  const audiobook = await prisma.content.upsert({
    where: { creatorId_slug: { creatorId, slug: 'shahnameh-audio' } },
    update: { coverUrl: audiobookCover },
    create: {
      creatorId,
      type: ContentType.AUDIOBOOK,
      title: 'شاهنامه — فردوسی',
      slug: 'shahnameh-audio',
      description: 'کتاب صوتی شاهنامه',
      coverUrl: audiobookCover,
      status: ContentStatus.PUBLISHED,
      isPremium: true,
      price: 990000,
      publishedAt: new Date(),
      tags: { create: [{ tagId: tags[1].id }, { tagId: tags[2].id }] },
      episodes: {
        create: [
          {
            title: 'بخش ۱: آغاز',
            slug: 'part-1',
            episodeNumber: 1,
            duration: 5400,
            mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
            isPremium: true,
            publishedAt: new Date(),
          },
        ],
      },
    },
  });

  await prisma.content.update({
    where: { id: podcast.id },
    data: {
      episodeCount: podcast.episodes.length,
      totalDuration: podcast.episodes.reduce((s, e) => s + e.duration, 0),
    },
  });

  console.log('Seed complete:', { admin: admin.email, creator: creatorUser.email, user: demoUser.email });
  console.log('Demo credentials: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

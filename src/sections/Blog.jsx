import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import TitleHeader from '../components/TitleHeader';
import AccordionGallery from '../components/AccordionGallery.jsx';
import { useLoadingTask } from '../context/LoadingContext.jsx';
import { useBlogStore } from '../stores/useBlogStore';

gsap.registerPlugin(ScrollTrigger);

const MEDIUM_USERNAME = 'alkairis';
const MEDIUM_PROFILE_URL = `https://${MEDIUM_USERNAME}.medium.com`;

const fallbackPosts = [
  {
    title: 'Read my latest posts on Medium',
    link: MEDIUM_PROFILE_URL,
    pubDate: '',
    tags: ['AI', 'Cloud', 'Engineering'],
  },
];

const Blog = () => {
  const { posts, status, error, fetchBlogs } = useBlogStore();
  const sectionRef = useRef(null);
  const loading = status === 'idle' || status === 'loading';
  const visiblePosts = posts.length ? posts : fallbackPosts;

  useLoadingTask('blogs', loading);

  useEffect(() => {
    fetchBlogs().catch((err) => {
      console.warn('Failed to fetch blogs:', err);
    });
  }, [fetchBlogs]);

  // Feed the accordion each post's cover image, title and keywords. Clicking
  // the expanded panel opens the post on Medium in a new tab.
  const galleryItems = visiblePosts.map((post) => ({
    image: post.image || '',
    label: post.title,
    alt: post.title,
    tags: post.tags,
  }));

  useGSAP(() => {
    gsap.fromTo(
      sectionRef.current,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
        },
      }
    );
  }, { scope: sectionRef, dependencies: [visiblePosts.length] });

  const openPost = (post) => {
    if (post?.link) window.open(post.link, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="blogs" ref={sectionRef} className="flex-center section-padding">
      <div className="w-full h-full md:px-10 px-5">
        <TitleHeader title="Top Medium Posts" sub="📝 Published by me" />

        {loading && (
          <p className="text-gray-600 text-center mt-16">Loading top posts...</p>
        )}

        {!loading && error && (
          <p className="text-[#839CB5] text-center mt-16">{error}</p>
        )}

        {!loading && visiblePosts.length > 0 && (
          <div className="w-full mt-16">
            <AccordionGallery
              items={galleryItems}
              defaultIndex={Math.min(2, visiblePosts.length - 1)}
              expandRatio={0.52}
              trigger="hover"
              accentColor="#0ea5e9"
              overlayColor="#0f172a"
              textColor="#ffffff"
              tintColor="#0ea5e9"
              tilt={0}
              gap={8}
              onItemClick={(_item, index) => openPost(visiblePosts[index])}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default Blog;

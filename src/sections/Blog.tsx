import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { faMedium } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TitleHeader from '../components/TitleHeader';
import { useLoadingTask } from '../context/loadingContext';
import { useBlogStore } from '../stores/useBlogStore';
import type { BlogPost } from '../api/api';
import './blog.css';

gsap.registerPlugin(ScrollTrigger);

const MEDIUM_USERNAME = 'alkairis';
const MEDIUM_PROFILE_URL = `https://${MEDIUM_USERNAME}.medium.com`;

const fallbackPosts: BlogPost[] = [
  {
    title: 'Read my latest posts on Medium',
    link: MEDIUM_PROFILE_URL,
    pubDate: '',
    tags: ['AI', 'Cloud', 'Engineering'],
  },
];

const Blog = () => {
  const { posts, status, error, fetchBlogs } = useBlogStore();
  const gridRef = useRef<HTMLDivElement | null>(null);
  const stRef = useRef<gsap.core.Tween | null>(null);
  const loading = status === 'idle' || status === 'loading';
  const visiblePosts = posts.length ? posts : fallbackPosts;

  useLoadingTask('blogs', loading);

  useEffect(() => {
    fetchBlogs().catch((err) => {
      console.warn('Failed to fetch blogs:', err);
    });
  }, [fetchBlogs]);

  // Animate cards after posts load
  useEffect(() => {
    if (loading || !gridRef.current) return;

    const cards = gsap.utils.toArray<HTMLElement>('.blog-card', gridRef.current);
    if (!cards.length) return;

    stRef.current = gsap.fromTo(
      cards,
      { y: 42, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.65,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'top 82%',
        },
      }
    );

    return () => {
      stRef.current?.scrollTrigger?.kill();
    };
  }, [loading]);

  return (
    <section id="blogs" className="flex-center section-padding">
      <div className="w-full h-full md:px-10 px-5">
        <TitleHeader
          title="Top Medium Posts"
          sub={`📝 Published by me`}
        />

        {loading && (
          <p className="text-gray-600 text-center mt-16">Loading top posts...</p>
        )}

        {!loading && error && (
          <p className="text-[#839CB5] text-center mt-16">{error}</p>
        )}

        <div ref={gridRef} className="mediacards-grid mt-16">
          {/* Each card is a single <a>. It used to be a div[role="link"] with a
              manual Enter/Space handler wrapping a second, real anchor to the
              same URL — an interactive element inside an interactive element,
              which is both invalid and a focus-order trap. One anchor gives
              keyboard activation, a focus ring and the correct announcement
              for free, and the icon below is now decorative. */}
          {visiblePosts.map((post) => (
              <a
                key={post.link}
                className="blog-card mediacard"
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="mediacard-hero">
                  {post.image && <img src={post.image} alt={post.title} loading="lazy" />}
                  <div className="mediacard-scrim" aria-hidden="true" />
                  <h3 className="mediacard-title">{post.title}</h3>
                </div>

                <div className="mediacard-meta">
                  {post.pubDate && (
                    <p className="mediacard-date">
                      {new Date(post.pubDate).toLocaleDateString()}
                    </p>
                  )}
                  <div className="mediacard-footer">
                    <div className="mediacard-tags">
                      {post.tags.map((tag, i) => (
                        <span key={i} className="mediacard-tag">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <span className="mediacard-icon-btn" aria-hidden="true">
                      <FontAwesomeIcon icon={faMedium} />
                    </span>
                  </div>
                </div>
              </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;

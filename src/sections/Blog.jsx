import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { faMedium } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TitleHeader from '../components/TitleHeader';
import { useLoadingTask } from '../context/LoadingContext.jsx';
import { useBlogStore } from '../stores/useBlogStore';
import './blog.css';

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
  const gridRef = useRef(null);
  const stRef = useRef(null);
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

    const cards = gsap.utils.toArray('.blog-card', gridRef.current);
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
          {visiblePosts.map((post, index) => {
            const openPost = () =>
              window.open(post.link, '_blank', 'noopener,noreferrer');
            return (
              <div
                key={index}
                className="blog-card mediacard"
                role="link"
                tabIndex={0}
                aria-label={post.title}
                onClick={openPost}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openPost();
                  }
                }}
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
                    <a
                      className="mediacard-icon-btn"
                      href={post.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Read on Medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FontAwesomeIcon icon={faMedium} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Blog;

import React, { useState, useRef } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';
import { Link } from 'react-router-dom';

const slidesData = [
  {
    title: "Track Every Commit",
    description: "Connect your GitHub account and get a real-time view of your contribution streaks, repository activity, and coding consistency — all in one place.",
    image: "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&h=1200&fit=crop&auto=format&q=90",
    bgColor: "#0d0c09",
    textColor: "#E1E0CC",
  },
  {
    title: "Conquer Every Problem",
    description: "Sync your LeetCode, Codeforces, and GeeksForGeeks stats. Watch your rating climb, track problems solved, and celebrate every milestone.",
    image: "https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?w=800&h=1200&fit=crop&auto=format&q=90",
    bgColor: "#0d0c09",
    textColor: "#E1E0CC",
  },
  {
    title: "Visualize Your Growth",
    description: "Beautiful charts and heatmaps show your coding journey at a glance. Spot patterns, identify weak areas, and double down on what's working.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=1200&fit=crop&auto=format&q=90",
    bgColor: "#0d0c09",
    textColor: "#E1E0CC",
  },
  {
    title: "Own Your Developer Story",
    description: "Share your Alvora profile with recruiters and teammates. One link — your entire coding journey, beautifully presented.",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=1200&fit=crop&auto=format&q=90",
    bgColor: "#0d0c09",
    textColor: "#E1E0CC",
  },
];

export function ScrollingFeatureShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setActiveIndex(Math.min(slidesData.length - 1, Math.floor(v * slidesData.length)));
  });

  const dynamicStyles = {
    backgroundColor: slidesData[activeIndex].bgColor,
    color: slidesData[activeIndex].textColor,
    transition: 'background-color 0.7s ease, color 0.7s ease',
  };

  const gridPatternStyle = {
    backgroundImage: `
      linear-gradient(to right, rgba(225, 224, 204, 0.06) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(225, 224, 204, 0.06) 1px, transparent 1px)
    `,
    backgroundSize: '3.5rem 3.5rem',
  };

  const handlePaginationClick = (index) => {
    const section = sectionRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const sectionTop = window.scrollY + rect.top;
    const sectionHeight = section.offsetHeight - window.innerHeight;
    const stepHeight = sectionHeight / slidesData.length;
    window.scrollTo({ top: sectionTop + stepHeight * index, behavior: 'smooth' });
  };

  return (
    <div ref={sectionRef} className="relative h-[400vh]">
      <div
        className="sticky top-0 h-screen w-full flex flex-col items-center justify-center"
        style={dynamicStyles}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 h-full w-full max-w-7xl mx-auto">

          {/* Left Column */}
          <div className="relative flex flex-col justify-center p-8 md:p-16 border-r border-[#E1E0CC]/8">

            {/* Pagination bars */}
            <div className="absolute top-16 left-16 flex space-x-2">
              {slidesData.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePaginationClick(index)}
                  className={`h-1 rounded-full transition-all duration-500 ease-in-out ${
                    index === activeIndex ? 'w-12 bg-[#c9b99a]' : 'w-6 bg-[#E1E0CC]/20'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Slide text */}
            <div className="relative h-64 w-full">
              {slidesData.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                    index === activeIndex
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-10'
                  }`}
                >
                  <h2
                    className="text-5xl md:text-6xl font-bold tracking-tighter"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {slide.title}
                  </h2>
                  <p className="mt-6 text-lg md:text-xl max-w-md" style={{ color: '#9c9a8e' }}>
                    {slide.description}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="absolute bottom-16 left-16">
              <Link
                to="/signup"
                className="px-10 py-4 font-semibold rounded-full uppercase tracking-wider transition-colors"
                style={{ backgroundColor: '#E1E0CC', color: '#0d0c09' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#c9b99a')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#E1E0CC')}
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* Right Column: sliding image */}
          <div className="hidden md:flex items-center justify-center p-8" style={gridPatternStyle}>
            <div className="relative w-[50%] h-[80vh] rounded-2xl overflow-hidden shadow-2xl border border-[#E1E0CC]/10">
              <div
                className="absolute top-0 left-0 w-full h-full transition-transform duration-700 ease-in-out"
                style={{ transform: `translateY(-${activeIndex * 100}%)` }}
              >
                {slidesData.map((slide, index) => (
                  <div key={index} className="w-full h-full">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/800x1200/1a1a1a/9c9a8e?text=Image+Not+Found';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

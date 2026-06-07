import React from 'react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    text: "Alvora finally gave me a single place to track my GitHub streak AND my LeetCode progress. I used to switch between 4 tabs every morning.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Arjun Mehta",
    role: "Software Engineer",
  },
  {
    text: "My Codeforces rating climbed 200 points after I started tracking patterns with Alvora. Seeing the data made the difference.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Priya Sharma",
    role: "Competitive Programmer",
  },
  {
    text: "I shared my Alvora profile link in my resume. The recruiter said it was the most impressive thing they'd seen from a fresher.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150",
    name: "James Liu",
    role: "CS Graduate",
  },
  {
    text: "The streak visualization is addictive. I haven't missed a day of coding in 3 months because I don't want to break the chain.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Fatima Al-Rashid",
    role: "Backend Developer",
  },
  {
    text: "Alvora's unified dashboard saved me at least 20 minutes a day. Everything I care about in one clean view.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Marcus Johnson",
    role: "Full Stack Developer",
  },
  {
    text: "I was skeptical at first, but connecting all my profiles took under 5 minutes. Now I check Alvora before I check Twitter.",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Yuki Tanaka",
    role: "Frontend Engineer",
  },
  {
    text: "Finally a platform built for competitive programmers. Tracking GeeksForGeeks, Codeforces, and LeetCode together is a game changer.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Rahul Verma",
    role: "CP Enthusiast",
  },
  {
    text: "The auto-sync is magic. I solve a problem on LeetCode and Alvora updates within hours. Zero manual work.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Sofia Reyes",
    role: "Software Developer",
  },
  {
    text: "I recommended Alvora to my entire college coding club. It's the tool we wished existed when we started.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150",
    name: "David Okonkwo",
    role: "Tech Club Lead",
  },
];

const firstColumn  = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn  = testimonials.slice(6, 9);

function TestimonialsColumn(props) {
  return (
    <div className={props.className}>
      <motion.ul
        animate={{ translateY: '-50%' }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: 'linear',
          repeatType: 'loop',
        }}
        className="flex flex-col gap-6 pb-6 list-none m-0 p-0"
      >
        {[...new Array(2).fill(0).map((_, index) => (
          <React.Fragment key={index}>
            {props.testimonials.map(({ text, image, name, role }, i) => (
              <motion.li
                key={`${index}-${i}`}
                aria-hidden={index === 1 ? 'true' : 'false'}
                tabIndex={index === 1 ? -1 : 0}
                whileHover={{
                  scale: 1.03,
                  y: -8,
                  boxShadow: '0 25px 50px -12px rgba(201,185,154,0.15), 0 0 0 1px rgba(225,224,204,0.08)',
                  transition: { type: 'spring', stiffness: 400, damping: 17 },
                }}
                className="p-8 rounded-3xl border border-[#E1E0CC]/10 max-w-xs w-full cursor-default select-none group focus:outline-none"
                style={{ backgroundColor: 'rgba(225,224,204,0.04)' }}
              >
                <blockquote className="m-0 p-0">
                  <p className="leading-relaxed font-normal m-0" style={{ color: '#9c9a8e' }}>
                    "{text}"
                  </p>
                  <footer className="flex items-center gap-3 mt-6">
                    <img
                      width={40}
                      height={40}
                      src={image}
                      alt={`Avatar of ${name}`}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-[#E1E0CC]/10 group-hover:ring-[#c9b99a]/40 transition-all duration-300"
                    />
                    <div className="flex flex-col">
                      <cite className="font-semibold not-italic tracking-tight leading-5" style={{ color: '#E1E0CC' }}>
                        {name}
                      </cite>
                      <span className="text-sm leading-5 tracking-tight mt-0.5" style={{ color: '#6b6960' }}>
                        {role}
                      </span>
                    </div>
                  </footer>
                </blockquote>
              </motion.li>
            ))}
          </React.Fragment>
        ))]}
      </motion.ul>
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section aria-labelledby="testimonials-heading" className="py-24 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="container px-4 z-10 mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col items-center justify-center max-w-[540px] mx-auto mb-16">
          <div className="flex justify-center">
            <div className="border border-[#E1E0CC]/15 py-1 px-4 rounded-full text-xs font-semibold tracking-widest uppercase" style={{ color: '#9c9a8e', backgroundColor: 'rgba(225,224,204,0.05)' }}>
              Testimonials
            </div>
          </div>
          <h2
            id="testimonials-heading"
            className="text-4xl md:text-5xl font-extrabold tracking-tight mt-6 text-center"
            style={{ color: '#E1E0CC' }}
          >
            What developers say
          </h2>
          <p className="text-center mt-5 text-lg leading-relaxed max-w-sm" style={{ color: '#6b6960' }}>
            Developers tracking their growth across every platform — all in one place.
          </p>
        </div>

        {/* Columns */}
        <div
          className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] max-h-[740px] overflow-hidden"
          role="region"
          aria-label="Scrolling Testimonials"
        >
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </motion.div>
    </section>
  );
}

import { InfiniteSlider } from './infinite-slider';

export function LogoCloud({ className, logos, ...props }) {
  return (
    <div
      {...props}
      className={`overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,black,transparent)]${className ? ' ' + className : ''}`}
    >
      <InfiniteSlider gap={72} speed={40} speedOnHover={15}>
        {logos.map((logo) => (
          <div key={`logo-${logo.alt}`} className="flex items-center gap-4 select-none pointer-events-none">
            <img
              alt={logo.alt}
              src={logo.src}
              loading="lazy"
              className="object-contain shrink-0"
              style={{ height: '48px', width: logo.width ? `${logo.width * 1.6}px` : 'auto' }}
            />
            <span className="text-2xl font-bold whitespace-nowrap tracking-tight" style={{ color: '#E1E0CC' }}>
              {logo.alt}
            </span>
          </div>
        ))}
      </InfiniteSlider>
    </div>
  );
}

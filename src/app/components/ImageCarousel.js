'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';

const ImageCarousel = () => {
  const [isClient, setIsClient] = useState(false);
  
  const brandLogos = [
    {
      src: '/dizzy_logo-removebg-preview.png',
      url: 'https://www.dizzywine.co.il',
      name: 'Dizzy Wine',
      size: 'normal'
    },
    {
      src: '/mano_logo-removebg-preview.png',
      url: 'https://www.manovino.co.il',
      name: 'Manovino',
      size: 'large'
    },
    {
      src: '/they_fream-removebg-preview.png',
      url: 'https://www.theydream-online.com',
      name: 'They Dream',
      size: 'normal'
    },
    {
      src: '/alcohome-logo.svg',
      url: 'https://www.alcohome.co.il',
      name: 'Alcohome',
      size: 'normal'
    },
    {
      src: '/wineroute-logo.png',
      url: 'https://www.wineroute.co.il',
      name: 'Wine Route',
      size: 'normal'
    }
  ];

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="w-full overflow-hidden bg-transparent py-8 flex justify-end">
      <div className="ml-auto" style={{ width: '80%' }}>
        {/* Scrolling track */}
        <div className={`flex flex-row flex-nowrap items-center ${isClient ? 'animate-scroll-track-1' : ''}`} style={{ gap: '4rem', height: '100px' }}>
          {brandLogos.concat(brandLogos).map((logo, logoIndex) => (
            <a
              key={`logo-${logoIndex}`}
              href={logo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {logo.src.endsWith('.svg') ? (
                <img
                  src={logo.src}
                  alt={logo.name}
                  style={{
                    height: logo.size === 'large' ? '96px' : '64px',
                    width: 'auto',
                    display: 'block',
                    maxWidth: logo.size === 'large' ? '240px' : '160px',
                    objectFit: 'contain',
                    verticalAlign: 'middle',
                    marginTop: '-10px'
                  }}
                />
              ) : (
                <Image
                  src={logo.src}
                  alt={logo.name}
                  height={logo.size === 'large' ? 96 : 64}
                  width={logo.size === 'large' ? 192 : 144}
                  className="object-contain align-middle"
                  style={{ maxHeight: logo.size === 'large' ? '96px' : '64px', width: 'auto', verticalAlign: 'middle' }}
                  priority
                />
              )}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel; 
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import Modal from '../Modal';
import { portfolioImages } from './constants';
import PortfolioGallery from './portfolio-gallery';

export default function Portfolio() {
  return (
    <div className="container py-10 md:mb-10 md:py-20">
      <div className="mb-10 flex flex-col">
        <h4 className="text-[1.375rem] font-medium text-white">confira</h4>
        <h2 className="suuk-font-stroke-fill text-[2.8125rem] font-bold text-white md:text-[3.75rem]">
          meu portfólio?
        </h2>

        <span className="block h-0.5 w-32 bg-white" />
        <Link
          href="/portfolio"
          className="mt-7 text-[0.875rem] font-medium text-white underline underline-offset-2"
        >
          veja mais
        </Link>
      </div>

      <div className="columns-2 gap-4 md:columns-7">
        {portfolioImages.map((image) => (
          <Modal
            key={String(image.id)}
            whitCloseButton={false}
            trigger={
              <Image
                src={image.file}
                alt={image.title}
                width={300}
                height={300}
                className="mb-4"
                loading="lazy"
                placeholder="blur"
              />
            }
            content={<PortfolioGallery image={image} />}
          />
        ))}
      </div>
    </div>
  );
}

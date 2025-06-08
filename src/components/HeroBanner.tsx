
import React, { useEffect, useState } from 'react';

const HeroBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-heritage-pistachio/30 rounded-full blur-3xl animate-float" style={{animationDelay: '0s'}} />
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-heritage-sage/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}} />
        <div className="absolute bottom-1/4 left-1/2 w-32 h-32 bg-heritage-gold/20 rounded-full blur-2xl animate-float" style={{animationDelay: '4s'}} />
      </div>

      <div className={`relative z-10 text-center px-6 transition-all duration-1000 ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
        {/* Main Title */}
        <div className="mb-8">
          <h1 className="text-6xl lg:text-8xl font-bold text-heritage-pistachio mb-4 shimmer-text text-shadow-glow">
            هیو
          </h1>
          <div className="h-1 w-32 bg-heritage-gold mx-auto rounded-full mb-6 animate-shimmer" />
          <p className="text-2xl lg:text-3xl text-heritage-sage font-medium mb-2">
            موزه دیجیتال میراث تاریخی
          </p>
          <p className="text-lg text-heritage-mint/80 english-text" dir="ltr">
            Digital Heritage Museum
          </p>
        </div>

        {/* Subtitle */}
        <div className="max-w-4xl mx-auto mb-12">
          <p className="text-xl lg:text-2xl text-heritage-mint leading-relaxed mb-4">
            سفری ۲۰۰۰ ساله به قلب تاریخ و طبیعت البرز
          </p>
          <p className="text-lg text-heritage-sage/80 english-text" dir="ltr">
            A 2000-year journey through the heart of Alborz history and nature
          </p>
        </div>

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="heritage-button text-lg px-8 py-4">
            شروع کاوش
            <span className="text-sm english-text mr-2">Begin Exploration</span>
          </button>
          <button className="border-2 border-heritage-pistachio text-heritage-pistachio px-8 py-4 rounded-lg hover:bg-heritage-pistachio hover:text-heritage-deep-blue transition-all duration-300">
            درباره هیو
            <span className="text-sm english-text mr-2">About Hiv</span>
          </button>
        </div>

        {/* Heritage Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
          <div className="heritage-card text-center">
            <div className="text-3xl font-bold text-heritage-gold mb-2">۲۰۰۰+</div>
            <div className="text-heritage-pistachio">سال تاریخ</div>
            <div className="text-xs text-heritage-sage english-text">Years of History</div>
          </div>
          <div className="heritage-card text-center">
            <div className="text-3xl font-bold text-heritage-gold mb-2">۲۸۷۱</div>
            <div className="text-heritage-pistachio">متر ارتفاع</div>
            <div className="text-xs text-heritage-sage english-text">Meters Height</div>
          </div>
          <div className="heritage-card text-center">
            <div className="text-3xl font-bold text-heritage-gold mb-2">۵+</div>
            <div className="text-heritage-pistachio">دوره تاریخی</div>
            <div className="text-xs text-heritage-sage english-text">Historical Periods</div>
          </div>
          <div className="heritage-card text-center">
            <div className="text-3xl font-bold text-heritage-gold mb-2">۱</div>
            <div className="text-heritage-pistachio">غار باستانی</div>
            <div className="text-xs text-heritage-sage english-text">Ancient Cave</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-heritage-pistachio rounded-full flex justify-center">
            <div className="w-1 h-3 bg-heritage-pistachio rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;


import React, { useEffect, useState } from 'react';
import { ChevronRight, Crown, Sword, Mountain, Pickaxe } from 'lucide-react';

const HistoricalTimeline = () => {
  const [visibleItems, setVisibleItems] = useState(new Set());

  const timelineData = [
    {
      period: 'عصر مفرغ و آهن',
      date: '۳۰۰۰-۵۰۰ ق.م',
      dateEn: '3000-500 BCE',
      description: 'آغاز تمدن در دره‌های هیو با کشف و استخراج فلزات',
      descriptionEn: 'Beginning of civilization in Hiv valleys with metal discovery',
      icon: Pickaxe,
      color: 'heritage-copper'
    },
    {
      period: 'دوره هخامنشی',
      date: '۵۵۰-۳۳۰ ق.م',
      dateEn: '550-330 BCE',
      description: 'هیو به عنوان بخشی از امپراتوری بزرگ پارس',
      descriptionEn: 'Hiv as part of the great Persian Empire',
      icon: Crown,
      color: 'heritage-gold'
    },
    {
      period: 'دوره ساسانی',
      date: '۲۲۴-۶۵۱ م',
      dateEn: '224-651 CE',
      description: 'احداث قلعه گُبران و تحکیم مسیرهای تجاری',
      descriptionEn: 'Construction of Gobran fortress and trade route fortification',
      icon: Sword,
      color: 'heritage-royal-blue'
    },
    {
      period: 'دوران اسماعیلیه',
      date: '۱۰۹۰-۱۲۵۶ م',
      dateEn: '1090-1256 CE',
      description: 'دوره قدرت و نفوذ اسماعیلیان در منطقه',
      descriptionEn: 'Period of Ismaili power and influence in the region',
      icon: Mountain,
      color: 'heritage-sage'
    },
    {
      period: 'دوره قاجار',
      date: '۱۷۹۴-۱۹۲۵ م',
      dateEn: '1794-1925 CE',
      description: 'ساخت حمام تاریخی و توسعه معماری محلی',
      descriptionEn: 'Construction of historical bathhouse and local architecture development',
      icon: Crown,
      color: 'heritage-pistachio'
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleItems(prev => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.3 }
    );

    const elements = document.querySelectorAll('.timeline-item');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-6xl font-bold text-heritage-pistachio mb-6 shimmer-text">
            خط زمان تاریخی
          </h2>
          <p className="text-xl text-heritage-sage mb-4">
            سفری در طول تاریخ ۲۰۰۰ ساله هیو
          </p>
          <p className="text-lg text-heritage-mint/80 english-text" dir="ltr">
            A journey through 2000 years of Hiv's history
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Central Line */}
          <div className="absolute right-1/2 transform translate-x-1/2 w-1 h-full bg-heritage-pistachio/30" />
          
          {timelineData.map((item, index) => {
            const Icon = item.icon;
            const isVisible = visibleItems.has(index);
            const isEven = index % 2 === 0;
            
            return (
              <div
                key={index}
                data-index={index}
                className={`timeline-item relative flex items-center mb-16 ${
                  isEven ? 'flex-row-reverse' : ''
                }`}
              >
                {/* Timeline Point */}
                <div className="absolute right-1/2 transform translate-x-1/2 z-10">
                  <div className={`w-16 h-16 rounded-full border-4 border-heritage-${item.color} bg-heritage-night-blue flex items-center justify-center transition-all duration-700 ${
                    isVisible ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                  }`}>
                    <Icon size={24} className={`text-heritage-${item.color}`} />
                  </div>
                </div>

                {/* Content Card */}
                <div className={`w-5/12 ${isEven ? 'pr-20' : 'pl-20'}`}>
                  <div className={`heritage-card transition-all duration-700 delay-300 ${
                    isVisible ? 'opacity-100 transform translate-x-0' : `opacity-0 transform ${isEven ? 'translate-x-10' : '-translate-x-10'}`
                  }`}>
                    {/* Period Badge */}
                    <div className={`inline-block bg-heritage-${item.color}/20 text-heritage-${item.color} px-4 py-2 rounded-full text-sm font-medium mb-4`}>
                      {item.date}
                      <span className="english-text mr-2 text-xs opacity-80">{item.dateEn}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-heritage-pistachio mb-4">
                      {item.period}
                    </h3>

                    {/* Description */}
                    <p className="text-heritage-sage leading-relaxed mb-4">
                      {item.description}
                    </p>
                    <p className="text-heritage-mint/70 english-text text-sm" dir="ltr">
                      {item.descriptionEn}
                    </p>

                    {/* Learn More Link */}
                    <div className="flex items-center text-heritage-gold hover:text-heritage-copper transition-colors duration-300 mt-4 cursor-pointer">
                      <span className="ml-2">بیشتر بدانید</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HistoricalTimeline;

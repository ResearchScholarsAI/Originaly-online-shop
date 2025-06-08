
import React from 'react';
import Navigation from '../components/Navigation';
import FloatingParticles from '../components/FloatingParticles';
import HeroBanner from '../components/HeroBanner';
import HistoricalTimeline from '../components/HistoricalTimeline';

const Index = () => {
  return (
    <div className="min-h-screen bg-heritage-gradient relative overflow-hidden">
      <FloatingParticles />
      <Navigation />
      
      {/* Hero Section */}
      <section id="hero">
        <HeroBanner />
      </section>

      {/* Introduction Section */}
      <section id="introduction" className="py-20 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-heritage-pistachio mb-8 shimmer-text">
                هیو، جواهری در دل البرز
              </h2>
              <p className="text-lg text-heritage-sage leading-relaxed mb-6">
                هیو، روستایی تاریخی با قدمت بیش از دو هزار سال در شهرستان ساوجبلاغ استان البرز است. 
                این سرزمین باستانی که در گذشته «هوریاوین» (سرزمین مردمان آریایی) نامیده می‌شد، 
                خانه‌ای برای تمدن‌های کهن و میراثی غنی از فرهنگ و طبیعت است.
              </p>
              <p className="text-heritage-mint/80 english-text mb-8" dir="ltr">
                Hiv is a historic village with over 2000 years of history in Savojbolagh county, 
                Alborz province. This ancient land, once called "Horyavin" (Land of Aryan People), 
                has been home to ancient civilizations and rich cultural and natural heritage.
              </p>
              <button className="heritage-button">
                کاوش عمیق‌تر
                <span className="english-text mr-2">Explore Deeper</span>
              </button>
            </div>
            
            <div className="heritage-card">
              <div className="aspect-video bg-heritage-royal-blue/30 rounded-lg mb-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🏔️</div>
                  <p className="text-heritage-sage">تصویر سه‌بعدی غار هیو</p>
                  <p className="text-heritage-mint/70 english-text text-sm">3D View of Hiv Cave</p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-heritage-pistachio mb-4">غار واسوار هیو</h3>
              <p className="text-heritage-sage">
                غاری باشکوه با ارتفاع بیش از ۲۳ متر که از چشمه‌ای از قله شاه‌نشین تغذیه می‌شود.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Historical Timeline Section */}
      <section id="timeline">
        <HistoricalTimeline />
      </section>

      {/* Heritage Highlights */}
      <section id="highlights" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-6xl font-bold text-heritage-pistachio mb-6 shimmer-text">
              جواهرات میراثی
            </h2>
            <p className="text-xl text-heritage-sage">
              آثار شاخص تاریخی و طبیعی هیو
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="heritage-card">
              <div className="text-4xl mb-4">🏰</div>
              <h3 className="text-xl font-bold text-heritage-pistachio mb-4">قلعه گُبران</h3>
              <p className="text-heritage-sage mb-4">
                قلعه‌ای سلجوقی در غرب روستا که نمادی از قدرت و استحکام باستانی است.
              </p>
              <p className="text-heritage-mint/70 english-text text-sm" dir="ltr">
                A Seljuk fortress west of the village, symbol of ancient power and strength.
              </p>
            </div>

            <div className="heritage-card">
              <div className="text-4xl mb-4">🛁</div>
              <h3 className="text-xl font-bold text-heritage-pistachio mb-4">حمام تاریخی</h3>
              <p className="text-heritage-sage mb-4">
                ساختمان قاجاری با قدمت ۱۵۰-۲۰۰ سال که نمونه‌ای از معماری سنتی ایران است.
              </p>
              <p className="text-heritage-mint/70 english-text text-sm" dir="ltr">
                A Qajar-era building, 150-200 years old, exemplifying traditional Iranian architecture.
              </p>
            </div>

            <div className="heritage-card">
              <div className="text-4xl mb-4">⛏️</div>
              <h3 className="text-xl font-bold text-heritage-pistachio mb-4">معادن باستانی</h3>
              <p className="text-heritage-sage mb-4">
                اولین معادن زغال‌سنگ ایران و شهر زیرزمینی معدنچیان با قدمت دو هزار سال.
              </p>
              <p className="text-heritage-mint/70 english-text text-sm" dir="ltr">
                Iran's first coal mines and underground miners' city, 2000 years old.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Environmental Alert */}
      <section id="alert" className="py-20 px-6 bg-gradient-to-r from-red-900/20 to-orange-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-6">⚠️</div>
          <h2 className="text-3xl lg:text-4xl font-bold text-red-400 mb-6">
            هشدار زیست‌محیطی
          </h2>
          <p className="text-xl text-heritage-sage mb-8">
            میراث طبیعی و تاریخی هیو در معرض تهدید فعالیت‌های معدن‌کاری غیرمجاز سیمان آبیک قرار دارد.
          </p>
          <p className="text-lg text-heritage-mint/80 english-text mb-8" dir="ltr">
            Hiv's natural and historical heritage is threatened by unauthorized mining activities of Abik Cement.
          </p>
          <button className="heritage-button bg-red-500 hover:bg-red-600">
            اطلاع بیشتر از تهدیدات
            <span className="english-text mr-2">Learn About Threats</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default Index;

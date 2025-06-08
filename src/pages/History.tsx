
import React from 'react';
import Navigation from '../components/Navigation';
import FloatingParticles from '../components/FloatingParticles';

const History = () => {
  return (
    <div className="min-h-screen bg-heritage-gradient relative">
      <FloatingParticles />
      <Navigation />
      
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-6xl font-bold text-heritage-pistachio mb-6 shimmer-text">
              تاریخچه کامل هیو
            </h1>
            <p className="text-xl text-heritage-sage">
              از هوریاوین باستان تا هیو امروز
            </p>
          </div>

          <div className="heritage-card mb-12">
            <h2 className="text-3xl font-bold text-heritage-pistachio mb-6">نام‌گذاری و ریشه‌های تاریخی</h2>
            <p className="text-lg text-heritage-sage leading-relaxed mb-4">
              نام اصلی این منطقه در دوران باستان «هوریاوین» بوده است که به معنای «سرزمین مردمان آریایی» 
              می‌باشد. با گذر زمان این نام به «هیوین» و سپس به شکل امروزی «هیو» تبدیل شده است.
            </p>
            <p className="text-heritage-mint/80 english-text" dir="ltr">
              The original name of this region in ancient times was "Horyavin" meaning "Land of Aryan People". 
              Over time, this name evolved to "Hivin" and then to the current form "Hiv".
            </p>
          </div>

          <div className="space-y-12">
            {/* Add detailed historical periods content here */}
            <div className="heritage-card">
              <h3 className="text-2xl font-bold text-heritage-gold mb-4">عصر مفرغ و آهن</h3>
              <p className="text-heritage-sage leading-relaxed">
                قدیمی‌ترین نشانه‌های تمدن در هیو به عصر مفرغ و آهن بازمی‌گردد...
              </p>
            </div>
            
            {/* Continue with other periods */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;

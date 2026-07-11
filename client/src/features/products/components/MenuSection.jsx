import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryCard } from './CategoryCard';
import { SectionHeading } from '../../../components/ui/SectionHeading';
import { api } from '../../../utils/api';

export const MenuSection = () => {
  const [quickTabs, setQuickTabs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuickTabs = async () => {
      try {
        const response = await api.get('/quicktabs');
        if (response.data?.data) {
          setQuickTabs(response.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch quicktabs', err);
      }
    };
    fetchQuickTabs();
  }, []);
  return (
    <section className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 py-12">
      <SectionHeading title="Our Menu" showSeeAll={true} onSeeAllClick={() => {}} />
      
        
        {/* Menu Categories Carousel */}
        <div className="flex space-x-4 overflow-x-auto scrollbar-hide py-4 px-2 -mx-2">
          {quickTabs.map((tab) => (
            <CategoryCard
              key={tab._id}
              name={tab.name}
              image={tab.imageUrl}
              onClick={() => navigate('/menu', { state: { tabId: tab._id } })}
            />
          ))}
        </div>
      
      <div className="mt-12 flex justify-center">
        <button 
          onClick={() => navigate('/menu')}
          className="bg-brown text-white font-bold text-lg md:text-xl py-4 px-12 rounded-full hover:bg-[#682e1b] transition-colors uppercase tracking-wide shadow-md cursor-pointer"
        >
          Explore Full Menu
        </button>
      </div>
    </section>
  );
};

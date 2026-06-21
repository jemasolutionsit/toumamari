import { motion } from "motion/react";
import { Clock, MapPin, ArrowRight, Tag } from "lucide-react";
import { Tour } from "../data";

interface TourCardProps {
  tour: Tour;
  onClick: () => void;
  btnText: string;
  ofertaText: string;
}

export function TourCard({ tour, onClick, btnText, ofertaText }: TourCardProps) {
  return (
    <motion.article
      onClick={onClick}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="group cursor-pointer bg-white border border-neutral-200/80 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-yellow-500/10 transition-all duration-500 flex flex-col h-full"
    >
      <div className="relative h-72 overflow-hidden bg-neutral-200">
        <img 
          src={tour.image} 
          alt={tour.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full border border-white/10 shadow-lg">
          {tour.type}
        </div>
        {tour.discountPercentage && (
          <div className="absolute top-4 right-4 bg-[#FFD700] text-black text-xs font-black uppercase tracking-wider px-4 py-2 rounded-full shadow-lg flex items-center gap-1">
            <Tag className="w-3 h-3" /> {ofertaText} {tour.discountPercentage}%
          </div>
        )}
      </div>
      
      <div className="p-8 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-4 gap-4">
          <h3 className="font-black text-2xl text-neutral-900 leading-tight">{tour.title}</h3>
          <div className="flex flex-col items-end">
            {tour.originalPrice && (
              <span className="text-sm text-neutral-400 line-through font-semibold mb-0.5">${tour.originalPrice}</span>
            )}
            <span className="font-black text-2xl text-yellow-600">${tour.price}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6 text-sm text-neutral-500 font-semibold mb-6">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-600" />
            <span>{tour.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-yellow-600" />
            <span>Rapa Nui</span>
          </div>
        </div>
        
        <p className="text-neutral-600 mb-8 leading-relaxed font-medium text-sm flex-grow">
          {tour.description}
        </p>
        
        <div className="pt-6 border-t border-neutral-100 flex gap-4 mt-auto">
          <button className="flex-grow bg-neutral-900 text-white py-4 rounded-2xl text-sm font-bold uppercase tracking-wider hover:bg-[#FFD700] hover:text-black transition-all duration-300 flex items-center justify-center gap-2 group/btn">
            {btnText}
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

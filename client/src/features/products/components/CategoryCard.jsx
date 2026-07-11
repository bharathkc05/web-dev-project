export const CategoryCard = ({ name, image, onClick }) => {
  return (
    <div className="flex-none w-32 md:w-40 flex flex-col items-center cursor-pointer group" onClick={onClick}>
      <div className="w-32 h-32 md:w-40 md:h-40 bg-surface-container-lowest rounded-xl shadow-sm mb-3 overflow-hidden flex items-center justify-center group-hover:shadow-md transition-shadow">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="placeholder-box w-full h-full text-xs flex items-center justify-center">
            [No Image]
          </div>
        )}
      </div>
      <h3 className="text-center font-bold text-sm md:text-base leading-tight group-hover:text-primary transition-colors">
        {name}
      </h3>
    </div>
  );
};

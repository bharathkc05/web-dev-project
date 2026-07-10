export const SectionHeading = ({ title, showSeeAll = false, onSeeAllClick }) => {
  return (
    <div className="flex justify-between items-end mb-8">
      <h2 className="text-3xl md:text-4xl font-black text-on-surface uppercase tracking-tight">
        {title}
      </h2>
      {showSeeAll && (
        <a
          href="#"
          onClick={onSeeAllClick}
          className="text-primary font-bold hover:underline flex items-center text-sm md:text-base"
        >
          See All <i className="fas fa-chevron-right ml-1 text-xs"></i>
        </a>
      )}
    </div>
  );
};

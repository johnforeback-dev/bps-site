export default function Media({ src, alt = '', className = '', priority = false }: { src: string | null; alt?: string; className?: string; priority?: boolean }) {
  return (
    <div className={`media ${className}`}>
      {src && <img src={src} alt={alt} loading={priority ? 'eager' : 'lazy'} decoding="async" />}
    </div>
  );
}

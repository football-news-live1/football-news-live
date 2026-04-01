import Image from 'next/image';

interface LeagueBadgeProps {
  name: string;
  logo: string;
  country?: string;
  flag?: string | null;
  round?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function LeagueBadge({ name, logo, country, flag, round, size = 'md' }: LeagueBadgeProps) {
  const imgSize = size === 'sm' ? 20 : size === 'lg' ? 32 : 24;
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm';

  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="relative flex-shrink-0" style={{ width: imgSize, height: imgSize }}>
        <Image
          src={logo}
          alt={`${name} logo`}
          width={imgSize}
          height={imgSize}
          className="object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/league-placeholder.png';
          }}
        />
      </div>
      <div className="min-w-0">
        <span className={`${textSize} font-semibold text-white truncate block`}>{name}</span>
        {country && (
          <div className="flex items-center gap-1 mt-0.5">
            {flag && (
              <Image
                src={flag}
                alt={country}
                width={14}
                height={10}
                className="object-contain rounded-sm"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            {round && <span className="text-[10px] text-gray-400 truncate">{round}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

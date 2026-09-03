import Image from "next/image";

export function PlateFrame({
  src,
  alt,
  width,
  height,
  priority,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
}) {
  return (
    <div className="plate-frame">
      <Image src={src} alt={alt} width={width} height={height} priority={priority} />
    </div>
  );
}

export function PlateCaption({
  latin,
  common,
  accession,
}: {
  latin: string;
  common: string;
  accession: string;
}) {
  return (
    <div className="plate-caption">
      <span className="latin">
        {latin}
        <span className="common">{common}</span>
      </span>
      <span className="accession">{accession}</span>
    </div>
  );
}

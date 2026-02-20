import Image from "next/image";
import React from "react";

type MdxImageProps = React.ImgHTMLAttributes<HTMLImageElement>;

export function MdxImage({ src, alt, width, height, ...props }: MdxImageProps) {
  if (!src) return null;

  return (
    <span className="my-6 block relative rounded-lg overflow-hidden border">
      <Image
        src={src as string}
        alt={alt || ""}
        sizes="100vw"
        width={width ? Number(width) : 0}
        height={height ? Number(height) : 0}
        style={{ width: "100%", height: "auto" }}
        className="m-0"
        {...props}
      />
    </span>
  );
}

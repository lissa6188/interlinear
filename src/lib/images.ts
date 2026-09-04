const OPTIMIZABLE_IMAGE = /\.(png|jpe?g)$/i;

/** 원본 URL에 대응하는 빌드 생성 WebP URL. SVG·GIF·기존 WebP·외부 주소는 그대로 둔다. */
export function optimizedImageUrl(url: string): string {
  if (!url.startsWith('/') || !OPTIMIZABLE_IMAGE.test(url)) return url;
  return url.replace(OPTIMIZABLE_IMAGE, '.optimized.webp');
}

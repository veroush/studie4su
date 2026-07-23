// Decorative only — renders a handful of floating stickman/icon svgs
// behind the hero content. Purely visual, no props needed yet; your
// classmate can swap the image list or positions freely.
const ICONS = [
  '/img/chasing-1.svg',
  '/img/running-2.svg',
  '/img/painting-3.svg',
  '/img/stickman-exploring1.svg',
]

export function FloatingIconsBackground() {
  return (
    <div aria-hidden="true">
      {ICONS.map((src) => (
        <img key={src} src={src} alt="" />
      ))}
    </div>
  )
}

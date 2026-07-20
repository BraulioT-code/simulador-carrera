/** Bandera real desde flagcdn.com (code ISO, ej: "de", "ar", "gb-eng") */
export default function Flag({ code, className = "w-5 h-[14px]" }) {
  if (!code) return null;
  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
      alt=""
      loading="lazy"
      className={`${className} shrink-0 rounded-[2px] object-cover`}
    />
  );
}

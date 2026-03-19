import { useTheme } from "./ThemeContext";

export default function ThemeToggle() {
  const { dark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className={`
        group relative flex items-center gap-2.5
        px-4 py-2 rounded-xl
        border font-mono text-[11px] font-black tracking-widest uppercase
        transition-all duration-300 ease-out
        ${dark
          ? "bg-white/[0.05] border-white/[0.1] text-zinc-300 hover:border-white/20 hover:bg-white/[0.09]"
          : "bg-zinc-100 border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-200"
        }
      `}
    >
      {/* Track */}
      <span
        className={`
          relative inline-flex w-9 h-5 rounded-full border transition-all duration-300
          ${dark
            ? "bg-red-500/20 border-red-500/40"
            : "bg-zinc-300 border-zinc-300"
          }
        `}
      >
        {/* Thumb */}
        <span
          className={`
            absolute top-0.5 w-4 h-4 rounded-full shadow-sm
            transition-all duration-300 ease-out
            ${dark
              ? "translate-x-4 bg-red-400"
              : "translate-x-0.5 bg-white"
            }
          `}
        />
      </span>
      <span className={dark ? "text-zinc-400" : "text-zinc-500"}>
        {dark ? "Dark" : "Light"}
      </span>
      {/* Icon */}
      {dark ? (
        <svg className="w-3.5 h-3.5 text-zinc-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
}
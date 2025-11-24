type Props = {
  pressed: boolean;
  onClick: () => void;
  className?: string;
  labelWhenShown?: string;
  labelWhenHidden?: string;
};

export function EyeToggleBtn({
  pressed,
  onClick,
  className,
  labelWhenShown = "Hide password",
  labelWhenHidden = "Show password",
}: Props) {
  return (
    <button
      type="button"
      aria-label={pressed ? labelWhenShown : labelWhenHidden}
      aria-pressed={pressed}
      onClick={onClick}
      className={className}
    >
      {pressed ? <EyeOffIcon /> : <EyeIcon />}
    </button>
  );
}

function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      focusable="false"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322C3.423 7.938 7.36 5 12 5c4.64 0 8.577 2.938 9.964 7.322a.78.78 0 010 .356C20.577 17.062 16.64 20 12 20c-4.64 0-8.577-2.938-9.964-7.322a.78.78 0 010-.356z"
      />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      focusable="false"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 15.338 6.91 18.25 12 18.25c1.62 0 3.108-.267 4.43-.74M6.228 6.228A10.45 10.45 0 0112 5.75c5.09 0 8.774 2.912 10.066 6.25-.44 1.133-1.138 2.192-2.056 3.12M6.228 6.228L3 3m3.228 3.228L21 21M9.75 9.75a3 3 0 104.5 4.5"
      />
    </svg>
  );
}

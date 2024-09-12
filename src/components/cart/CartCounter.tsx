
export const CartCounter = () => {
  return (
    <a href="/cart" className="relative inline-block">
      <span className="absolute -top-2 -right-2 flex justify-center items-center bg-blue-600 text-white text-xs rounded-full w-5 h-5">
        3
      </span>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1.5rem"
        height="1.5rem"
        viewBox="0 0 512 512"
      >
        <circle
          cx={176}
          cy={416}
          r={16}
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        ></circle>
        <circle
          cx={400}
          cy={416}
          r={16}
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
        ></circle>
        <path
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
          d="M48 80h64l48 272h256"
        ></path>
        <path
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
          d="M160 288h249.44a8 8 0 0 0 7.85-6.43l28.8-144a8 8 0 0 0-7.85-9.57H128"
        ></path>
      </svg>
    </a>
  );
}

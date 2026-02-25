type QuoteIconProps = {
  className?: string;
};

const QuoteIcon = ({ className }: QuoteIconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="44"
      height="33"
      viewBox="0 0 44 33"
      fill="none"
      className={className}
    >
      <path
        d="M19.0579 22.7327C19.0579 27.7721 15.5877 31.5898 10.307 31.5898C5.02632 31.5898 0.5 27.314 0.5 19.6785C0.5 10.2105 7.59123 2.11694 16.7947 0.589844V6.24009C11.514 7.30905 7.59123 11.1268 7.59123 15.5554C8.49649 14.9445 9.70351 14.4864 11.6649 14.4864C15.5877 14.4864 19.0579 17.3879 19.0579 22.7327ZM43.5 22.7327C43.5 27.7721 39.8789 31.5898 34.5982 31.5898C29.4684 31.5898 24.7912 27.314 24.7912 19.6785C24.7912 10.2105 31.8825 2.11694 41.2368 0.589844V6.24009C35.9561 7.30905 32.0333 11.1268 32.0333 15.4027C32.9386 14.7918 34.2965 14.4864 36.107 14.4864C40.0298 14.4864 43.5 17.3879 43.5 22.7327Z"
        fill="url(#paint0_linear_519_7032)"
        fillOpacity="0.2"
        stroke="url(#paint1_linear_519_7032)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_519_7032"
          x1="22"
          y1="0.589844"
          x2="22"
          y2="31.5898"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#DCA663" />
          <stop offset="1" stopColor="#183369" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_519_7032"
          x1="0.500001"
          y1="1.08984"
          x2="47"
          y2="32.0898"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" />
          <stop offset="0.294339" stopColor="white" stopOpacity="0.1" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default QuoteIcon;

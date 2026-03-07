import {NavLink} from 'react-router';

export function CoinPlugzLogo() {
  return (
    <NavLink
      prefetch="intent"
      to="/"
      end
      className="coinplugz-logo"
      aria-label="Coinplugz"
    >
      {/* Electric C Icon */}
      <span className="cp-icon">
        <svg
          viewBox="0 0 58 58"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="29"
            cy="29"
            r="26"
            stroke="#00ff78"
            strokeWidth="1"
            opacity="0.12"
          />
          <path
            d="M40 16 L22 16 Q10 16 10 29 Q10 42 22 42 L40 42"
            stroke="#00ff78"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M36 10 L28 26 L38 26 L26 48"
            stroke="#00ff78"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.5"
          />
          <circle cx="36" cy="10" r="1.8" fill="#00ff78" opacity="0.7" />
          <circle cx="26" cy="48" r="1.8" fill="#00ff78" opacity="0.7" />
          <path
            d="M42 18 L46 14"
            stroke="#00ff78"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.4"
          />
          <path
            d="M42 40 L46 44"
            stroke="#00ff78"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.4"
          />
        </svg>
      </span>

      {/* Wordmark */}
      <span className="cp-wordmark">
        <span className="cp-coin">Coin</span>
        <span className="cp-wire">
          <svg
            viewBox="0 0 36 38"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 19 L6 19 L9 12 L13 26 L17 10 L21 28 L25 13 L28 19 L34 19"
              stroke="#00ff78"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="2" cy="19" r="2" fill="#00ff78" opacity="0.8" />
            <circle cx="34" cy="19" r="2" fill="#00ff78" opacity="0.8" />
            <circle cx="17" cy="8" r="1.2" fill="#00ff78" className="cpsk1" />
            <circle cx="22" cy="30" r="1" fill="#00ff78" className="cpsk2" />
            <circle cx="12" cy="28" r="0.8" fill="#00ff78" className="cpsk3" />
          </svg>
        </span>
        <span className="cp-plugz">plugz</span>
      </span>
    </NavLink>
  );
}

import {
  useState,
  useRef,
  useEffect,
} from "react";

import "./Dropdown.css";

const Dropdown = ({
  value,
  options,
  onChange,
  width = 140,
}) => {
  const [
    open,
    setOpen,
  ] = useState(false);

  const ref =
    useRef(null);

  useEffect(() => {
    const close = (
      e
    ) => {
      if (
        ref.current &&
        !ref.current.contains(
          e.target
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      close
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        close
      );
  }, []);

  return (
    <div
      ref={ref}
      className="dropdown"
      style={{
        width,
      }}
    >
      <button
        className="dropdown-trigger"
        onClick={() =>
          setOpen(
            !open
          )
        }
      >
        <span>
          {value}
        </span>

        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M6 9L12 15L18 9"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="dropdown-menu">
          {options.map(
            (
              option
            ) => (
              <button
                key={
                  option
                }
                className={`dropdown-item ${
                  value ===
                  option
                    ? "selected"
                    : ""
                }`}
                onClick={() => {
                  onChange(
                    option
                  );

                  setOpen(
                    false
                  );
                }}
              >
                <span>
                  {
                    option
                  }
                </span>

                {value ===
                  option && (
                  <span className="checkmark">
                    &#10003;
                  </span>
                )}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Dropdown;

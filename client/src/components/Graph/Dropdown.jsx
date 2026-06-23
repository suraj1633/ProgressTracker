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
  const normalizedOptions =
    options.map((option) =>
      typeof option === "object"
        ? option
        : {
            value: option,
            label: option,
          }
    );

  const selectedOption =
    normalizedOptions.find(
      (option) =>
        option.value === value
    );

  const selectedLabel =
    selectedOption?.label || value;

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
        type="button"
        className="dropdown-trigger"
        onClick={() =>
          setOpen(
            !open
          )
        }
      >
        <span>
          {selectedLabel}
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
          {normalizedOptions.map(
            (
              option
            ) => (
              <button
                type="button"
                key={
                  option.value
                }
                className={`dropdown-item ${
                  value ===
                  option.value
                    ? "selected"
                    : ""
                }`}
                onClick={() => {
                  onChange(
                    option.value
                  );

                  setOpen(
                    false
                  );
                }}
              >
                <span>
                  {
                    option.label
                  }
                </span>
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Dropdown;

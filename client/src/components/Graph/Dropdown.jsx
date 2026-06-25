import {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { createPortal } from "react-dom";

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

  const [
    menuStyle,
    setMenuStyle,
  ] = useState({});

  const ref =
    useRef(null);

  const menuRef =
    useRef(null);

  const updateMenuPosition = useCallback(() => {
    if (!ref.current)
      return false;

    const rect =
      ref.current.getBoundingClientRect();

    const gap = 8;
    const menuHeight = 260;
    const viewportPadding = 12;
    const spaceBelow =
      window.innerHeight -
      rect.bottom -
      viewportPadding;

    setMenuStyle({
      left: `${Math.max(
        viewportPadding,
        Math.min(
          rect.left + window.scrollX,
          window.innerWidth -
            rect.width -
            viewportPadding +
            window.scrollX
        )
      )}px`,
      top: `${
        rect.bottom +
        window.scrollY +
        gap
      }px`,
      bottom: "auto",
      width: `${rect.width}px`,
      maxHeight: `${Math.min(
        menuHeight,
        Math.max(
          160,
          spaceBelow - gap
        )
      )}px`,
    });

    return true;
  }, []);

  useEffect(() => {
    const close = (
      e
    ) => {
      if (
        ref.current &&
        !ref.current.contains(
          e.target
        ) &&
        (
          !menuRef.current ||
          !menuRef.current.contains(
            e.target
          )
        )
      ) {
        setOpen(false);
      }
    };

    const closeOnEscape = (
      e
    ) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      close
    );
    document.addEventListener(
      "keydown",
      closeOnEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        close
      );
      document.removeEventListener(
        "keydown",
        closeOnEscape
      );
    };
  }, []);

  useEffect(() => {
    if (!open)
      return;

    updateMenuPosition();

    const closeOnResize = () => {
      setOpen(false);
    };

    window.addEventListener(
      "resize",
      closeOnResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        closeOnResize
      );
    };
  }, [open, updateMenuPosition]);

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
        onClick={() => {
          if (!open) {
            updateMenuPosition();
          }

          setOpen(
            !open
          );
        }}
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

      {open &&
        createPortal(
          <div
            ref={menuRef}
            className="dropdown-menu dropdown-menu-portal"
            style={menuStyle}
          >
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
          </div>,
          document.body
        )}
    </div>
  );
};

export default Dropdown;

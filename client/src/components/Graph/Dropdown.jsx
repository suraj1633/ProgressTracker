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
  portal = true,
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
  const portalRef =
    useRef(portal);

  const updateMenuPosition = useCallback(() => {
    if (!ref.current)
      return false;

    const rect =
      ref.current.getBoundingClientRect();

    const gap = 8;
    const viewportPadding = 12;
    const menuWidth =
      Math.max(
        rect.width,
        180
      );
    const preferredLeft =
      rect.right -
      menuWidth;
    const bottomReservedSpace =
      window.matchMedia(
        "(max-width: 700px)"
      ).matches
        ? 96
        : 0;
    const spaceBelow =
      window.innerHeight -
      rect.bottom -
      viewportPadding -
      bottomReservedSpace;
    const maxHeight =
      Math.min(
        168,
        Math.max(
          120,
          spaceBelow - gap
        )
      );
    const menuTop =
      rect.bottom +
      gap;

    setMenuStyle({
      left: `${Math.max(
        viewportPadding,
        Math.min(
          preferredLeft,
          window.innerWidth -
            menuWidth -
            viewportPadding
        )
      )}px`,
      top: `${menuTop}px`,
      bottom: "auto",
      width: `${menuWidth}px`,
      maxHeight: `${maxHeight}px`,
    });

    return true;
  }, []);

  useEffect(() => {
    portalRef.current = portal;
  }, [portal]);

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

    if (!portalRef.current)
      return;

    updateMenuPosition();

    const closeOnResize = () => {
      setOpen(false);
    };

    const reposition = () => {
      updateMenuPosition();
    };

    window.addEventListener(
      "resize",
      closeOnResize
    );
    window.addEventListener(
      "scroll",
      reposition,
      true
    );

    return () => {
      window.removeEventListener(
        "resize",
        closeOnResize
      );
      window.removeEventListener(
        "scroll",
        reposition,
        true
      );
    };
  }, [open, updateMenuPosition]);

  const menu = (
    <div
      ref={menuRef}
      className={`dropdown-menu ${
        portal
          ? "dropdown-menu-portal"
          : "dropdown-menu-inline"
      }`}
      style={
        portal
          ? menuStyle
          : undefined
      }
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
    </div>
  );

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
          if (!open && portal) {
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
        (portal
          ? createPortal(
              menu,
              document.body
            )
          : menu)}
    </div>
  );
};

export default Dropdown;

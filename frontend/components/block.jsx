export function Block({ children, className, ...props }) {
    return (
      <div
        className={`container px-2 max-w-7xl mx-auto ${className || ""}`}
        {...props}
      >
        {children}
      </div>
    );
  }
  
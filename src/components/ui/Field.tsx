import { cn } from "@/lib/utils";

type FieldProps = {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
};

export function Field({ label, id, error, children, className }: FieldProps) {
  return (
    <div className={cn("layout-stack-sm", className)}>
      <label htmlFor={id} className="type-caption text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="type-caption text-warm" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const inputStyles =
  "w-full min-h-12 rounded-md border border-border-subtle bg-surface px-4 py-3 text-base text-ink transition-colors duration-200 placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

type InputProps = React.ComponentProps<"input"> & {
  id: string;
};

export function Input({ className, id, ...props }: InputProps) {
  return (
    <input id={id} className={cn(inputStyles, className)} {...props} />
  );
}

type TextareaProps = React.ComponentProps<"textarea"> & {
  id: string;
};

export function Textarea({ className, id, ...props }: TextareaProps) {
  return (
    <textarea
      id={id}
      className={cn(inputStyles, "min-h-32 resize-y", className)}
      {...props}
    />
  );
}

type SelectProps = React.ComponentProps<"select"> & {
  id: string;
};

export function Select({ className, id, children, ...props }: SelectProps) {
  return (
    <select id={id} className={cn(inputStyles, className)} {...props}>
      {children}
    </select>
  );
}

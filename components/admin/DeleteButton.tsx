"use client";

// Envuelve una server action de borrado con confirm(). El action se pasa como prop
// (referencia serializable) desde un server component.
export function DeleteButton({
  action,
  id,
  message,
  label = "Eliminar",
  className = "font-mono text-[10px] font-bold text-rojo-bandera hover:underline",
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  message: string;
  label?: string;
  className?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}

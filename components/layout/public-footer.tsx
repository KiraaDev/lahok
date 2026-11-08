type Props = { left: string; right: string };

export function PublicFooter({ left, right }: Props) {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>{left}</p>
        <p>{right}</p>
      </div>
    </footer>
  );
}
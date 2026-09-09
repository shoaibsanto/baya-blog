export function StepByStep({ steps }: { steps: { title: string; text: string }[] }) {
  return (
    <ol className="my-5 space-y-4">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
            {i + 1}
          </span>
          <div>
            <p className="font-semibold text-foreground">{step.title}</p>
            <p className="text-[0.95rem] leading-7 text-muted">{step.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

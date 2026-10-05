import WeekTasks from "@/app/(components)/WeekTasks";

export const metadata = { title: "Wochenplan" };

export default function WochenplanPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <div>
        <h1 className="font-display text-[28px] leading-tight text-ink">Wochenplan</h1>
        <p className="text-[13px] text-muted">Aufgaben des Teams für die Woche – farbig nach Bereich.</p>
      </div>
      <WeekTasks tall />
    </div>
  );
}

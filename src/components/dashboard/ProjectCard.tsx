import {Pin} from "lucide-react";

type ProjectCardProps = {
    title: string;
    description: string;
    pinned?: boolean;       
};

export default function ProjectCard({
    title,description,pinned = false,}: ProjectCardProps){
       return (
  <div
    className="
      group relative overflow-hidden rounded-none
      border border-white/10
      bg-gradient-to-br from-[#1A2333] to-[#111827]
      p-7
      transition-all duration-300
      hover:-translate-y-1.5
      hover:border-white/20
      hover:shadow-2xl
    "
  >
    <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
    </div>

    <div className="relative z-10 flex h-full flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {title}
          </h2>

          <p className="mt-3 max-w-[220px] text-sm leading-6 text-white/60">
            {description}
          </p>
        </div>

        {pinned && (
          <div className="rounded-full bg-white/10 p-2 text-white/70">
            <Pin size={16} />
          </div>
        )}
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/50">
            Current
          </span>

          <span className="text-sm text-cyan-300">
            Active
          </span>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-[60%] rounded-full bg-cyan-400" />
        </div>
      </div>
    </div>
  </div>
);
}
import {Pin} from "lucide-react";

type ProjectCardProps = {
    title: string;
    description: string;
    pinned?: boolean;       
};

export default function ProjectCard({
    title,description,pinned = false,}: ProjectCardProps){
        return(

            <div className="group relative overflow-hidden rounded-none 
                            border border-white/10 bg-white/5 p-6  transition-all  duration-300
                            hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]">

            <div className="flex item-satrt justify-between">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">
                        {title}
                    </h2>

                    <p className="mt-2 text-sm text-white/60">
                        {description}
                    </p>
                </div>

                {pinned && (
                    <div className="rounded-full border border-white/10 bg-white/10 p-2">
                        <Pin size={16}/>
                    </div>
                )}
                 </div> 

                          <div className="mt-8 flex items-center gap-2">
                             <div className="h-2 w-20 rounded-full bg-cyan-400" />
                              <span className="text-xs text-white/40">
                                 Active
                                    </span>
                            </div>          
                            </div>
        );
}
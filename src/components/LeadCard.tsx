import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  ExternalLink,
  Calendar,
  Users,
} from "lucide-react";

export interface Lead {
  id: string;
  companyName: string;
  location: string;
  email: string;
  phoneNumber: string;
  businessType: string;
  websiteUrl: string;
  lastUpdate: string;
  registeredDate: string;
  employeeCount: string;
}

interface LeadCardProps {
  lead: Lead;
}

export const LeadCard = ({ lead }: LeadCardProps) => {
  return (
    <Card className="relative p-0 overflow-hidden bg-white border-2 border-black rounded-none transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group">
      {/* MANGA ACCENT BAR (Top) */}
      <div className="h-1.5 bg-red-600 border-b-2 border-black" />

      <div className="p-6 space-y-4">
        {/* COMPANY HEADER */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-1 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Building2 className="h-6 w-6 text-black" />
            </div>
            <div>
              <h3 className="font-black italic text-xl uppercase tracking-tighter text-black group-hover:text-red-600 transition-colors">
                {lead.companyName}
              </h3>
              {lead.businessType && (
                <Badge className="mt-1 rounded-none border-2 border-black bg-black text-white hover:bg-red-600 font-bold uppercase text-[10px]">
                  {lead.businessType}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* BOLD DIVIDER */}
        <div className="h-[2px] bg-black w-full" />

        {/* CONTACT INFO SECTION */}
        <div className="space-y-3">
          {lead.location && (
            <div className="flex items-center gap-3 text-sm font-bold text-black uppercase">
              <MapPin className="h-4 w-4 text-red-600" />
              <span className="border-b-1 border-black/20">
                {lead.location}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-2">
            {lead.phoneNumber && (
              <a
                href={`tel:${lead.phoneNumber}`}
                className="flex items-center gap-3 text-sm font-medium hover:text-red-600 transition-colors"
              >
                <Phone className="h-4 w-4 text-black" />
                {lead.phoneNumber}
              </a>
            )}

            {lead.email && (
              <a
                href={`mailto:${lead.email}`}
                className="flex items-center gap-3 text-sm font-medium hover:text-red-600 transition-colors"
              >
                <Mail className="h-4 w-4 text-black" />
                <span className="underline decoration-red-600 decoration-2 underline-offset-2">
                  {lead.email}
                </span>
              </a>
            )}
          </div>

          {lead.websiteUrl && (
            <a
              href={lead.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1 bg-red-600 text-white border-2 border-black font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
            >
              Link <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* FOOTER METRICS */}
        <div className="pt-4 mt-2 border-t-2 border-black border-dashed flex flex-wrap gap-x-6 gap-y-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-black" />
            <span className="text-xs font-black uppercase italic text-red-600">
              Staff: {lead.employeeCount || "0"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-bold text-black/60 uppercase">
            <Calendar className="h-3 w-3" />
            Updated: {lead.lastUpdate || "N/A"}
          </div>
        </div>
      </div>
    </Card>
  );
};

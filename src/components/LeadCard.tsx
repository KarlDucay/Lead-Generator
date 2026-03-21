import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  ExternalLink, 
  Calendar,
  Users 
} from 'lucide-react';

// ✅ UPDATED Interface - Your 9 fields
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
    <Card className="p-6 hover:shadow-lg transition-all duration-300 border-border backdrop-blur-sm bg-card/80 group">
      <div className="space-y-4">
        {/* ✅ COMPANY HEADER */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                {lead.companyName}
              </h3>
              {/* ✅ BUSINESS TYPE BADGE */}
              {lead.businessType && (
                <Badge variant="secondary" className="mt-1">
                  {lead.businessType}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* ✅ CONTACT & LOCATION INFO */}
        <div className="space-y-2">
          {/* LOCATION */}
          {lead.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{lead.location}</span>
            </div>
          )}
          
          {/* PHONE */}
          {lead.phoneNumber && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <a 
                href={`tel:${lead.phoneNumber}`} 
                className="hover:text-primary transition-colors"
              >
                {lead.phoneNumber}
              </a>
            </div>
          )}
          
          {/* EMAIL */}
          {lead.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <a 
                href={`mailto:${lead.email}`} 
                className="hover:text-primary transition-colors"
              >
                {lead.email}
              </a>
            </div>
          )}
          
          {/* WEBSITE */}
          {lead.websiteUrl && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" />
              <a 
                href={lead.websiteUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors flex items-center gap-1"
              >
                Visit Website
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>

        {/* ✅ DATES & EMPLOYEE COUNT */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
          {/* LAST UPDATE */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span className="text-xs">Last Update:</span>
            <span className="font-medium">{lead.lastUpdate || 'N/A'}</span>
          </div>
          
          {/* REGISTERED DATE */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span className="text-xs">Registered:</span>
            <span className="font-medium">{lead.registeredDate || 'N/A'}</span>
          </div>
        </div>

        {/* EMPLOYEE COUNT */}
        {lead.employeeCount && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
            <Users className="h-4 w-4" />
            <span className="font-medium">{lead.employeeCount} employees</span>
          </div>
        )}
      </div>
    </Card>
  );
};
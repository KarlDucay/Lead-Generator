import { LeadCard, Lead } from '@/components/LeadCard';
import { Button } from '@/components/ui/button';
import { FileJson, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ResultsSectionProps {
  leads: Lead[];
}

export const ResultsSection = ({ leads }: ResultsSectionProps) => {
  const { toast } = useToast();

  const exportToJSON = () => {
    const dataStr = JSON.stringify(leads, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export successful",
      description: `${leads.length} leads exported as JSON`,
    });
  };

  const exportToCSV = () => {
    // ✅ FIXED: Remove duplicate if statement
    if (leads.length === 0) return;

    // ✅ PERFECT HEADERS - Your 9 exact fields
    const headers = [
      'Company Name',
      'Location', 
      'Email',
      'Phone Number',
      'Business Type',
      'Website URL',
      'Last Update',
      'Registered Date',
      'Employee Count'
    ];
    
    const csvRows = [
      headers.join(','),
      ...leads.map(lead => [
        `"${lead.companyName}"`,
        `"${lead.location}"`,
        `"${lead.email}"`,
        `"${lead.phoneNumber}"`,
        `"${lead.businessType}"`,
        `"${lead.websiteUrl}"`,
        `"${lead.lastUpdate}"`,
        `"${lead.registeredDate}"`,
        `"${lead.employeeCount}"`
      ].join(','))
    ];

    const csvString = csvRows.join('\n');
    const dataBlob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: `${leads.length} leads exported as CSV`,
    });
  };

  // ✅ FIXED: Show empty state instead of null
  if (!Array.isArray(leads) || leads.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-lg">No leads found yet...</p>
        <p className="text-sm mt-2">Start scraping to see results here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Scraped Leads
          </h2>
          <p className="text-muted-foreground mt-1">
            Found {leads.length} lead{leads.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={exportToJSON}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <FileJson className="h-4 w-4" />
            JSON
          </Button>
          <Button
            onClick={exportToCSV}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leads.map((lead) => (
          // ✅ FIXED: Use lead.id instead of companyName for key
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  );
};
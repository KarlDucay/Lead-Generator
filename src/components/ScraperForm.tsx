import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  Search,
  Globe,
  MapPin,
  List,
  Sheet,
  Building2,
  Map,
  Link,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ScraperSource =
  | "google-maps"
  | "google"
  | "business-list"
  | "serper search"
  | "serper places";

interface ScraperFormProps {
  onScrape: (
    query: string,
    source: ScraperSource,
    sheetName: string,
    sheetId: string,
  ) => void;
  isLoading: boolean;
  initialQuery?: string;
  initialSheetId?: string;
  initialSheetName?: string;
}

export const ScraperForm = ({
  onScrape,
  isLoading,
  initialQuery = "",
  initialSheetId = "",
  initialSheetName = "",
}: ScraperFormProps) => {
  const [query, setQuery] = useState(initialQuery);
  const [source, setSource] = useState<ScraperSource>("google-maps");
  const [sheetName, setSheetName] = useState(initialSheetName);
  const [sheetId, setSheetId] = useState(initialSheetId);

  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [site, setSite] = useState("");

  const { toast } = useToast();

  const buildQuery = () => {
    if (
      source === "google-maps" ||
      source === "serper places" ||
      source === "serper search"
    ) {
      return `${category} ${location}`;
    } else if (source === "google") {
      let queryStr = `"${category}" "${location}"`;
      queryStr += ` "@gmail.com" "contact number" OR "phone:" OR "+63"`;

      if (!site) {
        // DEFAULT: All 3 sites
        queryStr += ` site:linkedin.com OR site:facebook.com/company OR site:instagram.com`;
      } else {
        const sites = site.split(",").map((s) => s.trim().toLowerCase());
        const siteQueries = sites.map((s) => {
          if (s === "linkedin") return "site:linkedin.com";
          if (s === "facebook") return "site:facebook.com/company";
          if (s === "instagram") return "site:instagram.com";
        });
        queryStr += ` ${siteQueries.join(" OR ")}`;
      }

      return queryStr;
    }

    return query; // business-list uses raw query
  };

  // 🔥 RESTORE FORM
  useEffect(() => {
    if (initialQuery !== undefined) setQuery(initialQuery);
    if (initialSheetName !== undefined) setSheetName(initialSheetName);
    if (initialSheetId !== undefined) setSheetId(initialSheetId);
  }, [initialQuery, initialSheetName, initialSheetId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalQuery = buildQuery();

    if (!finalQuery.trim()) {
      toast({
        title: "Input required",
        description: "Please fill category and location",
        variant: "destructive",
      });
      return;
    }

    // if (!sheetName.trim() || !sheetId.trim()) {
    //   toast({
    //     title: "Google Sheets info required",
    //     description: "Please enter both Google Sheet name and ID",
    //     variant: "destructive",
    //   });
    //   return;
    // }
    onScrape(finalQuery, source, sheetName, sheetId);
  };

  const sourceIcons = {
    "google-maps": MapPin,
    google: Globe,
    "serper places": MapPin,
    "serper search": Globe,
  };

  const SourceIcon = sourceIcons[source];

  // 🔥 SHOW/HIDE INPUTS BASED ON SOURCE
  const showAdvancedInputs =
    source === "google-maps" ||
    source === "google" ||
    source === "serper places" ||
    source === "serper search";
  const showSiteInput = source === "google";

  return (
    <Card className="p-8 backdrop-blur-sm bg-card/80 border-border shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 🔥 SOURCE SELECTOR - NOW CLICKABLE */}
        <div className="space-y-2">
          <Label className="text-foreground font-medium">Scraping Source</Label>
          <Select
            value={source}
            disabled={false}
            onValueChange={(value) => setSource(value as ScraperSource)}
          >
            <SelectTrigger className="h-12 border-input">
              <div className="flex items-center gap-2">
                <SourceIcon className="h-5 w-5 text-primary" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="google-maps">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Google Maps (Local Businesses)
                </div>
              </SelectItem>
              <SelectItem value="google">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Google Search (Websites + Social)
                </div>
              </SelectItem>
              <SelectItem value="serper places">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Serper Places
                </div>
              </SelectItem>
              <SelectItem value="serper search">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Serper Search
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 🔥 ADVANCED INPUTS - CONDITIONAL */}
        {showAdvancedInputs && (
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
            <Label className="text-foreground font-semibold flex items-center gap-2">
              {source === "google-maps" ? (
                <MapPin className="h-4 w-4" />
              ) : (
                <Globe className="h-4 w-4" />
              )}
              Search Parameters
            </Label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CATEGORY */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  <Building2 className="inline h-4 w-4 mr-1" />
                  Category
                </Label>
                <Input
                  id="category"
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="law firms, dentists, restaurants"
                  className="h-10 pl-10"
                  disabled={isLoading}
                />
              </div>

              {/* LOCATION */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">
                  <Map className="inline h-4 w-4 mr-1" />
                  Location
                </Label>
                <Input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Manila, Cebu, Makati"
                  className="h-10 pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* SITE - ONLY FOR GOOGLE SEARCH */}
            {showSiteInput && (
              <div className="space-y-2">
                <Label htmlFor="site" className="text-sm font-medium">
                  <Link className="inline h-4 w-4 mr-1" />
                  Social Sites (comma separated)
                </Label>
                <Input
                  id="site"
                  type="text"
                  value={site}
                  onChange={(e) => setSite(e.target.value)}
                  placeholder="linkedin, facebook (or leave empty for all)"
                  className="h-10"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Examples: "linkedin", "facebook,instagram", "" (all 3)
                </p>
              </div>
            )}

            {/* 🔥 PREVIEW QUERY */}
            <div className="p-3 bg-background rounded border">
              <p className="text-xs font-mono text-muted-foreground mb-1">
                Preview Query:
              </p>
              <code className="text-xs bg-muted px-2 py-1 rounded block break-all">
                {buildQuery()}
              </code>
            </div>
          </div>
        )}

        {/* HIDE RAW QUERY FOR ADVANCED MODES */}
        {!showAdvancedInputs && (
          <div className="space-y-2">
            <Label htmlFor="query" className="text-foreground font-medium">
              Search Query or URL
            </Label>
            <Input
              id="query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., https://example.com"
              className="h-12"
              disabled={isLoading}
            />
          </div>
        )}

        {/* GOOGLE SHEETS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sheetName" className="text-foreground font-medium">
              <Sheet className="inline h-4 w-4 mr-1" />
              Google Sheet Name
            </Label>
            <Input
              id="sheetName"
              type="text"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              placeholder="My Leads Sheet"
              className="h-12 pl-10"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sheetId" className="text-foreground font-medium">
              Google Sheet ID
            </Label>
            <Input
              id="sheetId"
              type="text"
              value={sheetId}
              onChange={(e) => setSheetId(e.target.value)}
              placeholder="1abc...xyz"
              className="h-12 font-mono text-sm"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Tip:</strong> Sheet ID is in
            URL:
            <span className="font-mono text-xs">
              /spreadsheets/d/<span className="text-primary">YOUR_ID</span>/edit
            </span>
          </p>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-md hover:shadow-lg"
        >
          {isLoading ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
              Scraping {category} in {location}...
            </>
          ) : (
            <>
              <Search className="mr-2 h-5 w-5" />
              Start Scraping ({category || "Query"})
            </>
          )}
        </Button>
      </form>
    </Card>
  );
};

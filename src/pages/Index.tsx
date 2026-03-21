import { useEffect, useState } from "react";
import { ScraperForm } from "@/components/ScraperForm";
import { ResultsSection } from "@/components/ResultsSection";
import { Lead } from "@/components/LeadCard";
import { useToast } from "@/hooks/use-toast";
import { Database, X, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { skip } from "node:test";

type ScraperSource =
  | "google-maps"
  | "google"
  | "business-list"
  | "serper search"
  | "serper places";
const baseURL = "https://slimline-gil-messiest.ngrok-free.dev";
//const baseURL="http://192.168.10.8:5000"

const Index = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [status, setStatus] = useState<string>("Ready to scrape");
  const [crawlUrl, setCrawlUrl] = useState<string>("");
  const [jsonData, setJsonData] = useState<any>(null);
  const [jsonArray, setJsonArray] = useState<any[]>([]);
  const [results, setResults] = useState<any>(null);
  const [submittedURL, setSubmittedURL] = useState<string>("");
  const [sheetId, setSheetId] = useState<string>("");
  const [sheetName, setSheetName] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentURL, setCurrentURL] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [sourceURL, setSourceURL] = useState<string>("");
  const [baseUrl, setBaseUrl] = useState<string>("");
  const [isProcessingURL, setIsProcessingURL] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string>("");
  const { toast } = useToast();

  const STORAGE_KEY = "leadScraperState";

  const saveStateToStorage = () => {
    const state = {
      leads,
      isLoading,
      isPaused,
      status,
      crawlUrl,
      jsonArray,
      currentIndex,
      sheetId,
      sheetName,
      submittedURL,
      sourceURL,
      baseUrl,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  };

  // ✅ LOAD STATE FROM LOCALSTORAGE
  const loadStateFromStorage = () => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return;

    const state = JSON.parse(saved);

    setLeads(state.leads || []);
    setIsLoading(state.isLoading || false);
    setIsPaused(state.isPaused || false);
    setStatus(state.status || "Ready to scrape");
    setCrawlUrl(state.crawlUrl || "");
    setJsonArray(state.jsonArray || []);
    setCurrentIndex(state.currentIndex || 0);
    setSheetId(state.sheetId || "");
    setSheetName(state.sheetName || "");
    setSubmittedURL(state.submittedURL || "");
    setSourceURL(state.sourceURL || "");
    setBaseUrl(state.baseUrl || "");

    if (state.leads?.length > 0) {
      toast({
        title: "Session Restored",
        description: `${state.leads.length} leads | URL ${state.currentIndex + 1}/${state.jsonArray?.length}`,
      });
    }
  };

  const skipToNext = () => {
    setCurrentIndex((prev) => {
      if (prev + 1 >= jsonArray.length) {
        setStatus("complete");
        setIsLoading(false);
        toast({
          title: "✅ Completed",
          description: `Reached end of list (${jsonArray.length} URLs)`,
        });
        return prev;
      }
      setJsonData(null);
      setStatus("specificScraping");
      toast({
        title: "Skipped URL",
        description: `Moved to URL ${prev + 2}/${jsonArray.length}`,
      });
      return prev + 1;
    });
  };

  // ✅ LOAD ON BROWSER OPEN
  useEffect(() => {
    loadStateFromStorage();
  }, []);

  // ✅ SAVE ON PAUSE ONLY
  useEffect(() => {
    if (isPaused) saveStateToStorage();
  }, [isPaused]);

  // ✅ PAUSE/RESUME FUNCTION
  const handlePauseResume = () => {
    if (isPaused) {
      setIsPaused(false);
      if (jsonArray.length > 0 && currentIndex < jsonArray.length) {
        setStatus("specificScraping");
      }
      toast({
        title: "Scraping resumed",
        description: `Continuing from URL ${currentIndex + 1}/${jsonArray.length}`,
      });
    } else {
      setIsPaused(true);
      setStatus(`Paused at URL ${currentIndex + 1}/${jsonArray.length}`);
      saveStateToStorage();
      toast({
        title: "Scraping paused",
        description: `Saved at URL ${currentIndex + 1}/${jsonArray.length}`,
      });
    }
  };

  const handleStop = () => {
    setIsStopped(true);
    setIsLoading(false);
    setIsPaused(false);
    setStatus("Stopped by user");
    setJsonData(null);
    setCrawlUrl("");
    setCurrentURL("");
    setType("");
    setCurrentIndex(0);
    localStorage.removeItem(STORAGE_KEY);

    toast({
      title: "Scraping stopped",
      description: "All data cleared",
    });
  };

  function rowHasDate2020OrAbove(row: any[]) {
    return row.some((cell) => {
      if (typeof cell !== "string") return false;
      const yearMatch = cell.match(/\b(19|20)\d{2}\b/);
      if (yearMatch) {
        const year = parseInt(yearMatch[0]);
        return year >= 2020;
      }
      return false;
    });
  }

  // ✅ FIXED: Error-safe submitCrawl
  const submitCrawl = async (url: string, type: string) => {
    if (type === "base") setBaseUrl(url);
    try {
      setStatus("crawling");
      setSubmittedURL(url);
      const response = await fetch(`${baseURL}/crawl/crawl`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, type }),
      });
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      setCrawlUrl(data);
      if (type === "specific") {
        setStatus("scrapeSpecific");
        setCurrentURL(data);
        setType("scrapeSpecific");
      } else {
        setStatus("scraping");
        setType("");
      }
    } catch (error: any) {
      if (type === "specific") {
        skipToNext();
      } else {
        setStatus("error");
        setIsLoading(false);
        toast({
          title: "Crawl failed",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const callScraper = async (
    endpoint: string,
    label: string,
    query: string,
  ) => {
    let maxPages = 5; // 👈 how many pages to loop through
    if (endpoint.includes("googlemaps")) {
      maxPages = 1;
    }
    const allResults: any[] = [];

    for (let page = 0; page < maxPages; page++) {
      const res = await fetch(`${baseURL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, page }), // 👈 pass page to backend
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Unknown error");

      let rawResults: any[] = [];

      // 🧭 handle endpoint type
      if (endpoint === "/serpapi/googlemaps") {
        rawResults = Array.isArray(data.businesses) ? data.businesses : [];
      } else if (endpoint === "/serpapi/googlesearch") {
        const websites = Array.isArray(data.websites) ? data.websites : [];
        const localBusinesses = Array.isArray(data.localBusinesses)
          ? data.localBusinesses
          : [];
        rawResults = [...websites, ...localBusinesses];
      }
      // ❌ Stop scraping if no results
      if (rawResults.length === 0) {
        break;
      }
      allResults.push(...rawResults);

      // 💤 small delay (optional)
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const formattedLeads = allResults.map((r: any, i: number) => ({
      id: `lead-${i}-${Date.now()}`,
      companyName: r.name || r.title || "N/A",
      location:
        r.address || extractPhoneNumbers(r.snippet)?.join(" / ") || "N/A",
      email: r.email || "",
      phoneNumber: r.phone || "N/A",
      businessType: r.category || r.type || label,
      websiteUrl: r.website || r.url || "",
      mapUrl: r.google_maps_link || r.link || "",
      lastUpdate: new Date().toISOString(),
      registeredDate: "",
      employeeCount: "",
    }));

    setLeads(formattedLeads);
    setJsonArray(formattedLeads);
    setResults(allResults);
    setStatus(
      `✅ ${label} scraping complete (${formattedLeads.length} results across ${maxPages} pages)`,
    );
    setIsLoading(false);
  };

  const callSerperScraper = async (
    endpoint: string,
    label: string,
    query: string,
  ) => {
    let maxPages = 5;

    const allResults: any[] = [];

    for (let page = 0; page < maxPages; page++) {
      const res = await fetch(`${baseURL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, page }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Unknown error");

      let rawResults: any[] = [];

      // 🧭 Handle endpoint type
      if (endpoint === "/serper/places") {
        rawResults = Array.isArray(data.businesses) ? data.businesses : [];
      } else if (endpoint === "/serper/search") {
        rawResults = Array.isArray(data.websites) ? data.websites : [];
      }

      // ❌ Stop scraping if no results
      if (rawResults.length === 0) {
        break;
      }

      allResults.push(...rawResults);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // 🧱 Format into leads
    const formattedLeads = allResults.map((r: any, i: number) => {
      if (endpoint === "/serper/places") {
        return {
          id: `lead-${i}-${Date.now()}`,
          companyName: r.name || "N/A",
          location: r.address || "N/A",
          email: "",
          phoneNumber: r.phone || "N/A",
          businessType: r.category || label,
          websiteUrl: r.website || "",
          mapUrl: r.cid ? `https://www.google.com/maps?cid=${r.cid}` : "",
          lastUpdate: new Date().toISOString(),
          registeredDate: "",
          employeeCount: "",
        };
      }

      if (endpoint === "/serper/search") {
        return {
          id: `lead-${i}-${Date.now()}`,
          companyName: r.title || "N/A",
          location: r.snippet || "N/A",
          email: "",
          phoneNumber: (extractPhoneNumbers(r.snippet)?.[0] as string) || "N/A",
          businessType: label,
          websiteUrl: r.url || "",
          mapUrl: r.link || "",
          lastUpdate: new Date().toISOString(),
          registeredDate: "",
          employeeCount: "",
        };
      }

      return {
        id: `lead-${i}-${Date.now()}`,
        companyName: r.title || "N/A",
        location: "N/A",
        email: "",
        phoneNumber: "N/A",
        businessType: label,
        websiteUrl: r.link || "",
        mapUrl: r.link || "",
        lastUpdate: new Date().toISOString(),
        registeredDate: "",
        employeeCount: "",
      };
    });

    setLeads(formattedLeads);
    setJsonArray(formattedLeads);
    setResults(allResults);
    setStatus(
      `✅ ${label} scraping complete (${formattedLeads.length} results across ${maxPages} pages)`,
    );
    setIsLoading(false);
  };

  function extractPhoneNumbers(snippet) {
    if (!snippet) return [];
    const matches = snippet.match(
      /(\+?\d{1,3})?[\s\-()]*(\d{2,4})[\s\-()]*(\d{3})[\s\-()]*(\d{3,4})/g,
    );
    return matches ? [...new Set(matches.map((num) => num.trim()))] : [];
  }
  // ✅ FIXED: Error-safe handleScrape
  const handleScrape = async (
    query: string,
    source: ScraperSource,
    sheetName: string,
    sheetId: string,
  ) => {
    try {
      setIsLoading(true);
      setIsPaused(false);
      setStatus(`Scraping from ${source.replace("-", " ")}...`);
      setLeads([]);
      setJsonArray([]);
      setCurrentIndex(0);
      setResults(null);
      setSheetId(sheetId);
      setSheetName(sheetName);
      setIsStopped(false);
      setSelectedSource(source);
      if (source === "google-maps") {
        await callScraper("/serpapi/googlemaps", "Google Maps", query);
      } else if (source === "google") {
        await callScraper("/serpapi/googlesearch", "Google Search", query);
      } else if (source === "serper places") {
        await callSerperScraper("/serper/places", "Serper Places", query);
      } else if (source === "serper search") {
        await callSerperScraper("/serper/search", "Serper Search", query);
      } else await submitCrawl(query, "base");
    } catch (error: any) {
      setStatus("error");
      toast({
        title: "Scraping failed",
        description: error.message || "Failed to start scraping",
        variant: "destructive",
      });
    }
  };

  // ✅ Manually append leads from Google Search / Maps to Sheets
  const handleAppendToSheets = async () => {
    if (leads.length === 0) {
      toast({ title: "No leads", description: "No leads to append yet." });
      return;
    }
    if (!sheetId || !sheetName) {
      toast({
        title: "Missing sheet info",
        description: "Please enter Sheet ID and Sheet Name first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setStatus("appending to sheets...");
      const filteredLeads = leads.map((l) => [
        l.companyName,
        l.location,
        l.email,
        l.phoneNumber,
        l.businessType,
        l.websiteUrl,
        l.lastUpdate,
        l.registeredDate,
        l.employeeCount,
      ]);

      await fetch(`${baseURL}/sheets/populate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonData: filteredLeads,
          ID: sheetId,
          sheetName: sheetName,
        }),
      });

      toast({
        title: "✅ Sheets Updated",
        description: `${filteredLeads.length} leads appended successfully.`,
      });
      setStatus("✅ Leads appended to Sheets");
    } catch (error: any) {
      toast({
        title: "Failed to append",
        description: error.message,
        variant: "destructive",
      });
      setStatus("error appending");
    }
  };
  //#region USEEFFECTS
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isLoading) {
        setStatus(`Paused at URL ${currentIndex + 1}/${jsonArray.length}`);
        setIsPaused(true);
        saveStateToStorage(); // 🧠 your existing save function
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [
    leads,
    isLoading,
    isPaused,
    status,
    crawlUrl,
    jsonArray,
    currentIndex,
    sheetId,
    sheetName,
    submittedURL,
    sourceURL,
    baseUrl,
  ]);

  useEffect(() => {
    if (currentIndex >= jsonArray.length && jsonArray.length > 0) {
      setStatus("complete");
      setIsLoading(false);
    }
  }, [currentIndex, jsonArray.length]);

  // ✅ Scraping status checker - PAUSE CHECK
  useEffect(() => {
    if (isStopped) return;
    if (!crawlUrl && !currentURL) return;
    if (status !== "scraping" && status !== "scrapeSpecific") return;
    if (isPaused) return;

    let interval: NodeJS.Timeout;
    const checkScrapeStatus = async () => {
      try {
        const response = await fetch(`${baseURL}/crawl/checkscrapingstatus`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ crawlurl: crawlUrl }),
        });
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        const statusStr = data.status || data;
        setStatus(statusStr);

        const isCompleted = [
          "done",
          "completed",
          "complete",
          "finished",
        ].includes(statusStr);

        if (isCompleted) {
          clearInterval(interval);
          if (type === "scrapeSpecific") {
            setStatus("processing");
          } else {
            setStatus("fetching");
          }
        } else if (statusStr === "error") {
          clearInterval(interval);
          setStatus("error");
        }
      } catch (error: any) {
        clearInterval(interval);
        skipToNext();
        // setStatus("error");
      }
    };

    interval = setInterval(checkScrapeStatus, 3000);
    checkScrapeStatus();
    return () => clearInterval(interval);
  }, [crawlUrl, status, type, isPaused, isStopped]);

  // Get URLs from base - PAUSE CHECK
  useEffect(() => {
    if (isStopped) return;
    if (
      status !== "fetching" ||
      type === "scrapeSpecific" ||
      !crawlUrl ||
      isPaused
    )
      return;
    const processScrape = async () => {
      try {
        const response = await fetch(`${baseURL}/crawl/getUrl`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: crawlUrl }),
        });
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        setJsonArray(data);
        setCurrentIndex(0);
        setStatus("specificScraping");
      } catch (error: any) {
        setStatus("error");
        toast({
          title: "fetchng URL failed",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    processScrape();
  }, [status, crawlUrl, isPaused, isStopped]);

  // Process single URL - PAUSE CHECK
  useEffect(() => {
    if (isStopped) return;
    if (status !== "specificScraping" || isPaused || isProcessingURL) return;
    if (jsonArray.length === 0 || currentIndex >= jsonArray.length) return;

    const scrapingSpecific = async () => {
      setIsProcessingURL(true);
      try {
        const currentUrl = jsonArray[currentIndex];
        const urlString =
          typeof currentUrl === "string"
            ? currentUrl
            : currentUrl.url || currentUrl.href || currentUrl;
        setSourceURL(urlString);
        await submitCrawl(urlString, "specific");
      } finally {
        setIsProcessingURL(false);
      }
    };

    scrapingSpecific();
  }, [status, currentIndex, jsonArray, isPaused, isStopped]);

  // Process single URL data - PAUSE CHECK
  useEffect(() => {
    if (isStopped) return;
    if (
      status !== "processing" ||
      jsonArray.length === 0 ||
      currentIndex >= jsonArray.length ||
      isPaused
    )
      return;
    const processUrl = async () => {
      try {
        const response = await fetch(`${baseURL}/crawl/process`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: currentURL, sourceURL: sourceURL }),
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const rawData = await response.json();
        let data = rawData;
        if (typeof rawData === "string") data = JSON.parse(rawData);
        while (
          Array.isArray(data) &&
          data.length === 1 &&
          Array.isArray(data[0])
        ) {
          data = data[0];
        }

        setJsonData(data);
        setStatus("appending");
      } catch (error: any) {
        skipToNext();
      }
    };

    processUrl();
  }, [
    status,
    currentIndex,
    jsonArray,
    currentURL,
    sourceURL,
    isPaused,
    isStopped,
  ]);

  // Append to sheets & create leads - PAUSE CHECK
  useEffect(() => {
    if (isStopped) return;
    if (status !== "appending" || !jsonData || isPaused) return;

    const appendToSheets = async () => {
      try {
        let cleanJsonArray = jsonData;
        if (!Array.isArray(cleanJsonArray)) cleanJsonArray = [cleanJsonArray];
        if (!cleanJsonArray.every((row) => Array.isArray(row)))
          cleanJsonArray = [cleanJsonArray];

        const filteredArray = cleanJsonArray.filter(rowHasDate2020OrAbove);

        if (filteredArray.length > 0) {
          await fetch(`${baseURL}/sheets/populate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonData: filteredArray,
              ID: sheetId,
              sheetName: sheetName,
            }),
          });

          const leadObject = {
            id: `lead-${currentIndex}-${Date.now()}`,
            companyName: filteredArray[0]?.[0] || "",
            location: filteredArray[0]?.[1] || "",
            email: filteredArray[0]?.[2] || "",
            phoneNumber: filteredArray[0]?.[3] || "",
            businessType: filteredArray[0]?.[5] || "",
            websiteUrl: filteredArray[0]?.[6] || "",
            lastUpdate: filteredArray[0]?.[7] || "",
            registeredDate: filteredArray[0]?.[8] || "",
            employeeCount: filteredArray[0]?.[9] || "",
          };

          setLeads((prev) => [...prev, leadObject]);
        }
        if (currentIndex + 1 < jsonArray.length) {
          setCurrentIndex((prev) => Math.min(prev + 1, jsonArray.length - 1));
          setJsonData(null);
          setStatus("specificScraping");
        } else {
          setStatus("complete");
          setIsLoading(false);
        }
      } catch (error: any) {}
    };

    appendToSheets();
  }, [
    status,
    jsonData,
    currentIndex,
    jsonArray,
    sheetId,
    sheetName,
    isPaused,
    isStopped,
  ]);
  //#endregion
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12 space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Lead Generation Tool
          </h1>
        </header>

        <div className="max-w-4xl mx-auto space-y-8">
          <ScraperForm
            onScrape={handleScrape}
            isLoading={isLoading}
            initialQuery={baseUrl}
            initialSheetId={sheetId}
            initialSheetName={sheetName}
          />

          {/* ✅ STATUS + PAUSE/RESUME + STOP */}
          <div className="bg-card border border-border rounded-lg p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`h-3 w-3 rounded-full ${
                  isLoading && !isPaused
                    ? "bg-primary animate-pulse"
                    : isPaused
                      ? "bg-yellow-500"
                      : "bg-green-500"
                }`}
              />
              <p className="text-sm font-medium text-foreground">
                Status: <span className="text-muted-foreground">{status}</span>
                {leads.length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                    {leads.length} leads
                  </span>
                )}
                {jsonArray.length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs">
                    {currentIndex + 1}/{jsonArray.length}
                  </span>
                )}
              </p>
            </div>

            {isLoading && (
              <div className="flex gap-2">
                {jsonArray.length > 0 && (
                  <Button
                    onClick={handlePauseResume}
                    variant={isPaused ? "default" : "outline"}
                    size="sm"
                    className="gap-2"
                  >
                    {isPaused ? (
                      <Play className="h-4 w-4" />
                    ) : (
                      <Pause className="h-4 w-4" />
                    )}
                    {isPaused ? "Resume" : "Pause"}
                  </Button>
                )}
                <Button
                  onClick={handleStop}
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Stop
                </Button>
              </div>
            )}
            {/* ✅ Append to Sheets button for Google Maps / Google Search */}
            {(selectedSource === "google-maps" ||
              selectedSource === "google" ||
              selectedSource === "serper search" ||
              selectedSource === "serper places") &&
              leads.length > 0 && (
                <Button
                  onClick={handleAppendToSheets}
                  variant="default"
                  size="sm"
                  className="gap-2"
                >
                  📤 Append to Sheets
                </Button>
              )}
          </div>

          <ResultsSection leads={leads} />
        </div>
      </div>
    </div>
  );
};

export default Index;

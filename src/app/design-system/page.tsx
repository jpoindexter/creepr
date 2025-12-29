"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Badge,
  MetricCard,
  Stat,
  StatGroup,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertCircle,
  Check,
  Info,
  Loader2,
  Search,
  Settings,
  Zap,
  Globe,
  Code,
  FileText,
} from "lucide-react";
import Link from "next/link";

export default function DesignSystemPage() {
  return (
    <TooltipProvider>
      <div className="bg-background text-foreground min-h-screen">
        {/* Header */}
        <header className="border-border bg-card border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-mono text-2xl font-bold">Design System</h1>
              <p className="text-muted-foreground mt-1 font-mono text-sm">
                Black & White Terminal Theme - Component Showcase
              </p>
            </div>
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground font-mono text-sm"
            >
              &larr; Back to App
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="mx-auto max-w-6xl p-8">
          <div className="space-y-12">
            {/* Typography */}
            <section>
              <h2 className="border-border mb-6 border-b pb-2 font-mono text-xl font-bold">
                [0x01] TYPOGRAPHY
              </h2>
              <div className="space-y-4 font-mono">
                <div>
                  <h1 className="text-4xl font-bold">Heading 1 - 4xl Bold</h1>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Heading 2 - 2xl Bold</h2>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Heading 3 - xl Semibold</h3>
                </div>
                <div>
                  <h4 className="text-lg font-medium">Heading 4 - lg Medium</h4>
                </div>
                <div>
                  <p className="text-base">Body Text - base</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Muted Text - sm muted</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Caption - xs muted</p>
                </div>
              </div>
            </section>

            {/* Colors */}
            <section>
              <h2 className="border-border mb-6 border-b pb-2 font-mono text-xl font-bold">
                [0x02] COLORS
              </h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <div className="bg-background border-border h-20 border" />
                  <p className="font-mono text-xs">background</p>
                </div>
                <div className="space-y-2">
                  <div className="bg-foreground h-20" />
                  <p className="font-mono text-xs">foreground</p>
                </div>
                <div className="space-y-2">
                  <div className="bg-card border-border h-20 border" />
                  <p className="font-mono text-xs">card</p>
                </div>
                <div className="space-y-2">
                  <div className="bg-muted h-20" />
                  <p className="font-mono text-xs">muted</p>
                </div>
                <div className="space-y-2">
                  <div className="bg-primary h-20" />
                  <p className="font-mono text-xs">primary</p>
                </div>
                <div className="space-y-2">
                  <div className="bg-secondary h-20" />
                  <p className="font-mono text-xs">secondary</p>
                </div>
                <div className="space-y-2">
                  <div className="bg-accent h-20" />
                  <p className="font-mono text-xs">accent</p>
                </div>
                <div className="space-y-2">
                  <div className="bg-destructive h-20" />
                  <p className="font-mono text-xs">destructive</p>
                </div>
              </div>
            </section>

            {/* Buttons */}
            <section>
              <h2 className="border-border mb-6 border-b pb-2 font-mono text-xl font-bold">
                [0x03] BUTTONS
              </h2>
              <div className="space-y-6">
                <div className="flex flex-wrap gap-4">
                  <Button variant="default">Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Button disabled>Disabled</Button>
                  <Button>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading
                  </Button>
                  <Button>
                    <Search className="mr-2 h-4 w-4" />
                    With Icon
                  </Button>
                </div>
              </div>
            </section>

            {/* Forms */}
            <section>
              <h2 className="border-border mb-6 border-b pb-2 font-mono text-xl font-bold">
                [0x04] FORM INPUTS
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="text">Text Input</Label>
                    <Input id="text" placeholder="Enter text..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="disabled">Disabled Input</Label>
                    <Input id="disabled" placeholder="Disabled..." disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="select">Select</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Option 1</SelectItem>
                        <SelectItem value="2">Option 2</SelectItem>
                        <SelectItem value="3">Option 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Slider</Label>
                    <Slider defaultValue={[50]} max={100} step={1} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" />
                    <Label htmlFor="terms">Accept terms and conditions</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="airplane" />
                    <Label htmlFor="airplane">Airplane Mode</Label>
                  </div>
                </div>
              </div>
            </section>

            {/* Cards */}
            <section>
              <h2 className="border-border mb-6 border-b pb-2 font-mono text-xl font-bold">
                [0x05] CARDS
              </h2>
              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardHeader title="BASIC_CARD" />
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      A simple card with header and content. Uses the terminal header pattern.
                    </p>
                  </CardContent>
                </Card>

                <Card tone="primary">
                  <CardHeader title="PRIMARY_TONE" icon={<Zap className="h-4 w-4" />} />
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Card with primary tone border and icon in header.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button size="sm">Action</Button>
                  </CardFooter>
                </Card>

                <Card interactive>
                  <CardHeader title="INTERACTIVE" meta="hover me" />
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      Interactive card with hover states enabled.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Metric Cards */}
            <section>
              <h2 className="border-border mb-6 border-b pb-2 font-mono text-xl font-bold">
                [0x06] METRIC CARDS
              </h2>
              <div className="grid gap-6 md:grid-cols-3">
                <MetricCard
                  title="TOTAL_PAGES"
                  value="156"
                  label="Pages Crawled"
                  icon={<FileText className="h-5 w-5" />}
                />
                <MetricCard
                  title="BROKEN_LINKS"
                  value="3"
                  label="Errors Found"
                  icon={<AlertCircle className="h-5 w-5" />}
                />
                <MetricCard
                  title="CRAWL_TIME"
                  value="2.4s"
                  label="Duration"
                  icon={<Zap className="h-5 w-5" />}
                />
              </div>
            </section>

            {/* Badges */}
            <section>
              <h2 className="border-border mb-6 border-b pb-2 font-mono text-xl font-bold">
                [0x07] BADGES
              </h2>
              <div className="flex flex-wrap gap-4">
                <Badge code="0x00" label="DEFAULT" />
                <Badge code="0x01" label="WITH_META" meta="v2.0" />
                <Badge code="0xAA" label="STATUS" meta="ACTIVE" />
              </div>
            </section>

            {/* Stats */}
            <section>
              <h2 className="border-border mb-6 border-b pb-2 font-mono text-xl font-bold">
                [0x08] STATS
              </h2>
              <Card>
                <CardHeader title="STAT_GROUP" />
                <CardContent>
                  <StatGroup>
                    <Stat label="Pages" value="156" />
                    <Stat label="Broken" value="3" />
                    <Stat label="Time" value="2.4s" />
                    <Stat label="Depth" value="5" />
                  </StatGroup>
                </CardContent>
              </Card>
            </section>

            {/* Progress */}
            <section>
              <h2 className="border-border mb-6 border-b pb-2 font-mono text-xl font-bold">
                [0x09] PROGRESS
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress 25%</span>
                    <span className="text-muted-foreground">25%</span>
                  </div>
                  <Progress value={25} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress 50%</span>
                    <span className="text-muted-foreground">50%</span>
                  </div>
                  <Progress value={50} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress 75%</span>
                    <span className="text-muted-foreground">75%</span>
                  </div>
                  <Progress value={75} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Complete</span>
                    <span className="text-muted-foreground">100%</span>
                  </div>
                  <Progress value={100} />
                </div>
              </div>
            </section>

            {/* Tabs */}
            <section>
              <h2 className="border-border mb-6 border-b pb-2 font-mono text-xl font-bold">
                [0x0A] TABS
              </h2>
              <Tabs defaultValue="tab1" className="w-full">
                <TabsList>
                  <TabsTrigger value="tab1">Overview</TabsTrigger>
                  <TabsTrigger value="tab2">Details</TabsTrigger>
                  <TabsTrigger value="tab3">Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="tab1">
                  <Card>
                    <CardHeader title="OVERVIEW" />
                    <CardContent>
                      <p className="text-muted-foreground text-sm">
                        Overview tab content goes here.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="tab2">
                  <Card>
                    <CardHeader title="DETAILS" />
                    <CardContent>
                      <p className="text-muted-foreground text-sm">
                        Details tab content goes here.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="tab3">
                  <Card>
                    <CardHeader title="SETTINGS" />
                    <CardContent>
                      <p className="text-muted-foreground text-sm">
                        Settings tab content goes here.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </section>

            {/* Tooltips */}
            <section>
              <h2 className="border-border mb-6 border-b pb-2 font-mono text-xl font-bold">
                [0x0B] TOOLTIPS
              </h2>
              <div className="flex flex-wrap gap-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline">Hover me</Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This is a tooltip</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>More information</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </section>

            {/* Status Indicators */}
            <section>
              <h2 className="border-border mb-6 border-b pb-2 font-mono text-xl font-bold">
                [0x0C] STATUS INDICATORS
              </h2>
              <div className="space-y-4">
                <div className="bg-card border-border flex items-center gap-2 border p-4">
                  <Check className="text-success h-5 w-5" />
                  <span className="font-mono text-sm">Success state</span>
                </div>
                <div className="bg-card border-border flex items-center gap-2 border p-4">
                  <AlertCircle className="text-warning h-5 w-5" />
                  <span className="font-mono text-sm">Warning state</span>
                </div>
                <div className="bg-card border-border flex items-center gap-2 border p-4">
                  <AlertCircle className="text-destructive h-5 w-5" />
                  <span className="font-mono text-sm">Error state</span>
                </div>
                <div className="bg-card border-border flex items-center gap-2 border p-4">
                  <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
                  <span className="font-mono text-sm">Loading state</span>
                </div>
              </div>
            </section>

            {/* Icons */}
            <section>
              <h2 className="border-border mb-6 border-b pb-2 font-mono text-xl font-bold">
                [0x0D] ICONS (LUCIDE)
              </h2>
              <div className="flex flex-wrap gap-6">
                <div className="flex flex-col items-center gap-2">
                  <Globe className="h-6 w-6" />
                  <span className="font-mono text-xs">Globe</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Code className="h-6 w-6" />
                  <span className="font-mono text-xs">Code</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <FileText className="h-6 w-6" />
                  <span className="font-mono text-xs">FileText</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Search className="h-6 w-6" />
                  <span className="font-mono text-xs">Search</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Settings className="h-6 w-6" />
                  <span className="font-mono text-xs">Settings</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Zap className="h-6 w-6" />
                  <span className="font-mono text-xs">Zap</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <AlertCircle className="h-6 w-6" />
                  <span className="font-mono text-xs">Alert</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Check className="h-6 w-6" />
                  <span className="font-mono text-xs">Check</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Info className="h-6 w-6" />
                  <span className="font-mono text-xs">Info</span>
                </div>
              </div>
            </section>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-border bg-card mt-12 border-t px-6 py-4">
          <p className="text-muted-foreground text-center font-mono text-sm">
            creepr Design System - Black & White Terminal Theme
          </p>
        </footer>
      </div>
    </TooltipProvider>
  );
}

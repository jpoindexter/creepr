"use client";

/**
 * ✅ FABRK COMPONENT - PRO PACK
 * API Key Manager - Generate, view, and revoke API keys
 *
 * Features:
 * - Generate new API keys with custom names
 * - Copy to clipboard with visual feedback
 * - Revoke keys with confirmation dialog
 * - Show last used timestamp
 * - Mask key values (first/last 4 chars)
 * - Search/filter functionality
 *
 * Design System Integration:
 * - Terminal aesthetic with mode.radius, mode.font
 * - Design tokens only (no hardcoded colors)
 * - 8-point grid spacing
 * - WCAG 2.1 AA compliant
 *
 * @example
 * ```tsx
 * <ApiKeyManager userId="user_123" />
 * ```
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { mode } from "@/design-system";
import { Button } from "./button";
import { Input } from "./input";
import { Card } from "./card";
import { Badge } from "./badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Copy, Check, MoreVertical, Plus, Trash2, Search } from "lucide-react";

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  lastUsed: Date | null;
  createdAt: Date;
}

export interface ApiKeyManagerProps {
  className?: string;
  userId: string;
  onGenerate?: (name: string) => Promise<ApiKey>;
  onRevoke?: (id: string) => Promise<void>;
  initialKeys?: ApiKey[];
}

export function ApiKeyManager({
  className,
  userId: _userId,
  onGenerate,
  onRevoke,
  initialKeys = [],
}: ApiKeyManagerProps) {
  const [keys, setKeys] = React.useState<ApiKey[]>(initialKeys);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [newKeyName, setNewKeyName] = React.useState("");
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [revokeId, setRevokeId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [generatedKey, setGeneratedKey] = React.useState<ApiKey | null>(null);

  const handleGenerate = async () => {
    if (!newKeyName.trim()) return;

    setIsGenerating(true);
    try {
      const newKey = onGenerate
        ? await onGenerate(newKeyName.trim())
        : {
            id: `key_${Date.now()}`,
            name: newKeyName.trim(),
            key: `sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
            lastUsed: null,
            createdAt: new Date(),
          };

      setKeys([newKey, ...keys]);
      setGeneratedKey(newKey);
      setNewKeyName("");
    } catch (error) {
      console.error("Failed to generate API key:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      if (onRevoke) {
        await onRevoke(id);
      }
      setKeys(keys.filter((k) => k.id !== id));
      setRevokeId(null);
    } catch (error) {
      console.error("Failed to revoke API key:", error);
    }
  };

  const handleCopy = async (key: string, id: string) => {
    await navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return key;
    return `${key.slice(0, 4)}${"•".repeat(20)}${key.slice(-4)}`;
  };

  const filteredKeys = keys.filter((key) =>
    key.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with Generate Button */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className={cn("text-sm font-semibold tracking-tight", mode.font)}>[ API KEYS ]</h3>
          <p className="text-muted-foreground mt-1 text-xs">
            Manage API keys for programmatic access
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className={cn(mode.radius, mode.font)}>
              <Plus className="h-4 w-4" />
              {"> "}GENERATE KEY
            </Button>
          </DialogTrigger>
          <DialogContent className={cn(mode.radius)}>
            <DialogHeader>
              <DialogTitle className={cn(mode.font)}>[ GENERATE API KEY ]</DialogTitle>
              <DialogDescription>
                Create a new API key for programmatic access. Give it a descriptive name.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="new-key-name" className={cn("text-xs", mode.font)}>
                  [KEY NAME]:
                </label>
                <Input
                  id="new-key-name"
                  placeholder="Production API Key"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className={cn(mode.radius, mode.font)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isGenerating) {
                      handleGenerate();
                    }
                  }}
                />
              </div>

              {generatedKey && (
                <div
                  className={cn(
                    mode.color.bg.muted,
                    mode.color.border.default,
                    "space-y-2 border p-4",
                    mode.radius
                  )}
                >
                  <p className={cn(mode.color.text.muted, "text-xs", mode.font)}>
                    [KEY GENERATED]:
                  </p>
                  <div
                    className={cn(
                      mode.color.bg.base,
                      mode.color.border.default,
                      "flex items-center gap-2 border p-2",
                      mode.radius
                    )}
                  >
                    <code className={cn("flex-1 text-xs", mode.font)}>{generatedKey.key}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy(generatedKey.key, generatedKey.id)}
                    >
                      {copiedId === generatedKey.id ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className={cn(mode.color.text.danger, "text-xs")}>
                    [WARNING] Copy this key now. You won't be able to see it again.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                onClick={handleGenerate}
                disabled={!newKeyName.trim() || isGenerating}
                className={cn(mode.radius, mode.font)}
              >
                {isGenerating ? "> GENERATING..." : "> GENERATE"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      {keys.length > 0 && (
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search keys..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn("pl-10", mode.radius, mode.font)}
          />
        </div>
      )}

      {/* Keys List */}
      <div className="space-y-2">
        {filteredKeys.length === 0 ? (
          <Card className={cn("border-dashed p-8 text-center", mode.radius)}>
            <p className={cn("text-muted-foreground text-sm", mode.font)}>
              {searchQuery
                ? `[NO_KEYS_FOUND]: "${searchQuery}"`
                : "[NO_API KEYS]: Generate your first key to get started."}
            </p>
          </Card>
        ) : (
          filteredKeys.map((key) => (
            <Card
              key={key.id}
              className={cn("flex items-center justify-between gap-4 p-4", mode.radius)}
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className={cn("text-sm font-medium", mode.font)}>{key.name}</p>
                  <Badge variant="outline" className={cn("text-xs", mode.font)}>
                    {key.id}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <code className={cn("text-muted-foreground flex-1 truncate text-xs", mode.font)}>
                    {maskKey(key.key)}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(key.key, key.id)}
                    aria-label="Copy API key"
                  >
                    {copiedId === key.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <p className={cn("text-muted-foreground text-xs", mode.font)}>
                  [CREATED]: {new Date(key.createdAt).toLocaleDateString()}
                  {key.lastUsed && (
                    <>
                      {" • "}
                      [LAST_USED]: {new Date(key.lastUsed).toLocaleDateString()}
                    </>
                  )}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" aria-label="Actions">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className={cn(mode.radius, mode.font)}>
                  <DropdownMenuItem
                    onClick={() => setRevokeId(key.id)}
                    className={cn(mode.color.text.danger, "focus:text-destructive")}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {"> "}REVOKE
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Card>
          ))
        )}
      </div>

      {/* Revoke Confirmation Dialog */}
      <AlertDialog open={!!revokeId} onOpenChange={(open) => !open && setRevokeId(null)}>
        <AlertDialogContent className={cn(mode.radius)}>
          <AlertDialogHeader>
            <AlertDialogTitle className={cn(mode.font)}>[ CONFIRM REVOCATION ]</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently revoke the API key and any
              applications using it will lose access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={cn(mode.radius, mode.font)}>
              {"> "}CANCEL
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => revokeId && handleRevoke(revokeId)}
              className={cn(
                mode.color.bg.danger,
                "hover:bg-destructive/90",
                mode.radius,
                mode.font
              )}
            >
              {"> "}REVOKE
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

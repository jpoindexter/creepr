"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { mode } from "@/design-system";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Mail, MessageSquare, MoreVertical, Edit, Trash2, User } from "lucide-react";

export interface Member {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  bio?: string;
  status?: "online" | "away" | "offline";
  skills?: string[];
  memberSince?: Date | string;
}

export interface MemberCardProps {
  member: Member;
  variant?: "card" | "compact";
  showActions?: boolean;
  onEmail?: (member: Member) => void;
  onMessage?: (member: Member) => void;
  onEdit?: (member: Member) => void;
  onRemove?: (member: Member) => void;
  onViewProfile?: (member: Member) => void;
  className?: string;
}

/* ----- Helper Functions ----- */

const getStatusColor = (status?: "online" | "away" | "offline") => {
  switch (status) {
    case "online":
      return "bg-accent";
    case "away":
      return mode.color.bg.warning;
    case "offline":
      return mode.color.bg.muted;
    default:
      return mode.color.bg.muted;
  }
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const formatMemberSince = (date?: Date | string) => {
  if (!date) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

/* ----- Skeleton Component ----- */

const MemberCardSkeleton = ({ variant = "card" }: { variant?: "card" | "compact" }) => {
  if (variant === "compact") {
    return (
      <div className={cn("bg-card flex items-center gap-4 border p-4", mode.radius)}>
        <div className="relative">
          <div className={cn("bg-muted h-10 w-10 animate-pulse", mode.radius)} />
        </div>
        <div className="flex-1 space-y-2">
          <div className={cn("bg-muted h-4 w-32 animate-pulse", mode.radius)} />
          <div className={cn("bg-muted h-3 w-24 animate-pulse", mode.radius)} />
        </div>
        <div className={cn("bg-muted h-8 w-8 animate-pulse", mode.radius)} />
      </div>
    );
  }

  return (
    <div className={cn("bg-card border p-6", mode.radius)}>
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className={cn("bg-muted h-20 w-20 animate-pulse", mode.radius)} />
        </div>
        <div className="w-full space-y-2">
          <div className={cn("bg-muted mx-auto h-5 w-3/4 animate-pulse", mode.radius)} />
          <div className={cn("bg-muted mx-auto h-4 w-1/2 animate-pulse", mode.radius)} />
          <div className={cn("bg-muted h-3 w-full animate-pulse", mode.radius)} />
          <div className={cn("bg-muted h-3 w-5/6 animate-pulse", mode.radius)} />
        </div>
        <div className="flex gap-2">
          <div className={cn("bg-muted h-9 w-20 animate-pulse", mode.radius)} />
          <div className={cn("bg-muted h-9 w-20 animate-pulse", mode.radius)} />
        </div>
      </div>
    </div>
  );
};

/* ----- Sub-Components ----- */

interface MemberActionsDropdownProps {
  member: Member;
  onViewProfile?: (member: Member) => void;
  onEdit?: (member: Member) => void;
  onRemove?: (member: Member) => void;
  align?: "start" | "center" | "end";
}

function MemberActionsDropdown({
  member,
  onViewProfile,
  onEdit,
  onRemove,
  align = "end",
}: MemberActionsDropdownProps) {
  return (
    <DropdownMenuContent align={align}>
      {onViewProfile && (
        <>
          <DropdownMenuItem onClick={() => onViewProfile(member)}>
            <User className="mr-2 h-4 w-4" />
            View Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </>
      )}
      {onEdit && (
        <DropdownMenuItem onClick={() => onEdit(member)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
      )}
      {onRemove && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onRemove(member)}
            className={cn(mode.color.text.danger, "focus:text-destructive")}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove
          </DropdownMenuItem>
        </>
      )}
    </DropdownMenuContent>
  );
}

interface CompactMemberCardProps {
  member: Member;
  showActions: boolean;
  hasActions: boolean;
  onEmail?: (member: Member) => void;
  onViewProfile?: (member: Member) => void;
  onEdit?: (member: Member) => void;
  onRemove?: (member: Member) => void;
  className?: string;
}

const CompactMemberCard = React.forwardRef<HTMLDivElement, CompactMemberCardProps>(
  (
    {
      member,
      showActions: _showActions,
      hasActions,
      onEmail,
      onViewProfile,
      onEdit,
      onRemove,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          `bg-card flex items-center gap-4 border p-4 transition-all ${mode.state.hover.opacity}`,
          mode.radius,
          className
        )}
        {...props}
      >
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={member.avatar} alt={member.name} />
            <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
          </Avatar>
          {member.status && (
            <div
              className={cn(
                "border-card absolute right-0 bottom-0 h-3 w-3 border",
                mode.radius,
                getStatusColor(member.status)
              )}
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className={cn("text-foreground truncate text-sm font-semibold", mode.font)}>
              {member.name}
            </h4>
            {member.status === "online" && (
              <Badge variant="accent" className="px-2 py-0 text-xs">
                Online
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground truncate text-xs">{member.role}</p>
        </div>

        <div className="flex items-center gap-1">
          {onEmail && (
            <Button variant="ghost" size="sm" onClick={() => onEmail(member)} className="shrink-0">
              <Mail className="h-4 w-4" />
            </Button>
          )}

          {hasActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <MemberActionsDropdown
                member={member}
                onViewProfile={onViewProfile}
                onEdit={onEdit}
                onRemove={onRemove}
              />
            </DropdownMenu>
          )}
        </div>
      </div>
    );
  }
);

CompactMemberCard.displayName = "CompactMemberCard";

interface FullMemberCardProps {
  member: Member;
  showActions: boolean;
  hasActions: boolean;
  onEmail?: (member: Member) => void;
  onMessage?: (member: Member) => void;
  onViewProfile?: (member: Member) => void;
  onEdit?: (member: Member) => void;
  onRemove?: (member: Member) => void;
  className?: string;
}

const FullMemberCard = React.forwardRef<HTMLDivElement, FullMemberCardProps>(
  (
    {
      member,
      showActions: _showActions,
      hasActions,
      onEmail,
      onMessage,
      onViewProfile,
      onEdit,
      onRemove,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          `bg-card border p-6 transition-all ${mode.state.hover.opacity}`,
          mode.radius,
          className
        )}
        {...props}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={member.avatar} alt={member.name} />
              <AvatarFallback className="text-2xl">{getInitials(member.name)}</AvatarFallback>
            </Avatar>
            {member.status && (
              <div
                className={cn(
                  "border-card absolute right-1 bottom-1 h-4 w-4 border",
                  mode.radius,
                  getStatusColor(member.status)
                )}
              />
            )}
          </div>

          <div className="w-full space-y-1 text-center">
            <div className="flex items-center justify-center gap-2">
              <h3 className={cn("text-foreground text-sm font-semibold", mode.font)}>
                {member.name}
              </h3>
              {member.status === "online" && (
                <Badge variant="accent" className="px-2 py-0.5 text-xs">
                  Online
                </Badge>
              )}
            </div>
            <p className="text-primary text-sm font-medium">{member.role}</p>
            {member.bio && <p className="text-muted-foreground mt-2 text-sm">{member.bio}</p>}
            {member.memberSince && (
              <p className="text-muted-foreground text-xs">
                Member since {formatMemberSince(member.memberSince)}
              </p>
            )}
          </div>

          {member.skills && member.skills.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {member.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="px-2 py-1 text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex w-full gap-2">
            {onEmail && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEmail(member)}
                className="flex-1"
              >
                <Mail className="mr-1 h-4 w-4" />
                Email
              </Button>
            )}
            {onMessage && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMessage(member)}
                className="flex-1"
              >
                <MessageSquare className="mr-1 h-4 w-4" />
                Message
              </Button>
            )}
            {!onEmail && !onMessage && hasActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    <MoreVertical className="mr-1 h-4 w-4" />
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <MemberActionsDropdown
                  member={member}
                  onViewProfile={onViewProfile}
                  onEdit={onEdit}
                  onRemove={onRemove}
                  align="center"
                />
              </DropdownMenu>
            )}
          </div>

          {hasActions && (onEmail || onMessage) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="absolute top-2 right-2">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <MemberActionsDropdown
                member={member}
                onViewProfile={onViewProfile}
                onEdit={onEdit}
                onRemove={onRemove}
              />
            </DropdownMenu>
          )}
        </div>
      </div>
    );
  }
);

FullMemberCard.displayName = "FullMemberCard";

const MemberCard = React.forwardRef<HTMLDivElement, MemberCardProps>(
  (
    {
      member,
      variant = "card",
      showActions = true,
      onEmail,
      onMessage,
      onEdit,
      onRemove,
      onViewProfile,
      className,
      ...props
    },
    ref
  ) => {
    const hasActions = showActions && Boolean(onEdit || onRemove || onViewProfile);

    if (variant === "compact") {
      return (
        <CompactMemberCard
          ref={ref}
          member={member}
          showActions={showActions}
          hasActions={hasActions}
          onEmail={onEmail}
          onViewProfile={onViewProfile}
          onEdit={onEdit}
          onRemove={onRemove}
          className={className}
          {...props}
        />
      );
    }

    return (
      <FullMemberCard
        ref={ref}
        member={member}
        showActions={showActions}
        hasActions={hasActions}
        onEmail={onEmail}
        onMessage={onMessage}
        onViewProfile={onViewProfile}
        onEdit={onEdit}
        onRemove={onRemove}
        className={className}
        {...props}
      />
    );
  }
);

MemberCard.displayName = "MemberCard";

export { MemberCard, MemberCardSkeleton };
